export default function FeaturedFilter({ options, loading, value, onChange }) {
  if (loading) {
    return (
      <div
        style={{
          width: '200px',
          height: '38px',
          borderRadius: 'var(--radius)',
          background: 'var(--secondary)',
          animation: 'pulse 1.5s ease-in-out infinite',
        }}
      />
    );
  }

  if (!options || options.length === 0) return null;

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{
        padding: '8px 12px',
        borderRadius: 'var(--radius)',
        border: '1px solid var(--border)',
        background: 'var(--card)',
        color: 'var(--foreground)',
        fontSize: '13px',
        cursor: 'pointer',
        outline: 'none',
        minWidth: '180px',
      }}
    >
      <option value="">Featured Players</option>
      {options.map((opt) => (
        <option key={opt.id} value={opt.id}>
          {opt.name}
        </option>
      ))}
    </select>
  );
}
