import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { getMyBookings, makePayment, createRazorpayOrder, verifyRazorpayPayment } from '../services/api';

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (typeof window !== 'undefined' && window.Razorpay) {
      return resolve(true);
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export default function Payment() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const bookingId = searchParams.get('bookingId');
  const [booking, setBooking] = useState(state?.booking || null);
  const [schedule, setSchedule] = useState(state?.schedule || null);
  const [loadingBooking, setLoadingBooking] = useState(Boolean(bookingId && !state?.booking));
  const [method, setMethod] = useState('razorpay');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('form');
  const [txnId, setTxnId] = useState('');
  const [error, setError] = useState('');
  const [cardForm, setCardForm] = useState({ number: '', expiry: '', cvv: '', name: '' });
  const [upi, setUpi] = useState('');

  useEffect(() => {
    if (!bookingId || state?.booking) return;

    setLoadingBooking(true);
    getMyBookings()
      .then((res) => {
        const matchedBooking = res.data.find(
          (item) => String(item.booking_id) === bookingId && item.status === 'pending'
        );

        if (matchedBooking) {
          setBooking(matchedBooking);
          setSchedule(matchedBooking);
        }
      })
      .catch(() => {})
      .finally(() => setLoadingBooking(false));
  }, [bookingId, state?.booking]);

  if (loadingBooking) {
    return <div className="spinner" style={{ marginTop: '4rem' }} />;
  }

  if (!booking) {
    return (
      <div className="page">
        <div className="empty-state">
          <div className="empty-state-icon">Payment</div>
          <h3>No pending payment</h3>
          <button className="btn btn-primary mt-2" onClick={() => navigate('/dashboard')}>
            Dashboard
          </button>
        </div>
      </div>
    );
  }

  const handleRazorpayPay = async () => {
    setLoading(true);
    setError('');

    try {
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        throw new Error('Razorpay SDK failed to load. Please check your internet connection.');
      }

      const orderRes = await createRazorpayOrder({ booking_id: booking.booking_id });
      const order = orderRes.data;
      const user = JSON.parse(localStorage.getItem('user') || '{}');

      // If backend is in Simulation/Sandbox mode (when keys are not configured yet on Render)
      if (order.is_mock) {
        setStatus('processing');
        const mockPayId = `pay_mock_${Date.now()}`;
        const verifyRes = await verifyRazorpayPayment({
          booking_id: booking.booking_id,
          razorpay_order_id: order.order_id,
          razorpay_payment_id: mockPayId,
          razorpay_signature: 'mock_signature',
        });
        setTxnId(verifyRes.data.transaction_id || mockPayId);
        setBooking((prev) => ({ ...prev, status: 'confirmed', payment_status: 'success' }));
        setStatus('success');
        return;
      }

      // Real Razorpay Checkout popup
      const options = {
        key: order.key_id,
        amount: order.amount,
        currency: order.currency || 'INR',
        name: 'BusMS — Bus Management System',
        description: `Booking #${booking.booking_id} (${schedule?.source || 'Bus'} -> ${schedule?.destination || 'Destination'})`,
        image: 'https://cdn-icons-png.flaticon.com/512/1048/1048314.png',
        order_id: order.order_id,
        handler: async function (response) {
          setStatus('processing');
          try {
            const verifyRes = await verifyRazorpayPayment({
              booking_id: booking.booking_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            setTxnId(verifyRes.data.transaction_id || response.razorpay_payment_id);
            setBooking((prev) => ({ ...prev, status: 'confirmed', payment_status: 'success' }));
            setStatus('success');
          } catch (verErr) {
            setStatus('form');
            setError(verErr.response?.data?.error || 'Payment signature verification failed.');
          } finally {
            setLoading(false);
          }
        },
        prefill: {
          name: user.name || 'Passenger',
          email: user.email || 'passenger@example.com',
          contact: user.phone || '9999999999',
        },
        theme: {
          color: '#1a56db',
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
            setStatus('form');
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (resp) {
        setError(resp.error?.description || 'Payment was declined or cancelled on Razorpay.');
        setLoading(false);
        setStatus('form');
      });
      rzp.open();
    } catch (err) {
      setStatus('form');
      setError(err.response?.data?.error || err.message || 'Failed to initiate Razorpay payment.');
    } finally {
      setLoading(false);
    }
  };

  const handleManualPay = async () => {
    setLoading(true);
    setError('');
    setStatus('processing');
    try {
      const res = await makePayment({ booking_id: booking.booking_id, payment_method: method });
      setTxnId(res.data.transaction_id);
      setBooking((prev) => ({ ...prev, status: 'confirmed', payment_status: 'success' }));
      setStatus('success');
    } catch (err) {
      setStatus('form');
      setError(err.response?.data?.error || 'Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePay = () => {
    if (method === 'razorpay') {
      return handleRazorpayPay();
    }
    return handleManualPay();
  };

  if (status === 'processing') {
    return (
      <div className="page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ width: 64, height: 64, border: '6px solid #e2e8f0', borderTopColor: '#1a56db', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        <h3 style={{ fontWeight: 700 }}>Processing Payment...</h3>
        <p style={{ color: '#64748b' }}>Please do not refresh. Secure transaction in progress.</p>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div style={{ textAlign: 'center', maxWidth: 400 }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>Success</div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.5rem', color: '#10b981' }}>Payment Successful!</h2>
          <p style={{ color: '#64748b', marginBottom: '2rem' }}>Your booking is confirmed. Your ticket is ready.</p>
          <div className="card" style={{ marginBottom: '1.5rem', textAlign: 'left' }}>
            {[['Booking ID', `#${booking.booking_id}`], ['Amount Paid', `Rs ${booking.total_amount}`], ['Transaction ID', txnId], ['Status', 'Confirmed']].map(([label, value]) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.6rem 0', borderBottom: '1px solid #f1f5f9', fontSize: '0.875rem' }}>
                <span style={{ color: '#64748b' }}>{label}</span>
                <span style={{ fontWeight: 700 }}>{value}</span>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
            <button className="btn btn-primary" onClick={() => navigate('/tickets')}>View Ticket</button>
            <button className="btn btn-outline" onClick={() => navigate('/dashboard')}>Dashboard</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Complete Payment</h1>
        <p className="page-sub">Booking #{booking.booking_id} - {schedule?.source} to {schedule?.destination}</p>
      </div>
      {error && (
        <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 10, padding: '0.75rem 1rem', marginBottom: '1rem', color: '#ef4444', fontSize: '0.875rem' }}>
          {error}
        </div>
      )}
      <div className="grid-2" style={{ alignItems: 'start' }}>
        <div className="card">
          <h3 style={{ fontWeight: 700, marginBottom: '1.25rem' }}>Select Payment Method</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
            {[
              ['razorpay', '⚡', 'Razorpay (UPI, Cards, NetBanking)', 'Recommended - Fast & Secure'],
              ['card', '💳', 'Credit / Debit Card (Direct)', 'Visa, Mastercard, RuPay'],
              ['upi', '📱', 'UPI Direct (GPay, PhonePe, Paytm)', 'Instant UPI ID verification'],
              ['netbanking', '🏛️', 'Net Banking', 'All major Indian banks']
            ].map(([value, icon, label, sub]) => (
              <div
                key={value}
                onClick={() => setMethod(value)}
                style={{
                  border: `2px solid ${method === value ? '#1a56db' : '#e2e8f0'}`,
                  borderRadius: 12,
                  padding: '1rem',
                  cursor: 'pointer',
                  background: method === value ? 'rgba(26,86,219,0.04)' : 'white',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  transition: 'all 0.2s',
                }}
              >
                <span style={{ fontSize: '1.4rem' }}>{icon}</span>
                <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{label}</span>
                    {value === 'razorpay' && (
                      <span
                        style={{
                          background: '#10b981',
                          color: 'white',
                          fontSize: '0.65rem',
                          fontWeight: 700,
                          padding: '0.15rem 0.45rem',
                          borderRadius: 9999,
                          letterSpacing: '0.5px',
                        }}
                      >
                        RECOMMENDED
                      </span>
                    )}
                  </div>
                  {sub && <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{sub}</span>}
                </div>
                <div
                  style={{
                    marginLeft: 'auto',
                    width: 18,
                    height: 18,
                    borderRadius: '50%',
                    border: `2px solid ${method === value ? '#1a56db' : '#cbd5e1'}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {method === value && <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#1a56db' }} />}
                </div>
              </div>
            ))}
          </div>

          {method === 'razorpay' && (
            <div
              style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: 12,
                padding: '1.25rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#1e293b', fontWeight: 600, fontSize: '0.9rem' }}>
                <span style={{ color: '#1a56db', fontSize: '1.1rem' }}>🛡️</span>
                Razorpay Checkout
              </div>
              <p style={{ fontSize: '0.825rem', color: '#64748b', margin: 0, lineHeight: 1.5 }}>
                Clicking <strong>Pay Now</strong> will securely open the official Razorpay checkout modal:
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {['Google Pay', 'PhonePe', 'Paytm', 'UPI QR', 'Credit/Debit Cards', 'NetBanking'].map((m) => (
                  <span
                    key={m}
                    style={{
                      background: '#e0e7ff',
                      color: '#3730a3',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      padding: '0.2rem 0.5rem',
                      borderRadius: 6,
                    }}
                  >
                    {m}
                  </span>
                ))}
              </div>
              <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: 0 }}>
                RBI authorized & 256-bit encrypted. Instant ticket confirmation upon payment.
              </p>
            </div>
          )}
          {method === 'card' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              <div className="form-group"><label>Card Number</label><input className="form-control" placeholder="4242 4242 4242 4242" maxLength={19} value={cardForm.number} onChange={(e) => setCardForm({ ...cardForm, number: e.target.value.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim() })} /></div>
              <div className="input-row">
                <div className="form-group"><label>Expiry (MM/YY)</label><input className="form-control" placeholder="12/26" maxLength={5} value={cardForm.expiry} onChange={(e) => setCardForm({ ...cardForm, expiry: e.target.value })} /></div>
                <div className="form-group"><label>CVV</label><input className="form-control" type="password" placeholder="123" maxLength={3} value={cardForm.cvv} onChange={(e) => setCardForm({ ...cardForm, cvv: e.target.value })} /></div>
              </div>
              <div className="form-group"><label>Cardholder Name</label><input className="form-control" placeholder="John Doe" value={cardForm.name} onChange={(e) => setCardForm({ ...cardForm, name: e.target.value })} /></div>
            </div>
          )}
          {method === 'upi' && (
            <div className="form-group"><label>UPI ID</label><input className="form-control" placeholder="yourname@okicici" value={upi} onChange={(e) => setUpi(e.target.value)} /></div>
          )}
          {method === 'netbanking' && (
            <div className="form-group">
              <label>Select Bank</label>
              <select className="form-control">
                {['State Bank of India', 'HDFC Bank', 'ICICI Bank', 'Axis Bank', 'Kotak Mahindra Bank'].map((bank) => <option key={bank}>{bank}</option>)}
              </select>
            </div>
          )}
        </div>

        <div className="card" style={{ position: 'sticky', top: 80 }}>
          <h3 style={{ fontWeight: 700, marginBottom: '1.25rem' }}>Order Summary</h3>
          <div style={{ background: '#f1f5f9', borderRadius: 12, padding: '1rem', marginBottom: '1rem' }}>
            <div style={{ fontWeight: 700, marginBottom: '0.25rem' }}>{schedule?.source} to {schedule?.destination}</div>
            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{schedule?.travel_date && new Date(schedule.travel_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} - {schedule?.departure_time}</div>
            <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.25rem' }}>{schedule?.bus_number} - {schedule?.bus_type}</div>
          </div>
          {[['Seats', `${booking.seats_booked} seat(s)`], ['Subtotal', `Rs ${booking.total_amount}`], ['Service Fee', 'FREE']].map(([label, value]) => (
            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', padding: '0.4rem 0' }}>
              <span style={{ color: '#64748b' }}>{label}</span>
              <span style={{ fontWeight: 600, color: label === 'Service Fee' ? '#10b981' : undefined }}>{value}</span>
            </div>
          ))}
          <div className="divider" style={{ margin: '0.5rem 0' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.2rem', fontWeight: 800, marginBottom: '1rem' }}><span>Total</span><span style={{ color: '#1a56db' }}>Rs {booking.total_amount}</span></div>
          <button className="btn btn-accent btn-xl btn-block" onClick={handlePay} disabled={loading}>
            {loading ? 'Processing...' : method === 'razorpay' ? `Pay with Razorpay · Rs ${booking.total_amount}` : `Pay Rs ${booking.total_amount} Now`}
          </button>
          <p style={{ fontSize: '0.72rem', color: '#94a3b8', textAlign: 'center', marginTop: '0.5rem' }}>256-bit SSL encrypted - 100% Secure</p>
        </div>
      </div>
    </div>
  );
}
