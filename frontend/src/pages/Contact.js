import { useState } from 'react';

export default function Contact() {
  const [form, setForm] = useState({ name:'', email:'', subject:'', message:'' });
  const [sent, setSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setTimeout(() => setSent(true), 800);
  };

  return (
    <div className="page">
      <div className="page-header" style={{textAlign:'center',marginBottom:'3rem'}}>
        <h1 className="page-title" style={{fontSize:'2.25rem'}}>📞 Contact Us</h1>
        <p className="page-sub">We're here to help. Reach out anytime.</p>
      </div>
      <div className="grid-2" style={{alignItems:'start',gap:'3rem'}}>
        <div>
          <h2 style={{fontWeight:800,fontSize:'1.4rem',marginBottom:'1.5rem'}}>Get in Touch</h2>
          {[['📍','Address','BusMS HQ, Harmony Living Kudasan Gandhinagar, Gujarat - 384421'],['📞','Phone','+91 8081266267 (24/7 Support)'],['✉️','Email','akp2721@gmail.com'],['🕐','Hours','Available 24/7 · 365 days']].map(([icon,label,value])=>(
            <div key={label} style={{display:'flex',gap:'1rem',padding:'1rem',background:'#f1f5f9',borderRadius:12,marginBottom:'0.75rem'}}>
              <span style={{fontSize:'1.4rem'}}>{icon}</span>
              <div><div style={{fontWeight:700,fontSize:'0.875rem',marginBottom:'0.2rem'}}>{label}</div><div style={{color:'#64748b',fontSize:'0.875rem'}}>{value}</div></div>
            </div>
          ))}
        </div>
        {sent ? (
          <div className="card" style={{textAlign:'center',padding:'3rem'}}>
            <div style={{fontSize:'3rem',marginBottom:'1rem'}}>✅</div>
            <h3 style={{fontWeight:800,marginBottom:'0.5rem'}}>Message Sent!</h3>
            <p style={{color:'#64748b',marginBottom:'1rem'}}>We'll get back to you within 24 hours.</p>
            <button className="btn btn-primary" onClick={()=>setSent(false)}>Send Another</button>
          </div>
        ) : (
          <div className="card">
            <h3 style={{fontWeight:700,marginBottom:'1.5rem'}}>Send a Message</h3>
            <form onSubmit={handleSubmit} style={{display:'flex',flexDirection:'column',gap:'1rem'}}>
              <div className="input-row">
                <div className="form-group"><label>Name *</label><input className="form-control" placeholder="Your name" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} required /></div>
                <div className="form-group"><label>Email *</label><input className="form-control" type="email" placeholder="your@email.com" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} required /></div>
              </div>
              <div className="form-group"><label>Subject</label><input className="form-control" placeholder="How can we help?" value={form.subject} onChange={e=>setForm({...form,subject:e.target.value})} /></div>
              <div className="form-group"><label>Message *</label><textarea className="form-control" rows={4} placeholder="Describe your issue..." value={form.message} onChange={e=>setForm({...form,message:e.target.value})} style={{resize:'vertical'}} required /></div>
              <button type="submit" className="btn btn-primary btn-lg btn-block">📤 Send Message</button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
