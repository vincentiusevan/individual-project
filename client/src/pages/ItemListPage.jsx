import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchItems } from '../features/items/itemSlice';

export default function ItemListPage() {
  const dispatch = useDispatch();
  const { list, loading } = useSelector((state) => state.items);
  const [search, setSearch] = useState('');
  const [type, setType] = useState('');

  const types = ['attack', 'magic', 'defense', 'movement'];

  useEffect(() => {
    const params = {};
    if (search) params.search = search;
    if (type) params.type = type;
    dispatch(fetchItems(params));
  }, [dispatch, search, type]);

  const typeColors = {
    attack: 'badge-error',
    magic: 'badge-primary',
    defense: 'badge-success',
    movement: 'badge-warning',
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-primary mb-6">Items</h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <input
          type="text"
          placeholder="Search item..."
          className="input input-bordered w-full max-w-xs"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="select select-bordered"
          value={type}
          onChange={(e) => setType(e.target.value)}
        >
          <option value="">All Types</option>
          {types.map((t) => (
            <option key={t} value={t}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {/* Item Grid */}
      {loading ? (
        <div className="flex justify-center py-20">
          <span className="loading loading-spinner loading-lg text-primary"></span>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {list.map((item) => (
            <div
              key={item.id}
              className="card bg-base-100 shadow-md hover:shadow-xl transition-all"
            >
              <div className="card-body p-4">
                <div className="flex justify-between items-start">
                  <h3 className="card-title text-base">{item.name}</h3>
                  <span className={`badge ${typeColors[item.type] || 'badge-ghost'} badge-sm`}>
                    {item.type}
                  </span>
                </div>
                <p className="text-sm text-gray-400">{item.description}</p>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-warning font-bold text-sm">{item.price} gold</span>
                </div>
                {item.passive && (
                  <div className="mt-2 p-2 bg-base-200 rounded-lg">
                    <p className="text-xs text-gray-300">{item.passive}</p>
                  </div>
                )}
                {item.stats && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {Object.entries(item.stats).map(([key, val]) => (
                      <span key={key} className="badge badge-outline badge-xs">
                        {key}: +{val}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && list.length === 0 && (
        <div className="text-center py-20 text-gray-500">
          <p>No items found.</p>
        </div>
      )}
    </div>
  );
}
