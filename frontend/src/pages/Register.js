import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { register } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const { loginUser } = useAuth();
  const navigate = useNavigate();
  const [form, setForm]     = useState({ name:'', email:'', phone:'', password:'', confirm:'' });
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);
  const f = (k,v) => setForm(p=>({...p,[k]:v}));

  const handleSubmit = async (e) => {
    e.preventDefault(); setError('');
    if (form.password !== form.confirm) { setError('Passwords do not match'); return; }
    if (form.password.length < 6) { setError('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      const res = await register({ name:form.name, email:form.email, phone:form.phone, password:form.password });
      loginUser(res.data.user, res.data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{minHeight:'80vh',display:'flex',alignItems:'center',justifyContent:'center',background:'linear-gradient(135deg,#f0f4ff,#e8f4fd)',padding:'2rem'}}>
      <div className="card card-elevated" style={{width:'100%',maxWidth:460,padding:'2.5rem'}}>
        <div style={{textAlign:'center',marginBottom:'2rem'}}>
          <div style={{width:60,height:60,background:'linear-gradient(135deg,#f97316,#fb923c)',borderRadius:16,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1.75rem',margin:'0 auto 1rem'}}>✈️</div>
          <h2 className="page-title">Create Account</h2>
          <p className="page-sub">Join thousands of travelers on BusMS</p>
        </div>
        {error && <div style={{background:'rgba(239,68,68,0.1)',border:'1px solid rgba(239,68,68,0.3)',borderRadius:10,padding:'0.75rem 1rem',marginBottom:'1rem',color:'#ef4444',fontSize:'0.85rem'}}>{error}</div>}
        <form onSubmit={handleSubmit} style={{display:'flex',flexDirection:'column',gap:'1rem'}}>
          <div className="form-group"><label>Full Name *</label><input className="form-control" placeholder="Enter your name" value={form.name} onChange={e=>f('name',e.target.value)} required /></div>
          <div className="input-row">
            <div className="form-group"><label>Email *</label><input className="form-control" type="email" placeholder="Enter your email" value={form.email} onChange={e=>f('email',e.target.value)} required /></div>
            <div className="form-group"><label>Phone</label><input className="form-control" placeholder="xxxxxxxxxx" value={form.phone} onChange={e=>f('phone',e.target.value)} /></div>
          </div>
          <div className="input-row">
            <div className="form-group"><label>Password *</label><input className="form-control" type="password" placeholder="Min 6 chars" value={form.password} onChange={e=>f('password',e.target.value)} required /></div>
            <div className="form-group"><label>Confirm *</label><input className="form-control" type="password" placeholder="Repeat" value={form.confirm} onChange={e=>f('confirm',e.target.value)} required /></div>
          </div>
          <button type="submit" className="btn btn-accent btn-lg btn-block" disabled={loading}>
            {loading ? 'Creating account...' : '🚀 Create Account'}
          </button>
        </form>
        <p style={{textAlign:'center',marginTop:'1.25rem',fontSize:'0.875rem',color:'#64748b'}}>
          Already have an account? <Link to="/login" style={{color:'#1a56db',fontWeight:600}}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}
