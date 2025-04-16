import { Outlet } from 'react-router-dom';
// import { Loader2 } from 'lucide-react';

export const ProtectedRoute: React.FC = () => {
  // const { user, isLoading } = useAuthStore();
  // const location = useLocation();

  // if (isLoading) {
  //   return <div className="flex justify-center items-center h-screen"><Loader2 className='animate-spin' /></div>;
  // }

  // if (!user) {
  //   // Redirect to login if not authenticated
  //   return <Navigate to="/login" state={{ from: location }} replace />;
  // }

  // User is authenticated and authorized, render the child routes
  return <Outlet />;
};