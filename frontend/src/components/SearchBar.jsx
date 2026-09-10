export default function SearchBar({ value, onChange }) {
  return (
    <div className="search-bar">
      <span className="search-bar__icon">🔍</span>
      <input
        type="search"
        placeholder="Search movies by title..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label="Search movies"
      />
    </div>
  );
}
