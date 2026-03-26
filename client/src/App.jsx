import Navbar from './components/Navbar';
import AppRoutes from './routers';

export default function App() {
  return (
    <div data-theme="night" className="min-h-screen bg-base-200">
      <Navbar />
      <main className="container mx-auto px-4 py-6">
        <AppRoutes />
      </main>
    </div>
  );
}
