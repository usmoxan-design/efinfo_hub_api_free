export default function Header({ playerCount }) {
  return (
    <header
      style={{
        borderBottom: '1px solid var(--border)',
        padding: '16px 0',
        marginBottom: '24px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '18px',
              color: 'var(--primary-foreground)',
            }}
          >
            {'eF'}
          </div>
          <div>
            <h1 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--foreground)', lineHeight: 1.2 }}>
              eFootball Hub
            </h1>
            <p style={{ fontSize: '13px', color: 'var(--muted-foreground)', lineHeight: 1.3 }}>
              Player Database & Stats
            </p>
          </div>
        </div>
        {typeof playerCount === 'number' && (
          <div
            style={{
              fontSize: '13px',
              color: 'var(--secondary-foreground)',
              background: 'var(--secondary)',
              padding: '6px 14px',
              borderRadius: '20px',
              border: '1px solid var(--border)',
            }}
          >
            <span style={{ color: 'var(--primary)', fontWeight: 600 }}>{playerCount}</span>{' '}
            {'o\'yinchi topildi'}
          </div>
        )}
      </div>
    </header>
  );
}
