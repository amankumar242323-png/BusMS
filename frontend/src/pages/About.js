export default function About() {
  return (
    <div>
      <div style={{background:'linear-gradient(135deg,#0f172a,#1a3a6b)',color:'white',padding:'4rem 2rem',textAlign:'center'}}>
        <h1 style={{fontSize:'2.5rem',fontWeight:800,marginBottom:'1rem'}}>About BusMS</h1>
        <p style={{fontSize:'1.1rem',opacity:0.8,maxWidth:600,margin:'0 auto'}}>India's most trusted bus management and booking platform.</p>
      </div>
      <div className="page">
        <div className="grid-2" style={{marginBottom:'3rem',alignItems:'center',gap:'3rem'}}>
          <div>
            <h2 style={{fontSize:'1.75rem',fontWeight:800,marginBottom:'1rem'}}>Our <span style={{color:'#1a56db'}}>Mission</span></h2>
            <p style={{color:'#64748b',lineHeight:1.8,marginBottom:'1rem'}}>We believe every journey should be comfortable, affordable, and hassle-free. BusMS was founded to revolutionize how people book and manage bus travel across India.</p>
            <p style={{color:'#64748b',lineHeight:1.8}}>From real-time seat selection to instant digital tickets, we've built everything you need to travel smarter.</p>
          </div>
          <div className="grid-2">
            {[['🌍','Founded 2026'],['🚌','500+ Routes'],['👥','5M+ Users'],['⭐','4.8 Rating']].map(([icon,text])=>(
              <div key={text} className="card" style={{textAlign:'center'}}>
                <div style={{fontSize:'2rem',marginBottom:'0.5rem'}}>{icon}</div>
                <div style={{fontWeight:700}}>{text}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={{textAlign:'center',marginBottom:'2rem'}}>
          <h2 style={{fontSize:'1.75rem',fontWeight:800,marginBottom:'0.5rem'}}>Our Team</h2>
          <p style={{color:'#64748b'}}>Passionate people building the future of travel</p>
        </div>
        <div className="grid-3">
          {[{name:'ABHISHEK YADAV',emoji:'👨‍💼'},{name:'NANDINI KANAUJIYA',emoji:'👩‍💻'},{name:'RADHIKA VERMA',emoji:'👩‍💻'},,{name:'AMAN KUMAR',emoji:'👨‍✈️'},,{name:'SHRAIYANSH CHAWARE',emoji:'👨‍✈️'}].map(m=>(
            <div key={m.name} className="card" style={{textAlign:'center',padding:'2rem'}}>
              <div style={{fontSize:'3rem',marginBottom:'0.75rem'}}>{m.emoji}</div>
              <h3 style={{fontWeight:700,marginBottom:'0.25rem'}}>{m.name}</h3>
              <p style={{color:'#1a56db',fontSize:'0.875rem',fontWeight:500}}>{m.role}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
