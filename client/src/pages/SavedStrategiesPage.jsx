import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchStrategies,
  deleteStrategy,
  voteStrategy,
} from '../features/strategies/strategySlice';
import { fetchHeroes } from '../features/heroes/heroSlice';
import MarkdownText from '../components/MarkdownText';

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

  const getHero = (id) => heroes.find((hero) => hero.id === id);
  const getHeroName = (id) => getHero(id)?.name || `Hero #${id}`;

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
      <div className="grid gap-4">
        {[1, 2, 3].map((item) => (
          <div key={item} className="rounded-lg bg-base-100 p-6 shadow-xl">
            <div className="skeleton h-6 w-1/2"></div>
            <div className="mt-4 flex gap-2">
              {[1, 2, 3, 4, 5].map((slot) => (
                <div key={slot} className="skeleton h-12 w-12 rounded-full"></div>
              ))}
            </div>
            <div className="skeleton mt-5 h-16 w-full"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary">Saved Strategies</h1>
          <p className="mt-1 text-sm text-gray-400">
            Review community drafts, compare enemy comps, and keep useful plans close.
          </p>
        </div>
        <div className="badge badge-outline badge-lg">{list.length} saved</div>
      </div>

      {list.length === 0 ? (
        <div className="rounded-lg bg-base-100 py-20 text-center">
          <p className="text-lg text-gray-500">No saved strategies yet.</p>
          <Link to="/strategy" className="btn btn-primary mt-4">
            Create Your First Strategy
          </Link>
        </div>
      ) : (
        <div className="space-y-5">
          {list.map((strategy) => (
            <article key={strategy.id} className="rounded-lg bg-base-100 p-6 shadow-xl">
              <div className="flex flex-col gap-3 border-b border-base-300 pb-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h2 className="text-xl font-bold text-primary">{strategy.title}</h2>
                  <p className="mt-1 text-sm text-gray-400">
                    by {strategy.User?.username || 'Unknown'} -{' '}
                    {new Date(strategy.createdAt).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </p>
                </div>
                {user && strategy.userId === user.id && (
                  <button
                    type="button"
                    onClick={() => handleDelete(strategy.id)}
                    className="btn btn-ghost btn-sm text-error"
                  >
                    Delete
                  </button>
                )}
              </div>

              <div className="mt-5">
                <p className="mb-3 text-sm font-semibold text-gray-300">Enemy Composition</p>
                <div className="flex flex-wrap gap-3">
                  {Array.isArray(strategy.enemyComp) &&
                    strategy.enemyComp.map((id) => {
                      const hero = getHero(id);
                      return (
                        <div key={id} className="flex w-20 flex-col items-center gap-2 text-center">
                          <img
                            src={hero?.imageUrl || 'https://via.placeholder.com/48'}
                            alt={getHeroName(id)}
                            className="h-12 w-12 rounded-full border-2 border-error object-cover"
                          />
                          <span className="text-xs leading-tight">{getHeroName(id)}</span>
                        </div>
                      );
                    })}
                </div>
              </div>

              <div className="mt-5">
                <div className="collapse collapse-arrow bg-base-200">
                  <input type="checkbox" />
                  <div className="collapse-title font-medium">View Strategy Details</div>
                  <div className="collapse-content">
                    <MarkdownText text={strategy.recommendation} />
                  </div>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => handleVote(strategy.id, 'up')}
                  className="btn btn-outline btn-success btn-sm"
                  disabled={voting}
                >
                  Upvote
                </button>
                <span className="rounded-lg bg-base-200 px-4 py-2 text-lg font-bold">
                  {strategy.likes || 0}
                </span>
                <button
                  type="button"
                  onClick={() => handleVote(strategy.id, 'down')}
                  className="btn btn-outline btn-error btn-sm"
                  disabled={voting}
                >
                  Downvote
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
