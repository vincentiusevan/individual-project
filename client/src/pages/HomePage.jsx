import { Link } from 'react-router';

const quickActions = [
  {
    title: 'Build Counter Strategy',
    text: 'Pick up to five enemy heroes and get an AI draft plan.',
    to: '/strategy',
    action: 'Open Advisor',
    accent: 'border-primary',
  },
  {
    title: 'Explore Heroes',
    text: 'Filter heroes by role and lane before deciding your matchup.',
    to: '/heroes',
    action: 'Browse Heroes',
    accent: 'border-info',
  },
  {
    title: 'Study Items',
    text: 'Compare item passives, stats, and gold costs for your build.',
    to: '/items',
    action: 'View Items',
    accent: 'border-warning',
  },
];

const draftTips = [
  'Identify the main damage source before choosing defensive items.',
  'Check lane matchups first, then adjust picks around crowd control.',
  'Save useful recommendations so you can compare strategies later.',
];

export default function HomePage() {
  return (
    <div className="space-y-8">
      <section className="grid min-h-[62vh] items-center gap-8 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6">
          <div className="badge badge-primary badge-outline">Draft smarter, not louder</div>
          <div>
            <h1 className="text-4xl font-bold leading-tight text-primary md:text-6xl">
              ML Strategy Lab
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-gray-300">
              Build Mobile Legends counter plans from hero matchups, item context, and AI
              recommendations in one focused workspace.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link to="/strategy" className="btn btn-primary">
              Start Drafting
            </Link>
            <Link to="/heroes" className="btn btn-outline">
              Browse Heroes
            </Link>
          </div>
        </div>

        <div className="rounded-lg border border-base-300 bg-base-100 p-5 shadow-xl">
          <div className="flex items-center justify-between border-b border-base-300 pb-3">
            <div>
              <p className="text-sm text-gray-400">Draft Board</p>
              <h2 className="text-xl font-bold">Counter Checklist</h2>
            </div>
            <div className="badge badge-success">Ready</div>
          </div>
          <div className="mt-5 space-y-3">
            {draftTips.map((tip, index) => (
              <div key={tip} className="flex items-start gap-3 rounded-lg bg-base-200 p-3">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-content">
                  {index + 1}
                </div>
                <p className="text-sm leading-6 text-gray-300">{tip}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {quickActions.map((item) => (
          <Link
            key={item.title}
            to={item.to}
            className={`rounded-lg border-l-4 ${item.accent} bg-base-100 p-5 shadow-md transition-all hover:-translate-y-1 hover:shadow-xl`}
          >
            <h2 className="text-lg font-bold">{item.title}</h2>
            <p className="mt-2 min-h-12 text-sm leading-6 text-gray-400">{item.text}</p>
            <span className="mt-4 inline-flex text-sm font-semibold text-primary">
              {item.action}
            </span>
          </Link>
        ))}
      </section>
    </div>
  );
}
