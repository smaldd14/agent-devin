import { initSwipeSession } from '@services/swipe';
import PreferencesForm, { PreferencesFormValues } from './PreferencesForm';

interface FilterControlsProps {
  /**
   * Invoked when a new session is started, with sessionId and applied filters
   */
  onStart: (sessionId: string, filters: PreferencesFormValues) => void;
}

/**
 * Initial filter selector before starting swipe session
 */
export default function FilterControls({ onStart }: FilterControlsProps) {
  const handleSubmit = async (values: PreferencesFormValues) => {
    const res = await initSwipeSession(values);
    if (res.success && res.data) {
      onStart(res.data.sessionId, values);
    } else {
      alert('Failed to start session: ' + res.error);
    }
  };

  return (
    <div className="max-w-lg mx-auto">
      <PreferencesForm
        initialValues={{ dietary: [], cuisine: [], sites: [] }}
        onSubmit={handleSubmit}
      />
    </div>
  );
}