import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer style={{background:'#0f172a',color:'rgba(255,255,255,0.7)',padding:'3rem 2rem 1.5rem',marginTop:'auto'}}>
      <div style={{display:'grid',gridTemplateColumns:'2fr 1fr 1fr 1fr',gap:'3rem',maxWidth:1200,margin:'0 auto 2rem'}}>
        <div>
          <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:'0.75rem'}}>
            <div style={{width:36,height:36,background:'linear-gradient(135deg,#1a56db,#3b82f6)',borderRadius:10,display:'flex',alignItems:'center',justifyContent:'center'}}>🚌</div>
            <span style={{fontFamily:'Syne,sans-serif',color:'white',fontWeight:800,fontSize:'1.1rem'}}>BusMS</span>
          </div>
          <p style={{fontSize:'0.875rem',lineHeight:1.7}}>Your trusted bus travel companion. Book tickets, manage journeys, and travel comfortably across India.</p>
        </div>
        <div>
          <h4 style={{fontFamily:'Syne,sans-serif',color:'white',fontSize:'0.9rem',marginBottom:'1rem',fontWeight:700}}>Quick Links</h4>
          {[['/','/','Home'],['/search','Search Buses'],['/about','About Us'],['/contact','Contact']].map(([,path,label]) => (
            <Link key={path} to={path} style={{display:'block',color:'rgba(255,255,255,0.6)',fontSize:'0.85rem',marginBottom:'0.5rem',textDecoration:'none'}}>{label}</Link>
          ))}
        </div>
        <div>
          <h4 style={{fontFamily:'Syne,sans-serif',color:'white',fontSize:'0.9rem',marginBottom:'1rem',fontWeight:700}}>Services</h4>
          {['Bus Booking','Route Planning','Seat Selection','Group Booking'].map(s => (
            <div key={s} style={{color:'rgba(255,255,255,0.6)',fontSize:'0.85rem',marginBottom:'0.5rem'}}>{s}</div>
          ))}
        </div>
        <div>
          <h4 style={{fontFamily:'Syne,sans-serif',color:'white',fontSize:'0.9rem',marginBottom:'1rem',fontWeight:700}}>Contact</h4>
          <p style={{fontSize:'0.85rem',lineHeight:2.2}}>📍 Harmony Living Kudasan Gandhinagar, Gujarat 384421<br/>📞 +91 8081266267<br/>✉️ akp2721@gmail.com<br/>🕐 24/7 Support</p>
        </div>
      </div>
      <div style={{borderTop:'1px solid rgba(255,255,255,0.1)',paddingTop:'1.5rem',textAlign:'center',fontSize:'0.8rem',maxWidth:1200,margin:'0 auto'}}>
        © 2024 BusMS — Bus Management System. All rights reserved.
      </div>
    </footer>
  );
}
