import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router';
import { register, clearError } from '../features/auth/authSlice';

const setupSteps = ['Create your profile', 'Analyze enemy draft', 'Save the best strategy'];

export default function RegisterPage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, token } = useSelector((state) => state.auth);

  useEffect(() => {
    if (token) navigate('/');
  }, [token, navigate]);

  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const result = await dispatch(register({ username, email, password }));
    if (!result.error) {
      navigate('/login');
    }
  };

  return (
    <div className="grid min-h-[78vh] items-center gap-8 lg:grid-cols-[1.1fr_0.9fr]">
      <section className="mx-auto w-full max-w-md rounded-lg bg-base-100 p-6 shadow-xl">
        <div className="mb-6 text-center">
          <p className="text-sm uppercase tracking-wider text-gray-500">Start planning</p>
          <h2 className="mt-2 text-3xl font-bold text-primary">Create Account</h2>
        </div>

        {error && (
          <div className="alert alert-error mb-4">
            <span>{Array.isArray(error) ? error.join(', ') : error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="form-control">
            <span className="label-text mb-2">Username</span>
            <input
              type="text"
              placeholder="Your display name"
              className="input input-bordered w-full"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              required
            />
          </label>

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
              placeholder="Min 6 characters"
              className="input input-bordered w-full"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              minLength={6}
              required
            />
          </label>

          <button
            type="submit"
            className={`btn btn-primary w-full ${loading ? 'loading' : ''}`}
            disabled={loading}
          >
            {loading ? 'Creating account...' : 'Register'}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-gray-400">
          Already have an account?{' '}
          <Link to="/login" className="link link-primary font-semibold">
            Login
          </Link>
        </p>
      </section>

      <section className="hidden rounded-lg border border-base-300 bg-base-100 p-8 shadow-xl lg:block">
        <div className="badge badge-secondary badge-outline">Portfolio mode</div>
        <h1 className="mt-5 text-4xl font-bold leading-tight text-primary">
          Build a cleaner way to prepare picks.
        </h1>
        <p className="mt-4 leading-7 text-gray-300">
          ML Strategy Lab keeps the flow focused: choose enemies, read counter logic, and store
          recommendations for later review.
        </p>
        <div className="mt-8 space-y-3">
          {setupSteps.map((item, index) => (
            <div key={item} className="flex items-center gap-3 rounded-lg bg-base-200 p-3">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-secondary text-sm font-bold text-secondary-content">
                {index + 1}
              </span>
              <span className="text-sm text-gray-300">{item}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
