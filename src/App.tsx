import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Navbar, BottomNav } from './components/Navigation';
import { useAuth } from './hooks/useAuth';
import { useAnnouncements } from './firebase/announcements';
import { onMessageListener } from './firebase/notifications';
import toast from 'react-hot-toast';

// Lazy load pages for better performance
const Home = React.lazy(() => import('./pages/Home'));
const Tracking = React.lazy(() => import('./pages/Tracking'));
const Itinerary = React.lazy(() => import('./pages/Itinerary'));
const Announcements = React.lazy(() => import('./pages/Announcements'));
const Checklist = React.lazy(() => import('./pages/Checklist'));
const Gallery = React.lazy(() => import('./pages/Gallery'));
const Profile = React.lazy(() => import('./pages/Profile'));
const Admin = React.lazy(() => import('./pages/Admin'));
const Emergency = React.lazy(() => import('./pages/Emergency'));

const LoadingScreen = () => (
  <div className="min-h-screen flex items-center justify-center bg-dark">
    <div className="w-12 h-12 border-4 border-gold border-t-transparent rounded-full animate-spin"></div>
  </div>
);

export default function App() {
  const { user, loading } = useAuth();
  // Register global announcement listener for toast notifications
  useAnnouncements();

  // Handle foreground notifications
  React.useEffect(() => {
    onMessageListener().then((payload: any) => {
      if (payload?.notification) {
        toast.custom((t) => (
          <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-zinc-900 shadow-lg rounded-2xl pointer-events-auto flex ring-1 ring-gold/20 p-4 border border-gold/10`}>
            <div className="flex-1 w-0">
              <p className="text-sm font-bold text-white mb-1">{payload.notification.title}</p>
              <p className="text-xs text-white/60">{payload.notification.body}</p>
            </div>
            <div className="ml-4 flex-shrink-0 flex">
              <button 
                onClick={() => toast.dismiss(t.id)} 
                className="text-xs font-bold uppercase text-gold hover:text-gold/80"
              >
                Close
              </button>
            </div>
          </div>
        ), { duration: 6000 });
      }
    }).catch(err => console.log('failed: ', err));
  }, []);

  if (loading) return <LoadingScreen />;

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-dark overflow-x-hidden relative">
        <div className="fixed inset-0 islamic-pattern pointer-events-none z-0"></div>
        <Navbar />
        <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 mb-24 md:mb-0">
          <React.Suspense fallback={<LoadingScreen />}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/tracking" element={<Tracking />} />
              <Route path="/itinerary" element={<Itinerary />} />
              <Route path="/announcements" element={<Announcements />} />
              <Route path="/checklist" element={<Checklist />} />
              <Route path="/gallery" element={<Gallery />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/emergency" element={<Emergency />} />
              
              {/* Admin Protected Route */}
              <Route 
                path="/admin/*" 
                element={user?.role === 'admin' ? <Admin /> : <Navigate to="/" />} 
              />
            </Routes>
          </React.Suspense>
        </main>
        <BottomNav />
        <Toaster position="top-center" toastOptions={{
          style: { background: '#0f0f0f', color: '#e5e7eb', border: '1px solid rgba(212, 175, 55, 0.2)', backdropFilter: 'blur(10px)' }
        }} />
      </div>
    </BrowserRouter>
  );
}
