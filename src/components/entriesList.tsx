import { useMemo } from 'react';
import Entry from './entry';

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
    return (
      selectedDate?.toISOString().split('T')[0] ===
      new Date().toISOString().split('T')[0]
    );
  }, [selectedDate]);

  return (
    <ul className='entries-list'>
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
