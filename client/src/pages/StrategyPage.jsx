import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';
import MarkdownText from '../components/MarkdownText';
import { cleanMarkdownText, toPlainMarkdownText } from '../helpers/markdown';
import { fetchHeroes } from '../features/heroes/heroSlice';
import { getAIStrategy, saveStrategy, clearAIResult } from '../features/strategies/strategySlice';

const roles = ['Marksman', 'Fighter', 'Assassin', 'Mage', 'Tank', 'Support'];
const lanes = ['Gold Lane', 'EXP Lane', 'Mid Lane', 'Jungle', 'Roam'];

function splitRecommendation(text = '') {
  const lines = text.split('\n');
  const sections = [];
  let current = { title: 'Recommendation', body: [] };

  lines.forEach((line) => {
    const trimmed = line.trim();
    const heading =
      trimmed.match(/^#{1,6}\s+(.+)/) || trimmed.match(/^\*\*(.+?)\*\*:?\s*$/);

    if (heading && current.body.length > 0) {
      sections.push(current);
      current = { title: cleanMarkdownText(heading[1]).replace(/^\d+\.\s*/, ''), body: [] };
      return;
    }

    if (heading && current.body.length === 0) {
      current.title = cleanMarkdownText(heading[1]).replace(/^\d+\.\s*/, '');
      return;
    }

    current.body.push(line);
  });

  if (current.body.join('').trim()) sections.push(current);
  return sections.length ? sections : [{ title: 'Recommendation', body: [text] }];
}

export default function StrategyPage() {
  const dispatch = useDispatch();
  const location = useLocation();
  const { list: heroes } = useSelector((state) => state.heroes);
  const { aiResult, aiLoading, error } = useSelector((state) => state.strategies);
  const [selectedEnemies, setSelectedEnemies] = useState(() =>
    location.state?.enemyHero ? [location.state.enemyHero] : []
  );
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');
  const [lane, setLane] = useState('');
  const [saveTitle, setSaveTitle] = useState('');
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    dispatch(fetchHeroes());
    return () => dispatch(clearAIResult());
  }, [dispatch]);

  const filteredHeroes = heroes.filter((hero) => {
    const matchSearch = hero.name.toLowerCase().includes(search.toLowerCase());
    const matchRole = !role || hero.role === role;
    const matchLane = !lane || hero.lane === lane;
    return matchSearch && matchRole && matchLane;
  });

  const recommendationSections = useMemo(
    () => splitRecommendation(aiResult?.recommendation),
    [aiResult]
  );

  const toggleHero = (hero) => {
    if (selectedEnemies.find((enemy) => enemy.id === hero.id)) {
      setSelectedEnemies(selectedEnemies.filter((enemy) => enemy.id !== hero.id));
    } else if (selectedEnemies.length < 5) {
      setSelectedEnemies([...selectedEnemies, hero]);
    }
  };

  const handleAnalyze = () => {
    const enemyHeroIds = selectedEnemies.map((hero) => hero.id);
    dispatch(getAIStrategy(enemyHeroIds));
    setSaved(false);
  };

  const handleSave = async () => {
    if (!saveTitle.trim() || !aiResult) return;

    const result = await dispatch(
      saveStrategy({
        title: saveTitle,
        enemyComp: selectedEnemies.map((hero) => hero.id),
        recommendation: aiResult.recommendation,
      })
    );

    if (result.meta.requestStatus === 'fulfilled') {
      setSaved(true);
      setSaveTitle('');
    }
  };

  const handleReset = () => {
    setSelectedEnemies([]);
    dispatch(clearAIResult());
    setSaved(false);
    setCopied(false);
  };

  const handleCopy = async () => {
    if (!aiResult?.recommendation) return;
    await navigator.clipboard.writeText(toPlainMarkdownText(aiResult.recommendation));
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary">AI Strategy Advisor</h1>
          <p className="mt-1 text-sm text-gray-400">
            Build an enemy draft, then generate counter picks, items, and game plan.
          </p>
        </div>
        <button type="button" onClick={handleReset} className="btn btn-ghost btn-sm">
          Reset Draft
        </button>
      </div>

      <section className="rounded-lg bg-base-100 p-5 shadow-xl">
        <div className="flex flex-col gap-2 border-b border-base-300 pb-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-bold">Enemy Draft Slots</h2>
            <p className="text-sm text-gray-400">{selectedEnemies.length}/5 enemies selected</p>
          </div>
          <button
            type="button"
            onClick={handleAnalyze}
            className={`btn btn-primary btn-sm ${aiLoading ? 'loading' : ''}`}
            disabled={selectedEnemies.length === 0 || aiLoading}
          >
            {aiLoading ? 'Analyzing...' : 'Get Counter Strategy'}
          </button>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-5">
          {[0, 1, 2, 3, 4].map((slot) => {
            const hero = selectedEnemies[slot];
            return (
              <div
                key={slot}
                className={`min-h-32 rounded-lg border border-dashed p-3 text-center ${
                  hero ? 'border-error bg-error/10' : 'border-base-300 bg-base-200'
                }`}
              >
                {hero ? (
                  <div className="relative flex flex-col items-center gap-2">
                    <button
                      type="button"
                      onClick={() => toggleHero(hero)}
                      className="btn btn-circle btn-error btn-xs absolute -right-1 -top-1"
                    >
                      x
                    </button>
                    <img
                      src={hero.imageUrl || 'https://via.placeholder.com/64'}
                      alt={hero.name}
                      className="h-16 w-16 rounded-full border-2 border-error object-cover"
                    />
                    <div>
                      <p className="text-sm font-semibold">{hero.name}</p>
                      <p className="text-xs text-gray-400">{hero.role}</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex h-full min-h-24 flex-col items-center justify-center gap-2 text-gray-500">
                    <span className="text-sm font-semibold">Enemy {slot + 1}</span>
                    <span className="text-xs">Empty slot</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {aiResult && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-success">AI Recommendation</h2>
            <div className="flex gap-2">
              <button type="button" onClick={handleCopy} className="btn btn-outline btn-sm">
                {copied ? 'Copied' : 'Copy'}
              </button>
              <button
                type="button"
                onClick={() => dispatch(clearAIResult())}
                className="btn btn-ghost btn-sm"
              >
                New Analysis
              </button>
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            {recommendationSections.map((section) => (
              <div key={section.title} className="rounded-lg bg-base-100 p-5 shadow-xl">
                <h3 className="text-lg font-bold text-primary">{section.title}</h3>
                <div className="mt-3">
                  <MarkdownText text={section.body.join('\n').trim()} />
                </div>
              </div>
            ))}
          </div>

          {!saved ? (
            <div className="flex flex-col gap-2 rounded-lg bg-base-100 p-4 shadow-xl sm:flex-row">
              <input
                type="text"
                placeholder="Give this strategy a title..."
                className="input input-bordered flex-1"
                value={saveTitle}
                onChange={(event) => setSaveTitle(event.target.value)}
              />
              <button
                type="button"
                onClick={handleSave}
                className="btn btn-success"
                disabled={!saveTitle.trim()}
              >
                Save Strategy
              </button>
            </div>
          ) : (
            <div className="alert alert-success">
              <span>Strategy saved successfully.</span>
            </div>
          )}
        </section>
      )}

      {error && (
        <div className="alert alert-error">
          <span>{error}</span>
        </div>
      )}

      {!aiResult && (
        <section>
          <h2 className="mb-4 text-xl font-bold">Pick Enemy Heroes</h2>
          <div className="mb-4 flex flex-wrap gap-3">
            <input
              type="text"
              placeholder="Search hero..."
              className="input input-bordered input-sm w-full max-w-xs"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
            <select
              className="select select-bordered select-sm"
              value={role}
              onChange={(event) => setRole(event.target.value)}
            >
              <option value="">All Roles</option>
              {roles.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
            <select
              className="select select-bordered select-sm"
              value={lane}
              onChange={(event) => setLane(event.target.value)}
            >
              <option value="">All Lanes</option>
              {lanes.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
            {filteredHeroes.map((hero) => {
              const isSelected = selectedEnemies.find((enemy) => enemy.id === hero.id);
              const isDisabled = selectedEnemies.length >= 5 && !isSelected;
              return (
                <button
                  type="button"
                  key={hero.id}
                  onClick={() => toggleHero(hero)}
                  disabled={isDisabled}
                  className={`flex min-h-28 flex-col items-center gap-1 rounded-lg border-2 p-2 transition-all hover:scale-105 ${
                    isSelected
                      ? 'border-error bg-error/20'
                      : 'border-transparent bg-base-100 hover:border-primary'
                  } ${isDisabled ? 'cursor-not-allowed opacity-40' : ''}`}
                >
                  <img
                    src={hero.imageUrl || 'https://via.placeholder.com/48'}
                    alt={hero.name}
                    className="h-12 w-12 rounded-full object-cover"
                  />
                  <span className="text-center text-xs leading-tight">{hero.name}</span>
                  {hero.lane && <span className="badge badge-ghost badge-xs">{hero.lane}</span>}
                </button>
              );
            })}
          </div>

          {filteredHeroes.length === 0 && (
            <div className="mt-8 rounded-lg bg-base-100 p-8 text-center text-gray-500">
              No heroes match the current filters.
            </div>
          )}
        </section>
      )}
    </div>
  );
}
