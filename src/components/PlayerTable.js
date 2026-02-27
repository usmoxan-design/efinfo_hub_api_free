function RatingBadge({ rating }) {
  const num = parseInt(rating, 10);
  let bgColor = 'var(--secondary)';
  let textColor = 'var(--foreground)';

  if (num >= 90) {
    bgColor = '#22c55e';
    textColor = '#0a0f1a';
  } else if (num >= 80) {
    bgColor = '#3b82f6';
    textColor = '#fff';
  } else if (num >= 70) {
    bgColor = '#eab308';
    textColor = '#0a0f1a';
  }

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: '36px',
        padding: '2px 8px',
        borderRadius: '6px',
        background: bgColor,
        color: textColor,
        fontWeight: 700,
        fontSize: '13px',
      }}
    >
      {rating || '-'}
    </span>
  );
}

function PositionBadge({ position }) {
  const posColors = {
    CF: '#ef4444',
    SS: '#f97316',
    LWF: '#f97316',
    RWF: '#f97316',
    AMF: '#eab308',
    CMF: '#22c55e',
    DMF: '#3b82f6',
    LMF: '#22c55e',
    RMF: '#22c55e',
    LB: '#8b5cf6',
    RB: '#8b5cf6',
    CB: '#6366f1',
    GK: '#ec4899',
  };

  const color = posColors[position] || 'var(--muted-foreground)';

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2px 8px',
        borderRadius: '6px',
        background: `${color}20`,
        color: color,
        fontWeight: 600,
        fontSize: '12px',
        letterSpacing: '0.5px',
      }}
    >
      {position || '-'}
    </span>
  );
}

export default function PlayerTable({ players, loading, error, onPlayerClick }) {
  if (loading) {
    return (
      <div style={{ borderRadius: 'var(--radius)', overflow: 'hidden', border: '1px solid var(--border)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'var(--secondary)' }}>
              {['Pozitsiya', 'Ism', 'Jamoa', 'Klub', 'Millat', 'Uslub', 'Reyting'].map((h) => (
                <th
                  key={h}
                  style={{
                    padding: '12px 16px',
                    textAlign: 'left',
                    fontSize: '12px',
                    fontWeight: 600,
                    color: 'var(--muted-foreground)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 10 }).map((_, i) => (
              <tr key={i}>
                {Array.from({ length: 7 }).map((__, j) => (
                  <td key={j} style={{ padding: '14px 16px' }}>
                    <div
                      style={{
                        width: j === 1 ? '120px' : '60px',
                        height: '16px',
                        borderRadius: '4px',
                        background: 'var(--secondary)',
                        animation: 'pulse 1.5s ease-in-out infinite',
                        animationDelay: `${i * 0.05}s`,
                      }}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        <style>{`
          @keyframes pulse {
            0%, 100% { opacity: 0.4; }
            50% { opacity: 0.8; }
          }
        `}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          padding: '40px',
          textAlign: 'center',
          background: 'var(--card)',
          borderRadius: 'var(--radius)',
          border: '1px solid var(--border)',
        }}
      >
        <div style={{ fontSize: '40px', marginBottom: '16px' }}>!</div>
        <p style={{ color: 'var(--destructive)', fontSize: '16px', fontWeight: 500 }}>
          {"O'yinchilarni yuklashda xato yuz berdi"}
        </p>
        <p style={{ color: 'var(--muted-foreground)', fontSize: '14px', marginTop: '8px' }}>{error}</p>
      </div>
    );
  }

  if (!players || players.length === 0) {
    return (
      <div
        style={{
          padding: '60px 40px',
          textAlign: 'center',
          background: 'var(--card)',
          borderRadius: 'var(--radius)',
          border: '1px solid var(--border)',
        }}
      >
        <p style={{ color: 'var(--muted-foreground)', fontSize: '16px' }}>
          {"O'yinchilar topilmadi"}
        </p>
      </div>
    );
  }

  return (
    <div style={{ borderRadius: 'var(--radius)', overflow: 'hidden', border: '1px solid var(--border)' }}>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '700px' }}>
          <thead>
            <tr style={{ background: 'var(--secondary)' }}>
              {['Pozitsiya', 'Ism', 'Jamoa', 'Klub', 'Millat', 'Uslub', 'Reyting'].map((h) => (
                <th
                  key={h}
                  style={{
                    padding: '12px 16px',
                    textAlign: h === 'Reyting' ? 'center' : 'left',
                    fontSize: '11px',
                    fontWeight: 600,
                    color: 'var(--muted-foreground)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.8px',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {players.map((player, index) => (
              <tr
                key={player.id || index}
                onClick={() => onPlayerClick && onPlayerClick(player.id)}
                style={{
                  borderTop: '1px solid var(--border)',
                  background: index % 2 === 0 ? 'var(--card)' : 'transparent',
                  cursor: onPlayerClick ? 'pointer' : 'default',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'var(--secondary)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = index % 2 === 0 ? 'var(--card)' : 'transparent';
                }}
              >
                <td style={{ padding: '12px 16px' }}>
                  <PositionBadge position={player.position} />
                </td>
                <td style={{ padding: '12px 16px', fontWeight: 600, fontSize: '14px', color: 'var(--foreground)', whiteSpace: 'nowrap' }}>
                  {player.name}
                </td>
                <td style={{ padding: '12px 16px', fontSize: '13px', color: 'var(--secondary-foreground)' }}>
                  {player.team || '-'}
                </td>
                <td style={{ padding: '12px 16px', fontSize: '13px', color: 'var(--secondary-foreground)' }}>
                  {player.club || '-'}
                </td>
                <td style={{ padding: '12px 16px', fontSize: '13px', color: 'var(--secondary-foreground)' }}>
                  {player.nationality || '-'}
                </td>
                <td style={{ padding: '12px 16px', fontSize: '13px', color: 'var(--secondary-foreground)' }}>
                  {player.playing_style || '-'}
                </td>
                <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                  <RatingBadge rating={player.rating} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
