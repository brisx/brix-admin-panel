import { useEffect } from 'react';

export const usePreventRefresh = () => {
  useEffect(() => {
    // Prevent default refresh behavior
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = ''; // Required for Chrome
    };

    // Add event listener
    window.addEventListener('beforeunload', handleBeforeUnload);

    // Clean up
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);
};
