import { MdDeleteForever } from "react-icons/md";

interface EntryProps {
  entry: string;
  onDelete: () => void;
  isDeletable: boolean;
}

const Entry: React.FC<EntryProps> = ({ entry, onDelete, isDeletable }) => {
  return (
    <div className="entry">
      <span>{entry}</span>
      {isDeletable && (
        <button onClick={onDelete} className="delete-button">
          <MdDeleteForever />
        </button>
      )}
    </div>
  );
};

export default Entry;
