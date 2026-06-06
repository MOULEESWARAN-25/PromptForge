import { useEffect, useRef } from 'react';

/**
 * Custom React hook for auto-scrolling behaviors in multi-step wizards.
 * 
 * @param {number} step - Current step index.
 * @param {Array} selectionDependencies - Dependency array of user options/selections. Must be updated immutably.
 * @param {React.RefObject} continueButtonRef - Ref targeting the navigation continue/review button.
 * @param {string} [scrollBehavior='smooth'] - Scroll behavior for step transitions ('smooth' | 'auto').
 */
export function useWizardAutoScroll({
  step,
  selectionDependencies = [],
  continueButtonRef,
  scrollBehavior = 'smooth'
}) {
  // 1. Scroll to top of the viewport on step change.
  useEffect(() => {
    const handle = requestAnimationFrame(() => {
      window.scrollTo({
        top: 0,
        behavior: scrollBehavior
      });
    });

    // Fallback timer to override Next.js client-side scroll restoration
    const timer = setTimeout(() => {
      window.scrollTo({
        top: 0,
        behavior: scrollBehavior
      });
    }, 50);

    return () => {
      cancelAnimationFrame(handle);
      clearTimeout(timer);
    };
  }, [step, scrollBehavior]);

  // 2. Scroll the Continue button into view when selections change.
  const isFirstRender = useRef(true);
  const mountTimeRef = useRef(Date.now());
  const lastStepRef = useRef(step);
  const deps = [...selectionDependencies, step];

  useEffect(() => {
    // If the step changed, update the tracked step and skip scrolling
    if (lastStepRef.current !== step) {
      lastStepRef.current = step;
      return;
    }

    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    // Ignore any selection-change scroll requests within the first 500ms of mounting
    if (Date.now() - mountTimeRef.current < 500) {
      return;
    }

    const timer = setTimeout(() => {
      const btn = continueButtonRef?.current;
      if (!btn) return;

      const rect = btn.getBoundingClientRect();
      const viewportHeight = window.innerHeight || document.documentElement.clientHeight;

      // Check if the button is fully visible with a 60px margin from the bottom of the viewport
      const isFullyVisible = rect.top >= 40 && rect.bottom <= viewportHeight - 60;

      if (!isFullyVisible) {
        // Scroll to the bottom of the document to focus the Continue button completely
        window.scrollTo({
          top: document.documentElement.scrollHeight,
          behavior: 'smooth'
        });
      }
    }, 100);

    return () => clearTimeout(timer);
  }, deps); // Stable selection and step dependencies array
}
