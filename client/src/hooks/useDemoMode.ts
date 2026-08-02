import { useState, useEffect } from 'react';

export function useDemoMode() {
  const [isDemoMode, setIsDemoMode] = useState(() => {
    if (typeof window === 'undefined') return false;
    return import.meta.env.VITE_DEMO_MODE === 'true' || localStorage.getItem('DEMO_MODE') === 'true';
  });

  const toggleDemoMode = () => {
    const newValue = !isDemoMode;
    setIsDemoMode(newValue);
    if (typeof window !== 'undefined') {
      localStorage.setItem('DEMO_MODE', newValue.toString());
      window.location.reload(); // Reload to re-initialize TRPC client
    }
  };

  return { isDemoMode, toggleDemoMode };
}
