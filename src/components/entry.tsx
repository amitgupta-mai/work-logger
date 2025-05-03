import {
  AlertDialogCancel,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from './ui/alert-dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogFooter,
} from './ui/alert-dialog';
import { Trash2Icon } from 'lucide-react';

interface EntryProps {
  entry: string;
  onDelete: () => void;
  isDeletable: boolean;
}

const Entry: React.FC<EntryProps> = ({ entry, onDelete, isDeletable }) => {
  return (
    <div className='entry'>
      <span>{entry}</span>
      {isDeletable && (
        <AlertDialog>
          <AlertDialogTrigger>
            <Trash2Icon className='w-4 h-4' />
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={onDelete}>Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
};

export default Entry;
