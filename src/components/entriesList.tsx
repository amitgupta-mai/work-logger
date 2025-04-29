import Entry from './entry';

export const EntriesList = ({
  entries,
  handleDeleteEntry,
  selectedDate,
}: {
  entries: { id: string; entry: string }[];
  handleDeleteEntry: (id: string) => void;
  selectedDate: Date;
}) => {
  return (
    <ul className='entries-list'>
      {entries.map((entry) => (
        <Entry
          key={entry.id}
          entry={entry.entry}
          onDelete={() => handleDeleteEntry(entry.id)}
          isDeletable={
            selectedDate?.toISOString().split('T')[0] ===
            new Date().toISOString().split('T')[0]
          }
        />
      ))}
    </ul>
  );
};
