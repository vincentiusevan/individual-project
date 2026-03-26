import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router';
import { fetchHeroes } from '../features/heroes/heroSlice';

export default function HeroListPage() {
  const dispatch = useDispatch();
  const { list, loading } = useSelector((state) => state.heroes);
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');

  const roles = ['Marksman', 'Fighter', 'Assassin', 'Mage', 'Tank', 'Support'];

  useEffect(() => {
    const params = {};
    if (search) params.search = search;
    if (role) params.role = role;
    dispatch(fetchHeroes(params));
  }, [dispatch, search, role]);

  return (
    <div>
      <h1 className="text-3xl font-bold text-primary mb-6">Heroes</h1>

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
