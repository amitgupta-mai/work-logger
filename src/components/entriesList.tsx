export const EntriesList = ({ entries }: { entries: string[] }) => {
  console.log({ entries });
  return (
    <ul className='entries-list'>
      {entries.map((entry, index) => (
        <li key={index}>{entry}</li>
      ))}
    </ul>
  );
};
