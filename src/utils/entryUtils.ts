import { confirmAlert } from 'react-confirm-alert';
import { EntryType } from '../types';
import { toast } from 'react-toastify';
import 'react-confirm-alert/src/react-confirm-alert.css';

export const addEntry = (
  entryText: string,
  todayEntries: EntryType[],
  setTodayEntries: React.Dispatch<React.SetStateAction<EntryType[]>>
) => {
  const today = new Date().toISOString().split('T')[0];
  const entryId = new Date().toISOString();
  const newEntry = { id: entryId, entry: entryText, date: today };

  setTodayEntries([newEntry, ...todayEntries]);

  chrome.storage.local.get(['allEntries'], (result) => {
    const allEntries = result.allEntries || {};
    const dateEntries = allEntries[today] || [];
    allEntries[today] = [newEntry, ...dateEntries];
    chrome.storage.local.set({ allEntries });
  });
};

export const handleDeleteEntry = (
  entryId: string,
  todayEntries: EntryType[],
  setTodayEntries: React.Dispatch<React.SetStateAction<EntryType[]>>,
  selectedDate: Date | null
) => {
  confirmAlert({
    title: 'Confirm to delete',
    message: 'Are you sure you want to delete this entry?',
    buttons: [
      {
        label: 'Yes',
        onClick: () => {
          setTodayEntries(todayEntries.filter((entry) => entry.id !== entryId));
          chrome.storage.local.get(['allEntries'], (result) => {
            const allEntries = result.allEntries || {};
            const today = (selectedDate ?? new Date())
              .toISOString()
              .split('T')[0];
            allEntries[today] = allEntries[today].filter(
              (entry: EntryType) => entry.id !== entryId
            );
            chrome.storage.local.set({ allEntries });
          });
          toast.success('Entry deleted successfully!');
        },
      },
      {
        label: 'No',
        onClick: () => {},
      },
    ],
  });
};
