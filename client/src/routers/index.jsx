import { Routes, Route } from 'react-router';
import HomePage from '../pages/HomePage';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import HeroListPage from '../pages/HeroListPage';
import HeroDetailPage from '../pages/HeroDetailPage';
import ItemListPage from '../pages/ItemListPage';
import StrategyPage from '../pages/StrategyPage';
import SavedStrategiesPage from '../pages/SavedStrategiesPage';
import AuthGuard from './AuthGuard';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/heroes" element={<HeroListPage />} />
      <Route path="/heroes/:id" element={<HeroDetailPage />} />
      <Route path="/items" element={<ItemListPage />} />
      <Route
        path="/strategy"
        element={
          <AuthGuard>
            <StrategyPage />
          </AuthGuard>
        }
      />
      <Route
        path="/saved"
        element={
          <AuthGuard>
            <SavedStrategiesPage />
          </AuthGuard>
        }
      />
    </Routes>
  );
}
