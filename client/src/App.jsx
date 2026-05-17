import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AppRoutes from './routers';
import { fetchProfile } from './features/auth/authSlice';

export default function App() {
  const dispatch = useDispatch();
  const { token, user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (token && !user) {
      dispatch(fetchProfile());
    }
  }, [dispatch, token, user]);

  return (
    <div data-theme="night" className="flex min-h-screen flex-col bg-base-200">
      <Navbar />
      <main className="container mx-auto flex-1 px-4 py-6">
        <AppRoutes />
      </main>
      <Footer />
    </div>
  );
}
