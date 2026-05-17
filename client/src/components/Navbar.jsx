import { Link, NavLink, useNavigate } from 'react-router';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../features/auth/authSlice';

const publicLinks = [
  { to: '/heroes', label: 'Heroes' },
  { to: '/items', label: 'Items' },
];

const privateLinks = [
  { to: '/strategy', label: 'AI Strategy' },
  { to: '/saved', label: 'Saved' },
];

export default function Navbar() {
  const { token, user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const links = token ? [...publicLinks, ...privateLinks] : publicLinks;

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const navClass = ({ isActive }) =>
    isActive ? 'bg-primary text-primary-content font-semibold' : 'hover:bg-base-200';

  return (
    <div className="navbar sticky top-0 z-30 border-b border-base-300 bg-base-100/95 shadow-lg backdrop-blur">
      <div className="navbar-start">
        <div className="dropdown">
          <div tabIndex={0} role="button" className="btn btn-ghost lg:hidden">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h8m-8 6h16"
              />
            </svg>
          </div>
          <ul
            tabIndex={0}
            className="menu menu-sm dropdown-content bg-base-100 rounded-box z-10 mt-3 w-52 p-2 shadow"
          >
            {links.map((item) => (
              <li key={item.to}>
                <NavLink to={item.to} className={navClass}>
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
        <Link to="/" className="btn btn-ghost text-xl font-bold text-primary">
          ML Strategy Lab
        </Link>
      </div>
      <div className="navbar-center hidden lg:flex">
        <ul className="menu menu-horizontal px-1 gap-1">
          {links.map((item) => (
            <li key={item.to}>
              <NavLink to={item.to} className={navClass}>
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </div>
      <div className="navbar-end">
        {token ? (
          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold leading-tight">{user?.username || 'Player'}</p>
              <p className="text-xs text-gray-400">{user?.role || 'member'}</p>
            </div>
            <button onClick={handleLogout} className="btn btn-outline btn-error btn-sm">
              Logout
            </button>
          </div>
        ) : (
          <div className="flex gap-2">
            <Link to="/login" className="btn btn-primary btn-sm">
              Login
            </Link>
            <Link to="/register" className="btn btn-ghost btn-sm">
              Register
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
