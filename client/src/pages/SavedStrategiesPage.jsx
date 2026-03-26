import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchStrategies,
  deleteStrategy,
  voteStrategy,
} from '../features/strategies/strategySlice';
import { fetchHeroes } from '../features/heroes/heroSlice';

export default function SavedStrategiesPage() {
  const dispatch = useDispatch();
  const { list, loading } = useSelector((state) => state.strategies);
  const { list: heroes } = useSelector((state) => state.heroes);
  const { user } = useSelector((state) => state.auth);
  const [voting, setVoting] = useState(false);

  useEffect(() => {
    dispatch(fetchStrategies());
    dispatch(fetchHeroes());
  }, [dispatch]);

  const getHeroName = (id) => {
    const hero = heroes.find((h) => h.id === id);
    return hero ? hero.name : `Hero #${id}`;
  };

  const handleDelete = (id) => {
    if (confirm('Are you sure you want to delete this strategy?')) {
      dispatch(deleteStrategy(id));
    }
  };

  const handleVote = async (id, type) => {
    if (voting) return;
    setVoting(true);
    await dispatch(voteStrategy({ id, type }));
    setVoting(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-primary mb-6">Saved Strategies</h1>

      {list.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-500 text-lg">No saved strategies yet.</p>
          <a href="/strategy" className="btn btn-primary mt-4">
            Create Your First Strategy
          </a>
        </div>
      ) : (
        <div className="space-y-6">
          {list.map((strategy) => (
            <div key={strategy.id} className="card bg-base-100 shadow-xl">
              <div className="card-body">
                {/* Header */}
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="card-title text-primary">{strategy.title}</h2>
                    <p className="text-sm text-gray-400">
                      by {strategy.User?.username || 'Unknown'} •{' '}
                      {new Date(strategy.createdAt).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                  {user && strategy.userId === user.id && (
                    <button
                      onClick={() => handleDelete(strategy.id)}
                      className="btn btn-ghost btn-sm text-error"
                    >
                      Delete
                    </button>
                  )}
                </div>

                {/* Enemy Comp */}
                <div className="flex flex-wrap gap-2 mt-2">
                  <span className="text-sm text-gray-400">Enemy: </span>
                  {Array.isArray(strategy.enemyComp) &&
                    strategy.enemyComp.map((id) => {
                      const hero = heroes.find((h) => h.id === id);
                      return (
                        <div
                          key={id}
                          className="flex items-center gap-1 badge badge-outline badge-sm py-2"
                        >
                          {hero?.imageUrl && (
                            <img
                              src={hero.imageUrl}
                              alt={hero.name}
                              className="w-4 h-4 rounded-full"
                            />
                          )}
                          <span>{getHeroName(id)}</span>
                        </div>
                      );
                    })}
                </div>

                {/* Recommendation Preview */}
                <div className="mt-3">
                  <div className="collapse collapse-arrow bg-base-200">
                    <input type="checkbox" />
                    <div className="collapse-title font-medium">View Strategy Details</div>
                    <div className="collapse-content">
                      <div className="prose prose-sm max-w-none whitespace-pre-wrap">
                        {strategy.recommendation}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Vote */}
                <div className="flex items-center gap-4 mt-4">
                  <button
                    onClick={() => handleVote(strategy.id, 'up')}
                    className="btn btn-ghost btn-sm gap-1"
                    disabled={voting}
                  >
                    👍 Upvote
                  </button>
                  <span className="font-bold text-lg">{strategy.likes || 0}</span>
                  <button
                    onClick={() => handleVote(strategy.id, 'down')}
                    className="btn btn-ghost btn-sm gap-1"
                    disabled={voting}
                  >
                    👎 Downvote
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
