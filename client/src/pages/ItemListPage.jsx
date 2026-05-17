import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchItems } from '../features/items/itemSlice';

const types = ['attack', 'magic', 'defense', 'movement'];

const typeColors = {
  attack: 'badge-error',
  magic: 'badge-primary',
  defense: 'badge-success',
  movement: 'badge-warning',
};

function getItemTags(item) {
  const text = `${item.name} ${item.description || ''} ${item.passive || ''}`.toLowerCase();
  const tags = [];

  if (text.includes('lifesteal') || text.includes('regen') || text.includes('heal')) {
    tags.push('Sustain');
  }
  if (text.includes('shield')) tags.push('Anti Shield');
  if (text.includes('magic defense') || text.includes('magic resistance')) tags.push('Vs Magic');
  if (text.includes('physical defense') || text.includes('armor')) tags.push('Vs Physical');
  if (text.includes('penetration') || text.includes('reduce defense')) tags.push('Tank Breaker');
  if (text.includes('slow') || text.includes('movement speed')) tags.push('Mobility Control');
  if (text.includes('critical') || text.includes('burst')) tags.push('Burst Damage');

  if (tags.length === 0) {
    if (item.type === 'defense') tags.push('Survivability');
    if (item.type === 'movement') tags.push('Rotation');
    if (item.type === 'attack') tags.push('Physical Damage');
    if (item.type === 'magic') tags.push('Magic Damage');
  }

  return tags.slice(0, 3);
}

function formatStatName(key) {
  return key.replace(/([A-Z])/g, ' $1').replace(/^./, (char) => char.toUpperCase());
}

export default function ItemListPage() {
  const dispatch = useDispatch();
  const { list, loading } = useSelector((state) => state.items);
  const [search, setSearch] = useState('');
  const [type, setType] = useState('');

  useEffect(() => {
    const params = {};
    if (search) params.search = search;
    if (type) params.type = type;
    dispatch(fetchItems(params));
  }, [dispatch, search, type]);

  return (
    <div>
      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary">Items</h1>
          <p className="mt-1 text-sm text-gray-400">
            Compare item stats and identify what each item is useful against.
          </p>
        </div>
        {!loading && <div className="badge badge-outline badge-lg">{list.length} items</div>}
      </div>

      <div className="mb-6 flex flex-wrap gap-3">
        <input
          type="text"
          placeholder="Search item..."
          className="input input-bordered w-full max-w-xs"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
        <select
          className="select select-bordered"
          value={type}
          onChange={(event) => setType(event.target.value)}
        >
          <option value="">All Types</option>
          {types.map((item) => (
            <option key={item} value={item}>
              {item.charAt(0).toUpperCase() + item.slice(1)}
            </option>
          ))}
        </select>
        {(search || type) && (
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => {
              setSearch('');
              setType('');
            }}
          >
            Clear
          </button>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <div key={item} className="rounded-lg bg-base-100 p-5 shadow-md">
              <div className="skeleton h-5 w-2/3"></div>
              <div className="skeleton mt-4 h-4 w-full"></div>
              <div className="skeleton mt-2 h-4 w-4/5"></div>
              <div className="mt-5 flex gap-2">
                <div className="skeleton h-5 w-20"></div>
                <div className="skeleton h-5 w-20"></div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((item) => {
            const tags = getItemTags(item);
            return (
              <article
                key={item.id}
                className="rounded-lg bg-base-100 p-5 shadow-md transition-all hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-bold leading-tight">{item.name}</h2>
                    <p className="mt-1 text-sm font-semibold text-warning">{item.price} gold</p>
                  </div>
                  <span className={`badge ${typeColors[item.type] || 'badge-ghost'} badge-sm`}>
                    {item.type}
                  </span>
                </div>

                <p className="mt-4 min-h-12 text-sm leading-6 text-gray-400">{item.description}</p>

                <div className="mt-4 flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <span key={tag} className="badge badge-outline badge-sm">
                      {tag}
                    </span>
                  ))}
                </div>

                {item.passive && (
                  <div className="mt-4 rounded-lg bg-base-200 p-3">
                    <p className="text-xs leading-5 text-gray-300">{item.passive}</p>
                  </div>
                )}

                {item.stats && (
                  <div className="mt-4 flex flex-wrap gap-1">
                    {Object.entries(item.stats).map(([key, value]) => (
                      <span key={key} className="badge badge-ghost badge-xs">
                        {formatStatName(key)}: +{value}
                      </span>
                    ))}
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}

      {!loading && list.length === 0 && (
        <div className="rounded-lg bg-base-100 py-20 text-center text-gray-500">
          <p>No items found.</p>
        </div>
      )}
    </div>
  );
}
