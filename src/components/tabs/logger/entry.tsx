import {
  AlertDialogCancel,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '../../ui/alert-dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogFooter,
} from '../../ui/alert-dialog';
import { Trash2Icon } from 'lucide-react';
import { EntryProps } from '../../../types';

const Entry: React.FC<EntryProps & { type?: string }> = ({
  entry,
  onDelete,
  isDeletable,
  startTime,
  endTime,
  type,
}) => {
  let displayEntry = entry;
  if ((type === 'Task' || !type) && entry.startsWith('Project:')) {
    displayEntry = entry.replace(/^Project:/, 'Task:');
  }
  return (
    <div className='group flex items-center h-10 border-b border-gray-200'>
      <span className='text-xs text-muted-foreground mr-2'>
        {startTime && endTime
          ? `${startTime} - ${endTime}`
          : startTime
          ? `${startTime}`
          : endTime
          ? `${endTime}`
          : ''}
      </span>
      <span className='text-sm truncate semibold block max-w-[300px]'>
        {displayEntry}
      </span>

      {isDeletable && (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <div className='w-6 h-6 ml-2 hidden group-hover:flex flex-shrink-0 cursor-pointer rounded-md items-center justify-center'>
              <Trash2Icon className='w-4 h-4 text-red-500' />
            </div>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action will delete the entry.
              </AlertDialogDescription>
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
