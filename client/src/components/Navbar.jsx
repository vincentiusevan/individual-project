import { Link, useNavigate } from 'react-router';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../features/auth/authSlice';

export default function Navbar() {
  const { token, user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <div className="navbar bg-base-100 shadow-lg">
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
            <li>
              <Link to="/heroes">Heroes</Link>
            </li>
            <li>
              <Link to="/items">Items</Link>
            </li>
            {token && (
              <li>
                <Link to="/strategy">AI Strategy</Link>
              </li>
            )}
            {token && (
              <li>
                <Link to="/saved">Saved</Link>
              </li>
            )}
          </ul>
        </div>
        <Link to="/" className="btn btn-ghost text-xl font-bold text-primary">
          ML Strategy Lab
        </Link>
      </div>
      <div className="navbar-center hidden lg:flex">
        <ul className="menu menu-horizontal px-1 gap-1">
          <li>
            <Link to="/heroes">Heroes</Link>
          </li>
          <li>
            <Link to="/items">Items</Link>
          </li>
          {token && (
            <li>
              <Link to="/strategy">AI Strategy</Link>
            </li>
          )}
          {token && (
            <li>
              <Link to="/saved">Saved</Link>
            </li>
          )}
        </ul>
      </div>
      <div className="navbar-end">
        {token ? (
          <div className="flex items-center gap-3">
            <span className="text-sm">{user?.username}</span>
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
