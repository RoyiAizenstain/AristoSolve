import { useEffect } from 'react';

export default function Toast({ message, type = 'success', onDismiss }) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 3000);
    return () => clearTimeout(t);
  }, [onDismiss]);

  return (
    <div className={`toast toast-${type}`} role="status" aria-live="polite">
      {type === 'success' ? '✓' : '✖'} {message}
    </div>
  );
}
