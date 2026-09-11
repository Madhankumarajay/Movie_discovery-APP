import { NavLink } from 'react-router-dom';
import { useWishlist } from '../context/WishlistContext.jsx';

export default function Navbar() {
  const { items } = useWishlist();

  return (
    <header className="navbar">
      <NavLink to="/" className="navbar__brand">
        MOVIES FROM TMDB WEB
      </NavLink>
      <nav className="navbar__links">
        <NavLink to="/" end className={({ isActive }) => (isActive ? 'active' : '')}>
          Browse
        </NavLink>
        <NavLink to="/wishlist" className={({ isActive }) => (isActive ? 'active' : '')}>
          Wishlist{items.length > 0 ? ` (${items.length})` : ''}
        </NavLink>
      </nav>
    </header>
  );
}
