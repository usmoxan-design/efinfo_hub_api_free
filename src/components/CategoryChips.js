export default function CategoryChips({ categories, loading, error, activeCategory, onSelect }) {
  if (loading) {
    return (
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            style={{
              width: `${60 + Math.random() * 40}px`,
              height: '32px',
              borderRadius: '16px',
              background: 'var(--secondary)',
              animation: 'pulse 1.5s ease-in-out infinite',
            }}
          />
        ))}
        <style>{`
          @keyframes pulse {
            0%, 100% { opacity: 0.5; }
            50% { opacity: 1; }
          }
        `}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ color: 'var(--destructive)', fontSize: '14px', padding: '8px 0' }}>
        Kategoriyalarni yuklashda xato: {error}
      </div>
    );
  }

  if (!categories || categories.length === 0) return null;

  return (
    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
      <button
        onClick={() => onSelect(null)}
        style={{
          padding: '6px 16px',
          borderRadius: '20px',
          border: '1px solid',
          borderColor: !activeCategory ? 'var(--primary)' : 'var(--border)',
          background: !activeCategory ? 'var(--primary)' : 'transparent',
          color: !activeCategory ? 'var(--primary-foreground)' : 'var(--secondary-foreground)',
          fontSize: '13px',
          fontWeight: 500,
          cursor: 'pointer',
          transition: 'all 0.2s',
          whiteSpace: 'nowrap',
        }}
      >
        Barchasi
      </button>
      {categories.map((cat, i) => {
        const isActive = activeCategory === cat.href;
        return (
          <button
            key={i}
            onClick={() => onSelect(cat.href)}
            style={{
              padding: '6px 16px',
              borderRadius: '20px',
              border: '1px solid',
              borderColor: isActive ? 'var(--primary)' : 'var(--border)',
              background: isActive ? 'var(--primary)' : 'transparent',
              color: isActive ? 'var(--primary-foreground)' : 'var(--secondary-foreground)',
              fontSize: '13px',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.2s',
              whiteSpace: 'nowrap',
            }}
          >
            {cat.name}
          </button>
        );
      })}
    </div>
  );
}
