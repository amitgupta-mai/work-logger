import { useMemo } from 'react';
import Entry from './entry';
import { isToday } from '@/utils/dateTimeUtils';

interface Entry {
  id: string;
  entry: string;
  startTime?: string;
  endTime?: string;
}

interface EntriesListProps {
  entries: Entry[];
  handleDeleteEntry: (id: string) => void;
  selectedDate: Date;
}

export const EntriesList = ({
  entries,
  handleDeleteEntry,
  selectedDate,
}: EntriesListProps) => {
  const isDeletable = useMemo(() => {
    return isToday(selectedDate);
  }, [selectedDate]);

  if (entries.length === 0) {
    return (
      <div className='flex items-center justify-center h-full text-muted-foreground'>
        <p>No logs for this day.</p>
      </div>
    );
  }

  return (
    <ul>
      {entries.map((entry) => (
        <Entry
          key={entry.id}
          entry={entry.entry}
          onDelete={() => handleDeleteEntry(entry.id)}
          isDeletable={isDeletable}
          startTime={entry.startTime}
          endTime={entry.endTime}
        />
      ))}
    </ul>
  );
};
