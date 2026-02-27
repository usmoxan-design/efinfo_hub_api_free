import { useState, useEffect } from 'react';

function StatBar({ label, value, max = 99 }) {
  const pct = Math.min((value / max) * 100, 100);
  let barColor = 'var(--muted-foreground)';
  if (value >= 90) barColor = '#22c55e';
  else if (value >= 80) barColor = '#3b82f6';
  else if (value >= 70) barColor = '#eab308';
  else if (value >= 50) barColor = '#f97316';
  else barColor = '#ef4444';

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
      <span style={{ width: '140px', color: 'var(--secondary-foreground)', textTransform: 'capitalize', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
        {label.replace(/_/g, ' ')}
      </span>
      <span style={{ width: '28px', textAlign: 'right', fontWeight: 700, color: 'var(--foreground)' }}>
        {value}
      </span>
      <div style={{ flex: 1, height: '6px', borderRadius: '3px', background: 'var(--secondary)', overflow: 'hidden' }}>
        <div
          style={{
            width: `${pct}%`,
            height: '100%',
            borderRadius: '3px',
            background: barColor,
            transition: 'width 0.5s ease',
          }}
        />
      </div>
    </div>
  );
}

export default function PlayerModal({ playerId, onClose }) {
  const [player, setPlayer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!playerId) return;
    setLoading(true);
    setError(null);

    fetch(`/api/player/${playerId}`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        setPlayer(data);
      })
      .catch((err) => {
        setError(err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [playerId]);

  if (!playerId) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.7)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '20px',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'var(--card)',
          border: '1px solid var(--border)',
          borderRadius: '12px',
          width: '100%',
          maxWidth: '640px',
          maxHeight: '85vh',
          overflowY: 'auto',
          padding: '28px',
        }}
      >
        {/* Close button */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '8px' }}>
          <button
            onClick={onClose}
            style={{
              background: 'var(--secondary)',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'var(--muted-foreground)',
              fontSize: '18px',
            }}
            aria-label="Yopish"
          >
            {'x'}
          </button>
        </div>

        {loading && (
          <div style={{ padding: '40px', textAlign: 'center' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                border: '3px solid var(--border)',
                borderTop: '3px solid var(--primary)',
                borderRadius: '50%',
                animation: 'spin 0.8s linear infinite',
                margin: '0 auto 16px',
              }}
            />
            <p style={{ color: 'var(--muted-foreground)', fontSize: '14px' }}>Yuklanmoqda...</p>
            <style>{`
              @keyframes spin {
                to { transform: rotate(360deg); }
              }
            `}</style>
          </div>
        )}

        {error && (
          <div style={{ padding: '40px', textAlign: 'center' }}>
            <p style={{ color: 'var(--destructive)', fontSize: '15px' }}>Xato: {error}</p>
          </div>
        )}

        {!loading && !error && player && (
          <>
            {/* Player name & position */}
            <div style={{ marginBottom: '24px' }}>
              <h2 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--foreground)', lineHeight: 1.2 }}>
                {player.name || `O'yinchi #${player.id}`}
              </h2>
              {player.info?.position && (
                <span
                  style={{
                    display: 'inline-block',
                    marginTop: '8px',
                    padding: '4px 12px',
                    borderRadius: '6px',
                    background: 'var(--primary)',
                    color: 'var(--primary-foreground)',
                    fontSize: '12px',
                    fontWeight: 600,
                  }}
                >
                  {player.info.position}
                </span>
              )}
            </div>

            {/* Info section */}
            {player.info && Object.keys(player.info).length > 0 && (
              <div style={{ marginBottom: '24px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--muted-foreground)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  {"Ma'lumotlar"}
                </h3>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                    gap: '8px',
                  }}
                >
                  {Object.entries(player.info).map(([key, val]) => (
                    <div
                      key={key}
                      style={{
                        padding: '10px 14px',
                        background: 'var(--secondary)',
                        borderRadius: '8px',
                      }}
                    >
                      <div style={{ fontSize: '11px', color: 'var(--muted-foreground)', textTransform: 'capitalize', marginBottom: '2px' }}>
                        {key.replace(/_/g, ' ')}
                      </div>
                      <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--foreground)' }}>
                        {val}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Stats */}
            {player.stats && Object.keys(player.stats).length > 0 && (
              <div style={{ marginBottom: '24px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--muted-foreground)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Statistika
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {Object.entries(player.stats).map(([key, val]) => (
                    <StatBar key={key} label={key} value={val} />
                  ))}
                </div>
              </div>
            )}

            {/* Skills */}
            {player.skills && player.skills.length > 0 && (
              <div style={{ marginBottom: '24px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--muted-foreground)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  {"Ko'nikmalar"}
                </h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {player.skills.map((skill, i) => (
                    <span
                      key={i}
                      style={{
                        padding: '4px 12px',
                        borderRadius: '16px',
                        background: 'var(--secondary)',
                        border: '1px solid var(--border)',
                        fontSize: '12px',
                        color: 'var(--secondary-foreground)',
                      }}
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Playing styles */}
            {player.playing_styles && player.playing_styles.length > 0 && (
              <div>
                <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--muted-foreground)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  {"O'yin uslublari"}
                </h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {player.playing_styles.map((style, i) => (
                    <span
                      key={i}
                      style={{
                        padding: '4px 12px',
                        borderRadius: '16px',
                        background: '#22c55e20',
                        border: '1px solid #22c55e40',
                        fontSize: '12px',
                        color: '#22c55e',
                        fontWeight: 500,
                      }}
                    >
                      {style}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
