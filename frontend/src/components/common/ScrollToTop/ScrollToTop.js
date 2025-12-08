import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// ScrollToTop: scrolls window to top whenever the location pathname changes.
// Place this component inside a Router (it uses useLocation).
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Use instant scroll to avoid jank on some browsers when navigating
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [pathname]);

  return null;
};

export default ScrollToTop;
