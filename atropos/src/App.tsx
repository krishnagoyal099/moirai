import { useEffect } from 'react';
import { useAppStore } from './store/useAppStore';
import { Onboarding } from './components/Onboarding';
import { FloatingMenu } from './components/FloatingMenu';
import { Home } from './pages/Home';
import { Tasks } from './pages/Tasks';
import { Stats } from './pages/Stats';
import { Chat } from './pages/Chat';
import { Settings } from './pages/Settings';
import Lenis from 'lenis';
import { AnimatePresence, motion } from 'framer-motion';
import { pageVariants } from './utils/animations';

function App() {
  const { currentPage, loadUser } = useAppStore();

  useEffect(() => { loadUser(); }, [loadUser]);

  // Lenis Init
  useEffect(() => {
    const lenis = new Lenis({ duration: 1.2, smoothWheel: true });
    const raf = (time: number) => { lenis.raf(time); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);
    return () => { lenis.destroy(); };
  }, []);

  const renderPage = () => {
    switch (currentPage) {
      case 'onboarding': return <Onboarding />;
      case 'home': return <Home />;
      case 'tasks': return <Tasks />;
      case 'stats': return <Stats />;
      case 'chat': return <Chat />;
      case 'settings': return <Settings />;
      default: return <div className="p-12 font-body">Loading...</div>;
    }
  };

  return (
    <div className="w-full h-screen bg-[var(--bg-current)] text-[var(--text-current)] overflow-hidden relative selection:bg-[var(--accent-current)] selection:text-white">

      {/* Cinematic Page Transitions */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentPage}
          className="w-full h-full"
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
        >
          {renderPage()}
        </motion.div>
      </AnimatePresence>

      {/* Floating Menu - Visible on all pages except Onboarding */}
      {currentPage !== 'onboarding' && <FloatingMenu />}
    </div>
  );
}

export default App;