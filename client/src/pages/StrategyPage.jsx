import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchHeroes } from '../features/heroes/heroSlice';
import { getAIStrategy, saveStrategy, clearAIResult } from '../features/strategies/strategySlice';

export default function StrategyPage() {
  const dispatch = useDispatch();
  const { list: heroes } = useSelector((state) => state.heroes);
  const { aiResult, aiLoading, error } = useSelector((state) => state.strategies);
  const [selectedEnemies, setSelectedEnemies] = useState([]);
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');
  const [saveTitle, setSaveTitle] = useState('');
  const [saved, setSaved] = useState(false);

  const roles = ['Marksman', 'Fighter', 'Assassin', 'Mage', 'Tank', 'Support'];

  useEffect(() => {
    dispatch(fetchHeroes());
    return () => dispatch(clearAIResult());
  }, [dispatch]);

  const filteredHeroes = heroes.filter((h) => {
    const matchSearch = h.name.toLowerCase().includes(search.toLowerCase());
    const matchRole = !role || h.role === role;
    return matchSearch && matchRole;
  });

  const toggleHero = (hero) => {
    if (selectedEnemies.find((e) => e.id === hero.id)) {
      setSelectedEnemies(selectedEnemies.filter((e) => e.id !== hero.id));
    } else if (selectedEnemies.length < 5) {
      setSelectedEnemies([...selectedEnemies, hero]);
    }
  };

  const handleAnalyze = () => {
    const enemyHeroIds = selectedEnemies.map((h) => h.id);
    dispatch(getAIStrategy(enemyHeroIds));
    setSaved(false);
  };

  const handleSave = () => {
    if (!saveTitle.trim()) return;
    dispatch(
      saveStrategy({
        title: saveTitle,
        enemyComp: selectedEnemies.map((h) => h.id),
        recommendation: aiResult.recommendation,
      })
    );
    setSaved(true);
    setSaveTitle('');
  };

  const handleReset = () => {
    setSelectedEnemies([]);
    dispatch(clearAIResult());
    setSaved(false);
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-primary mb-6">AI Strategy Advisor</h1>

      {/* Selected Enemies */}
      <div className="card bg-base-100 shadow-xl mb-6">
        <div className="card-body">
          <h2 className="card-title text-lg">
            Enemy Team Composition ({selectedEnemies.length}/5)
          </h2>
          {selectedEnemies.length === 0 ? (
            <p className="text-gray-500">Select up to 5 enemy heroes below</p>
          ) : (
            <div className="flex flex-wrap gap-4">
              {selectedEnemies.map((hero) => (
                <div key={hero.id} className="flex flex-col items-center gap-1 relative">
                  <button
                    onClick={() => toggleHero(hero)}
                    className="btn btn-circle btn-xs btn-error absolute -top-1 -right-1 z-10"
                  >
                    ✕
                  </button>
                  <img
                    src={hero.imageUrl || 'https://via.placeholder.com/60'}
                    alt={hero.name}
                    className="w-16 h-16 rounded-full object-cover border-2 border-error"
                  />
                  <span className="text-xs">{hero.name}</span>
                  <span className="badge badge-xs">{hero.role}</span>
                </div>
              ))}
            </div>
          )}
          <div className="card-actions justify-end mt-4 gap-2">
            <button onClick={handleReset} className="btn btn-ghost btn-sm">
              Reset
            </button>
            <button
              onClick={handleAnalyze}
              className={`btn btn-primary btn-sm ${aiLoading ? 'loading' : ''}`}
              disabled={selectedEnemies.length === 0 || aiLoading}
            >
              {aiLoading ? 'Analyzing...' : 'Get Counter Strategy'}
            </button>
          </div>
        </div>
      </div>

      {/* AI Result */}
      {aiResult && (
        <div className="card bg-base-100 shadow-xl mb-6">
          <div className="card-body">
            <h2 className="card-title text-lg text-success">AI Recommendation</h2>
            <div className="prose prose-sm max-w-none whitespace-pre-wrap mt-2">
              {aiResult.recommendation}
            </div>

            {/* Save Strategy */}
            {!saved ? (
              <div className="flex gap-2 mt-6">
                <input
                  type="text"
                  placeholder="Give this strategy a title..."
                  className="input input-bordered flex-1"
                  value={saveTitle}
                  onChange={(e) => setSaveTitle(e.target.value)}
                />
                <button
                  onClick={handleSave}
                  className="btn btn-success"
                  disabled={!saveTitle.trim()}
                >
                  Save Strategy
                </button>
              </div>
            ) : (
              <div className="alert alert-success mt-4">
                <span>Strategy saved successfully!</span>
              </div>
            )}
          </div>
        </div>
      )}

      {error && (
        <div className="alert alert-error mb-6">
          <span>{error}</span>
        </div>
      )}

      {/* Hero Picker */}
      {!aiResult && (
        <div>
          <h2 className="text-xl font-bold mb-4">Pick Enemy Heroes</h2>
          <div className="flex flex-wrap gap-3 mb-4">
            <input
              type="text"
              placeholder="Search hero..."
              className="input input-bordered input-sm w-full max-w-xs"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <select
              className="select select-bordered select-sm"
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

          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
            {filteredHeroes.map((hero) => {
              const isSelected = selectedEnemies.find((e) => e.id === hero.id);
              return (
                <div
                  key={hero.id}
                  onClick={() => toggleHero(hero)}
                  className={`flex flex-col items-center gap-1 p-2 rounded-lg cursor-pointer transition-all hover:scale-105 ${
                    isSelected
                      ? 'bg-error/20 border-2 border-error'
                      : 'bg-base-100 border-2 border-transparent hover:border-primary'
                  } ${selectedEnemies.length >= 5 && !isSelected ? 'opacity-40 cursor-not-allowed' : ''}`}
                >
                  <img
                    src={hero.imageUrl || 'https://via.placeholder.com/48'}
                    alt={hero.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <span className="text-xs text-center leading-tight">{hero.name}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
