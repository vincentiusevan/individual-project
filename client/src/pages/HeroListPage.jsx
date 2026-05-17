import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router';
import { fetchHeroes } from '../features/heroes/heroSlice';

export default function HeroListPage() {
  const dispatch = useDispatch();
  const { list, loading } = useSelector((state) => state.heroes);
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');
  const [lane, setLane] = useState('');

  const roles = ['Marksman', 'Fighter', 'Assassin', 'Mage', 'Tank', 'Support'];
  const lanes = ['Gold Lane', 'EXP Lane', 'Mid Lane', 'Jungle', 'Roam'];

  useEffect(() => {
    const params = {};
    if (search) params.search = search;
    if (role) params.role = role;
    if (lane) params.lane = lane;
    dispatch(fetchHeroes(params));
  }, [dispatch, search, role, lane]);

  return (
    <div>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-primary">Heroes</h1>
          <p className="text-sm text-gray-400 mt-1">
            Find heroes by role, lane, or name before building your draft plan.
          </p>
        </div>
        {!loading && (
          <div className="badge badge-outline badge-lg">
            {list.length} hero{list.length === 1 ? '' : 'es'}
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <input
          type="text"
          placeholder="Search hero..."
          className="input input-bordered w-full max-w-xs"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="select select-bordered"
          value={role}
          onChange={(e) => setRole(e.target.value)}
        >
          <option value="">All Roles</option>
          {roles.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
        <select
          className="select select-bordered"
          value={lane}
          onChange={(e) => setLane(e.target.value)}
        >
          <option value="">All Lanes</option>
          {lanes.map((l) => (
            <option key={l} value={l}>
              {l}
            </option>
          ))}
        </select>
        {(search || role || lane) && (
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => {
              setSearch('');
              setRole('');
              setLane('');
            }}
          >
            Clear
          </button>
        )}
      </div>

      {/* Hero Grid */}
      {loading ? (
        <div className="flex justify-center py-20">
          <span className="loading loading-spinner loading-lg text-primary"></span>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {list.map((hero) => (
            <Link
              to={`/heroes/${hero.id}`}
              key={hero.id}
              className="card bg-base-100 shadow-md hover:shadow-xl hover:scale-105 transition-all duration-200 cursor-pointer"
            >
              <figure className="pt-4 px-4">
                <img
                  src={hero.imageUrl || 'https://via.placeholder.com/100'}
                  alt={hero.name}
                  className="w-20 h-20 rounded-full object-cover"
                />
              </figure>
              <div className="card-body items-center text-center p-3">
                <h3 className="font-bold text-sm">{hero.name}</h3>
                <div className="badge badge-primary badge-sm">{hero.role}</div>
                {hero.lane && <div className="badge badge-ghost badge-xs">{hero.lane}</div>}
              </div>
            </Link>
          ))}
        </div>
      )}

      {!loading && list.length === 0 && (
        <div className="text-center py-20 text-gray-500">
          <p>No heroes found. Admin needs to sync heroes first.</p>
        </div>
      )}
    </div>
  );
}
