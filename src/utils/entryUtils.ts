import { EntryType, LogType } from '../types';
import { getDateKey, getCurrentDateKey, formatDuration } from './dateTimeUtils';
import { setStorageDataAsync, getStorageDataAsync } from './chromeStorageUtils';

export const addEntry = async (
  entryText: string,
  todayEntries: EntryType[],
  setTodayEntries: React.Dispatch<React.SetStateAction<EntryType[]>>,
  type: LogType = 'Task',
  project?: string,
  duration?: number,
  person?: string
): Promise<boolean> => {
  try {
    const today = getCurrentDateKey();
    const entryId = new Date().toISOString();
    const newEntry: EntryType = {
      id: entryId,
      entry: entryText,
      date: today,
      timestamp: Date.now(),
      type,
      project,
      duration,
      person,
    };

    setTodayEntries([newEntry, ...todayEntries]);

    const response = await getStorageDataAsync(['allEntries']);
    if (!response.success) {
      console.error('Failed to get storage data:', response.error);
      return false;
    }

    const allEntries =
      (response.data?.allEntries as Record<string, EntryType[]>) || {};
    const dateEntries = allEntries[today] || [];
    allEntries[today] = [newEntry, ...dateEntries];

    const setResponse = await setStorageDataAsync({ allEntries });
    if (!setResponse.success) {
      console.error('Failed to save entry:', setResponse.error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error adding entry:', error);
    return false;
  }
};

export const handleDeleteEntry = async (
  entryId: string,
  todayEntries: EntryType[],
  setTodayEntries: React.Dispatch<React.SetStateAction<EntryType[]>>,
  selectedDate: Date
): Promise<boolean> => {
  try {
    setTodayEntries(todayEntries.filter((entry) => entry.id !== entryId));

    const response = await getStorageDataAsync(['allEntries']);
    if (!response.success) {
      console.error('Failed to get storage data:', response.error);
      return false;
    }

    const allEntries =
      (response.data?.allEntries as Record<string, EntryType[]>) || {};
    const today = getDateKey(selectedDate);

    if (allEntries[today]) {
      allEntries[today] = allEntries[today].filter(
        (entry: EntryType) => entry.id !== entryId
      );
    }

    const setResponse = await setStorageDataAsync({ allEntries });
    if (!setResponse.success) {
      console.error('Failed to delete entry:', setResponse.error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error deleting entry:', error);
    return false;
  }
};

export const updateEntry = async (
  entryId: string,
  updates: Partial<EntryType>,
  todayEntries: EntryType[],
  setTodayEntries: React.Dispatch<React.SetStateAction<EntryType[]>>,
  selectedDate: Date
): Promise<boolean> => {
  try {
    const updatedEntries = todayEntries.map((entry) =>
      entry.id === entryId ? { ...entry, ...updates } : entry
    );
    setTodayEntries(updatedEntries);

    const response = await getStorageDataAsync(['allEntries']);
    if (!response.success) {
      console.error('Failed to get storage data:', response.error);
      return false;
    }

    const allEntries =
      (response.data?.allEntries as Record<string, EntryType[]>) || {};
    const today = getDateKey(selectedDate);

    if (allEntries[today]) {
      allEntries[today] = allEntries[today].map((entry: EntryType) =>
        entry.id === entryId ? { ...entry, ...updates } : entry
      );
    }

    const setResponse = await setStorageDataAsync({ allEntries });
    if (!setResponse.success) {
      console.error('Failed to update entry:', setResponse.error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error updating entry:', error);
    return false;
  }
};

export const getEntriesForDate = async (date: Date): Promise<EntryType[]> => {
  try {
    const response = await getStorageDataAsync(['allEntries']);
    if (!response.success) {
      console.error('Failed to get entries:', response.error);
      return [];
    }

    const allEntries =
      (response.data?.allEntries as Record<string, EntryType[]>) || {};
    const dateKey = getDateKey(date);
    return allEntries[dateKey] || [];
  } catch (error) {
    console.error('Error getting entries for date:', error);
    return [];
  }
};

export const getEntriesForDateRange = async (
  startDate: Date,
  endDate: Date
): Promise<EntryType[]> => {
  try {
    const response = await getStorageDataAsync(['allEntries']);
    if (!response.success) {
      console.error('Failed to get entries:', response.error);
      return [];
    }

    const allEntries =
      (response.data?.allEntries as Record<string, EntryType[]>) || {};
    const entries: EntryType[] = [];

    const currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      const dateKey = getDateKey(currentDate);
      const dayEntries = allEntries[dateKey] || [];
      entries.push(...dayEntries);
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return entries.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
  } catch (error) {
    console.error('Error getting entries for date range:', error);
    return [];
  }
};

export const calculateTotalTime = (entries: EntryType[]): number => {
  return entries.reduce((total, entry) => {
    return total + (entry.duration || 0);
  }, 0);
};

export const formatTotalTime = (entries: EntryType[]): string => {
  const totalMinutes = calculateTotalTime(entries);
  return formatDuration(totalMinutes);
};

export const groupEntriesByProject = (
  entries: EntryType[]
): Record<string, EntryType[]> => {
  return entries.reduce((groups, entry) => {
    const project = entry.project || 'Unknown';
    if (!groups[project]) {
      groups[project] = [];
    }
    groups[project].push(entry);
    return groups;
  }, {} as Record<string, EntryType[]>);
};

export const exportEntries = (entries: EntryType[]): string => {
  const csvData = entries.map((entry) => {
    return `${entry.date},${entry.type || 'Task'},${entry.project || ''},${
      entry.person || ''
    },${entry.duration || 0},${entry.entry}`;
  });

  const headers = 'Date,Type,Project,Person,Duration (min),Description\n';
  return headers + csvData.join('\n');
};

export const importEntries = (csvData: string): EntryType[] => {
  try {
    const lines = csvData.split('\n').filter((line) => line.trim());
    const entries: EntryType[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',');
      if (values.length >= 6) {
        const entry: EntryType = {
          id: new Date().toISOString() + i,
          date: values[0],
          type: values[1] as LogType,
          project: values[2],
          person: values[3],
          duration: parseInt(values[4]) || 0,
          entry: values[5],
          timestamp: Date.now(),
        };
        entries.push(entry);
      }
    }

    return entries;
  } catch (error) {
    console.error('Error importing entries:', error);
    return [];
  }
};
