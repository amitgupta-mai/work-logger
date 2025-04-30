import { useMemo } from 'react';
import { EntryType } from '../types';

interface TotalTimeDisplayProps {
  todayEntries: EntryType[];
}

const TotalTimeDisplay: React.FC<TotalTimeDisplayProps> = ({
  todayEntries,
}) => {
  const computedDuration = useMemo(() => {
    const totalMinutes = todayEntries.reduce((sum, entry) => {
      const durationMatch = entry.entry.match(/(\d+) min/);
      return sum + (durationMatch ? parseInt(durationMatch[1], 10) : 0);
    }, 0);

    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours}h ${minutes}m`;
  }, [todayEntries]);

  return (
    <div style={{ position: 'absolute', top: 0, right: 0, padding: '10px' }}>
      Total Time: {computedDuration}
    </div>
  );
};

export default TotalTimeDisplay;
