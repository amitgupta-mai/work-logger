import { useMemo } from 'react';
import Entry from './entry';
import { isToday } from '@/utils/dateTimeUtils';

interface Entry {
  id: string;
  entry: string;
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

  return (
    <ul className='pb-12'>
      {entries.map((entry) => (
        <Entry
          key={entry.id}
          entry={entry.entry}
          onDelete={() => handleDeleteEntry(entry.id)}
          isDeletable={isDeletable}
        />
      ))}
    </ul>
  );
};
