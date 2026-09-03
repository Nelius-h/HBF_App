import { useEffect, useRef } from 'react';
import { backNavigation } from '../services/backNavigation';

/**
 * Hook to attach an action to the user's phone / browser hardware back button.
 *
 * @param isActive Boolean indicating whether this back-action is currently active (e.g. modal is open, subview is active, non-home tab is active)
 * @param onBack Callback function to trigger when the user presses the phone's back button
 * @param name Descriptive name for debugging/stack tracking (e.g. 'client-cases-detail', 'emergency-modal')
 * @param priority Optional priority (higher is popped first)
 */
export function useBackButton(
  isActive: boolean,
  onBack: () => void,
  name: string,
  priority?: number
): void {
  const onBackRef = useRef(onBack);
  onBackRef.current = onBack;

  useEffect(() => {
    if (!isActive) return;

    const id = backNavigation.push({
      name,
      priority,
      onBack: () => {
        onBackRef.current();
      },
    });

    return () => {
      backNavigation.pop(id);
    };
  }, [isActive, name, priority]);
}
