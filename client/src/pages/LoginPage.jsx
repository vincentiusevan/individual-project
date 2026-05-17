import { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router';
import { login, googleLogin, clearError } from '../features/auth/authSlice';

const highlights = ['AI draft advice', 'Saved strategy library', 'Hero and item matchup context'];

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, token } = useSelector((state) => state.auth);
  const googleBtnRef = useRef(null);

  useEffect(() => {
    if (token) navigate('/');
  }, [token, navigate]);

  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  useEffect(() => {
    if (window.google && googleBtnRef.current) {
      window.google.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        callback: (response) => {
          dispatch(googleLogin(response.credential));
        },
      });
      window.google.accounts.id.renderButton(googleBtnRef.current, {
        theme: 'filled_black',
        size: 'large',
        width: '100%',
        text: 'signin_with',
      });
    }
  }, [dispatch]);

  const handleSubmit = (event) => {
    event.preventDefault();
    dispatch(login({ email, password }));
  };

  return (
    <div className="grid min-h-[78vh] items-center gap-8 lg:grid-cols-[0.9fr_1.1fr]">
      <section className="hidden rounded-lg border border-base-300 bg-base-100 p-8 shadow-xl lg:block">
        <div className="badge badge-primary badge-outline">Player workspace</div>
        <h1 className="mt-5 text-4xl font-bold leading-tight text-primary">
          Continue your draft research.
        </h1>
        <p className="mt-4 leading-7 text-gray-300">
          Sign in to generate counter plans, save recommendations, and revisit strategies before
          your next ranked session.
        </p>
        <div className="mt-8 space-y-3">
          {highlights.map((item, index) => (
            <div key={item} className="flex items-center gap-3 rounded-lg bg-base-200 p-3">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-content">
                {index + 1}
              </span>
              <span className="text-sm text-gray-300">{item}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-md rounded-lg bg-base-100 p-6 shadow-xl">
        <div className="mb-6 text-center">
          <p className="text-sm uppercase tracking-wider text-gray-500">Welcome back</p>
          <h2 className="mt-2 text-3xl font-bold text-primary">Login</h2>
        </div>

        {error && (
          <div className="alert alert-error mb-4">
            <span>{Array.isArray(error) ? error.join(', ') : error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="form-control">
            <span className="label-text mb-2">Email</span>
            <input
              type="email"
              placeholder="you@example.com"
              className="input input-bordered w-full"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </label>

          <label className="form-control">
            <span className="label-text mb-2">Password</span>
            <input
              type="password"
              placeholder="Enter your password"
              className="input input-bordered w-full"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </label>

          <button
            type="submit"
            className={`btn btn-primary w-full ${loading ? 'loading' : ''}`}
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="divider">OR</div>
        <div ref={googleBtnRef} className="flex justify-center"></div>

        <p className="mt-5 text-center text-sm text-gray-400">
          Don't have an account?{' '}
          <Link to="/register" className="link link-primary font-semibold">
            Create one
          </Link>
        </p>
      </section>
    </div>
  );
}
