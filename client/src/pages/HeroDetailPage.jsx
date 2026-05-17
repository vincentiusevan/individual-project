import { useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';
import { fetchHeroById, fetchHeroCounters, clearHeroDetail } from '../features/heroes/heroSlice';

function StatBar({ label, value }) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-28 text-sm">{label}</span>
      <progress className="progress progress-primary w-full" value={value || 0} max="100"></progress>
      <span className="w-8 text-sm font-bold">{value || 0}</span>
    </div>
  );
}

function HeroCard({ hero }) {
  const content = (
    <>
      <img
        src={hero.imageUrl || 'https://via.placeholder.com/60'}
        alt={hero.name}
        className="h-14 w-14 rounded-full border-2 border-base-300 object-cover"
      />
      <span className="text-center text-xs">{hero.name || `Hero #${hero.heroId}`}</span>
    </>
  );

  if (!hero.id) {
    return <div className="flex w-20 flex-col items-center gap-1 opacity-70">{content}</div>;
  }

  return (
    <Link
      to={`/heroes/${hero.id}`}
      className="flex w-20 flex-col items-center gap-1 transition-all hover:scale-105"
    >
      {content}
    </Link>
  );
}

function CounterSection({ title, description, tone, heroes, countersLoading, countersError, onRetry }) {
  return (
    <div className="card bg-base-100 shadow-xl">
      <div className="card-body">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className={`card-title text-lg ${tone}`}>{title}</h3>
            <p className="mt-1 text-sm text-gray-400">{description}</p>
          </div>
          {countersLoading && <span className="loading loading-spinner loading-sm text-primary"></span>}
        </div>

        {countersError ? (
          <div className="mt-4 rounded-lg bg-base-200 p-4">
            <p className="text-sm text-gray-300">Counter data is temporarily unavailable.</p>
            <button type="button" onClick={onRetry} className="btn btn-outline btn-primary btn-sm mt-3">
              Retry
            </button>
          </div>
        ) : heroes?.length > 0 ? (
          <div className="mt-4 flex flex-wrap gap-4">
            {heroes.map((hero) => (
              <HeroCard key={`${title}-${hero.heroId || hero.id}`} hero={hero} />
            ))}
          </div>
        ) : countersLoading ? (
          <div className="mt-4 grid grid-cols-3 gap-4 sm:grid-cols-5">
            {[1, 2, 3].map((item) => (
              <div key={item} className="flex flex-col items-center gap-2">
                <div className="skeleton h-14 w-14 rounded-full"></div>
                <div className="skeleton h-3 w-16"></div>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-4 text-sm text-gray-500">No counter data available yet.</p>
        )}
      </div>
    </div>
  );
}

export default function HeroDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { detail, counters, loading, countersLoading, countersError } = useSelector(
    (state) => state.heroes
  );
  const { token } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(fetchHeroById(id));
    dispatch(fetchHeroCounters(id));
    return () => dispatch(clearHeroDetail());
  }, [dispatch, id]);

  if (loading || !detail) {
    return (
      <div className="flex justify-center py-20">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  const goToStrategy = () => {
    navigate(token ? '/strategy' : '/login', {
      state: token ? { enemyHero: detail } : undefined,
    });
  };

  const retryCounters = () => {
    dispatch(fetchHeroCounters(id));
  };

  return (
    <div>
      <Link to="/heroes" className="btn btn-ghost btn-sm mb-4">
        &lt; Back to Heroes
      </Link>

      <div className="grid gap-8 lg:grid-cols-[0.9fr_1.6fr]">
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body items-center text-center">
            <img
              src={detail.imageUrl || 'https://via.placeholder.com/120'}
              alt={detail.name}
              className="h-32 w-32 rounded-full border-4 border-primary object-cover"
            />
            <h2 className="card-title text-3xl text-primary">{detail.name}</h2>
            <div className="flex flex-wrap justify-center gap-2">
              <div className="badge badge-primary">{detail.role}</div>
              {detail.lane && <div className="badge badge-ghost">{detail.lane}</div>}
            </div>
            {detail.specialty && <p className="text-sm text-gray-400">{detail.specialty}</p>}

            <div className="mt-4 w-full space-y-2">
              <StatBar label="Durability" value={detail.durability} />
              <StatBar label="Offense" value={detail.offense} />
              <StatBar label="Control" value={detail.controlEffect} />
              <StatBar label="Difficulty" value={detail.difficulty} />
            </div>

            <div className="card-actions mt-6 w-full">
              <button type="button" onClick={goToStrategy} className="btn btn-primary w-full">
                Use as Enemy Pick
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <CounterSection
            title="Strong Against"
            tone="text-success"
            description={`${detail.name} performs well into these matchups.`}
            heroes={counters?.strong}
            countersLoading={countersLoading}
            countersError={countersError}
            onRetry={retryCounters}
          />
          <CounterSection
            title="Weak Against"
            tone="text-error"
            description={`These heroes can pressure ${detail.name}.`}
            heroes={counters?.weak}
            countersLoading={countersLoading}
            countersError={countersError}
            onRetry={retryCounters}
          />
          <CounterSection
            title="Best Partners"
            tone="text-info"
            description="Pair with these heroes for stronger team fights."
            heroes={counters?.assist}
            countersLoading={countersLoading}
            countersError={countersError}
            onRetry={retryCounters}
          />
        </div>
      </div>
    </div>
  );
}
