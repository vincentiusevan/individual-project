export default function HomePage() {
  return (
    <div className="hero min-h-[70vh]">
      <div className="hero-content text-center">
        <div className="max-w-md">
          <h1 className="text-5xl font-bold text-primary">ML Strategy Lab</h1>
          <p className="py-6">
            Your AI-powered Mobile Legends counter pick and strategy advisor. Analyze enemy
            compositions and get winning strategies.
          </p>
          <a href="/strategy" className="btn btn-primary">
            Get Started
          </a>
        </div>
      </div>
    </div>
  );
}
