import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="page state-panel">
      <p>Page not found.</p>
      <Link to="/" className="btn">
        Back to browsing
      </Link>
    </div>
  );
}
