const SORT_OPTIONS = [
  { value: 'popularity.desc', label: 'Most Popular' },
  { value: 'vote_average.desc', label: 'Top Rated' },
  { value: 'release_date.desc', label: 'Newest' },
  { value: 'release_date.asc', label: 'Oldest' },
  { value: 'title.asc', label: 'Title (A-Z)' },
];

export default function FilterBar({ genres, activeGenre, onGenreChange, sortBy, onSortChange, disabled }) {
  return (
    <div className="filter-bar">
      <div>
        <div className="filter-bar__genres" role="tablist" aria-label="Filter by genre">
          <button
            type="button"
            className={`chip ${!activeGenre ? 'chip--active' : ''}`}
            disabled={disabled}
            onClick={() => onGenreChange(null)}
          >
            All
          </button>
          {genres.map((g) => (
            <button
              key={g.id}
              type="button"
              className={`chip ${String(activeGenre) === String(g.id) ? 'chip--active' : ''}`}
              disabled={disabled}
              onClick={() => onGenreChange(g.id)}
            >
              {g.name}
            </button>
          ))}
        </div>
        {disabled && <p className="filter-bar__hint">Clear the search to use genre and sort filters.</p>}
      </div>
      <select
        className="sort-select"
        value={sortBy}
        onChange={(e) => onSortChange(e.target.value)}
        disabled={disabled}
        aria-label="Sort results"
      >
        {SORT_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
