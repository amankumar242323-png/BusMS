export default function SeatSelector({ capacity = 40, bookedSeats = [], selectedSeats = [], onSelect }) {
  const rows = Math.ceil(capacity / 4);

  return (
    <div>
      {/* Legend */}
      <div style={{display:'flex',gap:'1rem',marginBottom:'1rem',fontSize:'0.8rem',flexWrap:'wrap'}}>
        {[['#f1f5f9','#cbd5e1','Available'],['#1a56db','#1a56db','Selected'],['#e2e8f0','#e2e8f0','Booked']].map(([bg,border,label]) => (
          <div key={label} style={{display:'flex',alignItems:'center',gap:6}}>
            <div style={{width:18,height:18,borderRadius:4,background:bg,border:`2px solid ${border}`}}></div>
            <span style={{color:'#64748b'}}>{label}</span>
          </div>
        ))}
      </div>

      {/* Seat Grid */}
      <div style={{display:'flex',gap:8,justifyContent:'center',overflowX:'auto',paddingBottom:'0.5rem'}}>
        {Array.from({ length: rows }).map((_, row) => (
          <div key={row} style={{display:'flex',flexDirection:'column',gap:6}}>
            {[0, 1, null, 2, 3].map((col, i) => {
              if (col === null) return <div key="aisle" style={{height:42,width:8}} />;
              const seatNum = row * 4 + col + 1;
              if (seatNum > capacity) return <div key={i} style={{width:42,height:42}} />;
              const isBooked   = bookedSeats.includes(seatNum);
              const isSelected = selectedSeats.includes(seatNum);
              return (
                <button key={i} disabled={isBooked}
                  onClick={() => !isBooked && onSelect(seatNum)}
                  title={`Seat ${seatNum}`}
                  style={{
                    width: 42, height: 42,
                    borderRadius: '8px 8px 4px 4px',
                    border: `2px solid ${isBooked?'#e2e8f0':isSelected?'#1a56db':'#cbd5e1'}`,
                    background: isBooked?'#e2e8f0':isSelected?'#1a56db':'#f1f5f9',
                    color: isBooked?'#94a3b8':isSelected?'white':'#64748b',
                    fontSize: '0.7rem', fontWeight: 700,
                    cursor: isBooked ? 'not-allowed' : 'pointer',
                    transition: 'all 0.15s',
                  }}>
                  {seatNum}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      <div style={{textAlign:'center',fontSize:'0.8rem',color:'#64748b',marginTop:'0.75rem'}}>🚌 Front of bus</div>
    </div>
  );
}
