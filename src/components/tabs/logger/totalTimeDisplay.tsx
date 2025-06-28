import { useMemo } from 'react';
import { TotalTimeDisplayProps } from '../../../types';
import { formatMinutesToHM } from './loggerUtils';

const TotalTimeDisplay: React.FC<TotalTimeDisplayProps> = ({
  todayEntries,
}) => {
  const computedDuration = useMemo(() => {
    const totalMinutes = todayEntries.reduce((sum, entry) => {
      if (typeof entry.duration === 'number') return sum + entry.duration;
      const durationMatch = entry.entry.match(/(\d+) ?min/);
      return sum + (durationMatch ? parseInt(durationMatch[1], 10) : 0);
    }, 0);
    return formatMinutesToHM(totalMinutes);
  }, [todayEntries]);

  return (
    <div className='text-sm text-muted-foreground'>
      Total Time: {computedDuration}
    </div>
  );
};

export default TotalTimeDisplay;
