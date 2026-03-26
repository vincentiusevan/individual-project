import { useSelector } from 'react-redux';
import { Navigate } from 'react-router';

export default function AuthGuard({ children }) {
  const { token } = useSelector((state) => state.auth);

  if (!token) {
    return <Navigate to="/login" />;
  }

  return children;
}
