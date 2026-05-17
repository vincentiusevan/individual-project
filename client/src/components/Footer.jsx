import { Link } from 'react-router';

export default function Footer() {
  return (
    <footer className="border-t border-base-300 bg-base-100">
      <div className="container mx-auto flex flex-col gap-3 px-4 py-6 text-sm text-gray-400 sm:flex-row sm:items-center sm:justify-between">
        <p>ML Strategy Lab - draft planning, counter picks, and item decisions.</p>
        <div className="flex flex-wrap gap-4">
          <Link to="/heroes" className="link-hover">
            Heroes
          </Link>
          <Link to="/items" className="link-hover">
            Items
          </Link>
          <Link to="/strategy" className="link-hover">
            Strategy
          </Link>
        </div>
      </div>
    </footer>
  );
}
