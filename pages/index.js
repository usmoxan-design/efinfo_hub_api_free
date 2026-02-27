import { useState, useEffect, useCallback } from 'react';
import Header from '@/components/Header';
import CategoryChips from '@/components/CategoryChips';
import FeaturedFilter from '@/components/FeaturedFilter';
import PlayerTable from '@/components/PlayerTable';
import PlayerModal from '@/components/PlayerModal';

export default function Home() {
  // Data states
  const [categories, setCategories] = useState([]);
  const [featuredOptions, setFeaturedOptions] = useState([]);
  const [players, setPlayers] = useState([]);

  // Loading states
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingFeatured, setLoadingFeatured] = useState(true);
  const [loadingPlayers, setLoadingPlayers] = useState(true);

  // Error states
  const [errorCategories, setErrorCategories] = useState(null);
  const [errorPlayers, setErrorPlayers] = useState(null);

  // Filter states
  const [activeCategory, setActiveCategory] = useState(null);
  const [featuredValue, setFeaturedValue] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Player detail modal
  const [selectedPlayerId, setSelectedPlayerId] = useState(null);

  // Page state
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch categories
  useEffect(() => {
    fetch('/api/categories')
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        setCategories(data.categories || data || []);
      })
      .catch((err) => setErrorCategories(err.message))
      .finally(() => setLoadingCategories(false));
  }, []);

  // Fetch featured options
  useEffect(() => {
    fetch('/api/featured-options')
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => setFeaturedOptions(data || []))
      .catch(() => {})
      .finally(() => setLoadingFeatured(false));
  }, []);

  // Fetch players
  const fetchPlayers = useCallback(() => {
    setLoadingPlayers(true);
    setErrorPlayers(null);

    const params = new URLSearchParams();
    if (currentPage > 1) params.set('page', currentPage);
    if (featuredValue) params.set('featured', featuredValue);
    if (activeCategory) params.set('url', `https://pesdb.net/efootball/${activeCategory}`);

    const queryString = params.toString();
    const url = `/api/players${queryString ? `?${queryString}` : ''}`;

    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        setPlayers(data.players || data || []);
      })
      .catch((err) => setErrorPlayers(err.message))
      .finally(() => setLoadingPlayers(false));
  }, [currentPage, featuredValue, activeCategory]);

  useEffect(() => {
    fetchPlayers();
  }, [fetchPlayers]);

  // Category change handler
  const handleCategoryChange = (href) => {
    setActiveCategory(href);
    setCurrentPage(1);
  };

  // Featured change handler
  const handleFeaturedChange = (val) => {
    setFeaturedValue(val);
    setCurrentPage(1);
  };

  // Filtered players by local search
  const filteredPlayers = searchTerm
    ? players.filter(
        (p) =>
          p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.team?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.club?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.nationality?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : players;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--background)' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px 24px 60px' }}>
        <Header playerCount={filteredPlayers.length} />

        {/* Filters section */}
        <div
          style={{
            background: 'var(--card)',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            padding: '20px',
            marginBottom: '20px',
          }}
        >
          {/* Search and featured filter row */}
          <div
            style={{
              display: 'flex',
              gap: '12px',
              marginBottom: '16px',
              flexWrap: 'wrap',
              alignItems: 'center',
            }}
          >
            {/* Search input */}
            <div style={{ flex: '1 1 280px', position: 'relative' }}>
              <span
                style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--muted-foreground)',
                  fontSize: '14px',
                  pointerEvents: 'none',
                }}
              >
                {'::'}
              </span>
              <input
                type="text"
                placeholder="O'yinchi, jamoa, klub qidirish..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px 10px 36px',
                  borderRadius: 'var(--radius)',
                  border: '1px solid var(--border)',
                  background: 'var(--background)',
                  color: 'var(--foreground)',
                  fontSize: '14px',
                  outline: 'none',
                }}
              />
            </div>
            <FeaturedFilter
              options={featuredOptions}
              loading={loadingFeatured}
              value={featuredValue}
              onChange={handleFeaturedChange}
            />
          </div>

          {/* Category chips */}
          <CategoryChips
            categories={categories}
            loading={loadingCategories}
            error={errorCategories}
            activeCategory={activeCategory}
            onSelect={handleCategoryChange}
          />
        </div>

        {/* Player table */}
        <PlayerTable
          players={filteredPlayers}
          loading={loadingPlayers}
          error={errorPlayers}
          onPlayerClick={(id) => setSelectedPlayerId(id)}
        />

        {/* Pagination */}
        {!loadingPlayers && players.length > 0 && (
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '8px',
              marginTop: '20px',
              alignItems: 'center',
            }}
          >
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage <= 1}
              style={{
                padding: '8px 20px',
                borderRadius: 'var(--radius)',
                border: '1px solid var(--border)',
                background: currentPage <= 1 ? 'var(--secondary)' : 'var(--card)',
                color: currentPage <= 1 ? 'var(--muted-foreground)' : 'var(--foreground)',
                cursor: currentPage <= 1 ? 'not-allowed' : 'pointer',
                fontSize: '13px',
                fontWeight: 500,
              }}
            >
              Oldingi
            </button>
            <span
              style={{
                padding: '8px 16px',
                background: 'var(--primary)',
                color: 'var(--primary-foreground)',
                borderRadius: 'var(--radius)',
                fontWeight: 700,
                fontSize: '13px',
                minWidth: '40px',
                textAlign: 'center',
              }}
            >
              {currentPage}
            </span>
            <button
              onClick={() => setCurrentPage((p) => p + 1)}
              style={{
                padding: '8px 20px',
                borderRadius: 'var(--radius)',
                border: '1px solid var(--border)',
                background: 'var(--card)',
                color: 'var(--foreground)',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: 500,
              }}
            >
              Keyingi
            </button>
          </div>
        )}
      </div>

      {/* Player detail modal */}
      <PlayerModal
        playerId={selectedPlayerId}
        onClose={() => setSelectedPlayerId(null)}
      />
    </div>
  );
}
