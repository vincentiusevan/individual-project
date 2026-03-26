import { useEffect } from 'react';
import { useParams, Link } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';
import { fetchHeroById, fetchHeroCounters, clearHeroDetail } from '../features/heroes/heroSlice';

export default function HeroDetailPage() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { detail, counters, loading } = useSelector((state) => state.heroes);

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

  const StatBar = ({ label, value }) => (
    <div className="flex items-center gap-3">
      <span className="w-28 text-sm">{label}</span>
      <progress className="progress progress-primary w-full" value={value} max="100"></progress>
      <span className="text-sm font-bold w-8">{value}</span>
    </div>
  );

  const HeroCard = ({ hero }) => (
    <Link
      to={`/heroes/${hero.id || '#'}`}
      className="flex flex-col items-center gap-1 hover:scale-105 transition-all"
    >
      <img
        src={hero.imageUrl || 'https://via.placeholder.com/60'}
        alt={hero.name}
        className="w-14 h-14 rounded-full object-cover border-2 border-base-300"
      />
      <span className="text-xs text-center">{hero.name || `Hero #${hero.heroId}`}</span>
    </Link>
  );

  return (
    <div>
      <Link to="/heroes" className="btn btn-ghost btn-sm mb-4">
        ← Back to Heroes
      </Link>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left: Hero Info */}
        <div className="card bg-base-100 shadow-xl w-full lg:w-1/3">
          <div className="card-body items-center text-center">
            <img
              src={detail.imageUrl || 'https://via.placeholder.com/120'}
              alt={detail.name}
              className="w-32 h-32 rounded-full object-cover border-4 border-primary"
            />
            <h2 className="card-title text-2xl text-primary">{detail.name}</h2>
            <div className="flex gap-2">
              <div className="badge badge-primary">{detail.role}</div>
              {detail.lane && <div className="badge badge-ghost">{detail.lane}</div>}
            </div>
            {detail.specialty && <p className="text-sm text-gray-400">{detail.specialty}</p>}

            <div className="w-full mt-4 space-y-2">
              <StatBar label="Durability" value={detail.durability} />
              <StatBar label="Offense" value={detail.offense} />
              <StatBar label="Control" value={detail.controlEffect} />
              <StatBar label="Difficulty" value={detail.difficulty} />
            </div>
          </div>
        </div>

        {/* Right: Counter Info */}
        <div className="flex-1 space-y-6">
          {/* Strong Against */}
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h3 className="card-title text-success text-lg">Strong Against</h3>
              <p className="text-sm text-gray-400 mb-3">{detail.name} counters these heroes</p>
              {counters?.strong?.length > 0 ? (
                <div className="flex flex-wrap gap-4">
                  {counters.strong.map((h, i) => (
                    <HeroCard key={i} hero={h} />
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">Loading counter data...</p>
              )}
            </div>
          </div>

          {/* Weak Against */}
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h3 className="card-title text-error text-lg">Weak Against</h3>
              <p className="text-sm text-gray-400 mb-3">These heroes counter {detail.name}</p>
              {counters?.weak?.length > 0 ? (
                <div className="flex flex-wrap gap-4">
                  {counters.weak.map((h, i) => (
                    <HeroCard key={i} hero={h} />
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">Loading counter data...</p>
              )}
            </div>
          </div>

          {/* Best Partners */}
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h3 className="card-title text-info text-lg">Best Partners</h3>
              <p className="text-sm text-gray-400 mb-3">Works well with these heroes</p>
              {counters?.assist?.length > 0 ? (
                <div className="flex flex-wrap gap-4">
                  {counters.assist.map((h, i) => (
                    <HeroCard key={i} hero={h} />
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">Loading counter data...</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
