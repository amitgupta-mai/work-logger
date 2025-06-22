import { useEffect, useState, useMemo, useCallback } from 'react';
import { toast } from 'react-toastify';

import { LogTypeSelector } from '../logTypeSelector';
import { MeetingForm } from '../meetingForm';
import { TaskForm } from '../taskForm';

import { EntryType, LogType } from '../../types';
import { OptionType } from '../../types';
import { getStorageDataAsync } from '../../utils/chromeStorageUtils';
import { loadTheme } from '../../utils/theme';
import { addEntry, handleDeleteEntry } from '../../utils/entryUtils';
import {
  combineValidations,
  validateProject,
  validatePerson,
  validateDuration,
} from '../../utils/validationUtils';
import { EntriesList } from '../entriesList';
import { Button } from '../ui/button';
import { DatePicker } from '../ui/datePicker';
import { CopyIcon, DownloadIcon, AlertCircleIcon } from 'lucide-react';
import { format } from 'date-fns';
import { isToday } from '../../utils/dateTimeUtils';
import TotalTimeDisplay from '../totalTimeDisplay';

const Logger = () => {
  const [logType, setLogType] = useState<LogType>('Task');
  const [selectedProject, setSelectedProject] = useState<OptionType | null>(
    null
  );
  const [selectedDuration, setSelectedDuration] = useState<{
    value: number;
    label: string;
  } | null>(null);
  const [todayEntries, setTodayEntries] = useState<EntryType[]>([]);
  const [selectedPerson, setSelectedPerson] = useState<OptionType | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [taskRecorded, setTaskRecorded] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // hack to record task after if has been done once
  useEffect(() => {
    if (taskRecorded) {
      setTimeout(() => {
        setTaskRecorded(false);
      }, 2000);
    }
  }, [taskRecorded]);

  const loadEntries = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await getStorageDataAsync(['allEntries']);
      if (response.success && response.data) {
        const allEntries =
          (response.data.allEntries as Record<string, EntryType[]>) || {};
        const today = format(selectedDate ?? new Date(), 'yyyy-MM-dd');
        const _todayEntries = allEntries[today] || [];
        setTodayEntries(_todayEntries);
      } else {
        console.error('Failed to load entries:', response.error);
        toast.error('Failed to load entries');
      }
    } catch (error) {
      console.error('Error loading entries:', error);
      toast.error('Error loading entries');
    } finally {
      setIsLoading(false);
    }
  }, [selectedDate]);

  useEffect(() => {
    loadTheme();
    loadEntries();
  }, [loadEntries]);

  const validateForm = useCallback((): boolean => {
    const validations = [
      validateProject(selectedProject),
      validateDuration(selectedDuration?.value || null),
    ];

    if (logType === 'Meeting') {
      validations.push(validatePerson(selectedPerson));
    }

    const combinedValidation = combineValidations(...validations);
    setValidationErrors(combinedValidation.errors);
    return combinedValidation.isValid;
  }, [logType, selectedProject, selectedDuration, selectedPerson]);

  const handleAddEntry = async () => {
    if (!validateForm()) {
      toast.error('Please fix the validation errors');
      return;
    }

    if (!isToday(selectedDate)) {
      toast.error('You can only add entries for today');
      return;
    }

    setIsLoading(true);
    try {
      let entryText = `Project: ${selectedProject?.label} - ${selectedDuration?.label}`;

      if (logType === 'Meeting' && selectedPerson) {
        entryText = `Meeting: ${selectedPerson.label} - ${selectedDuration?.label} (Project: ${selectedProject?.label})`;
      }

      const success = await addEntry(
        entryText,
        todayEntries,
        setTodayEntries,
        logType,
        selectedProject?.label,
        selectedDuration?.value,
        selectedPerson?.label
      );

      if (success) {
        setTaskRecorded(true);
        resetFields();
        toast.success('Entry added successfully!');
      } else {
        toast.error('Failed to add entry');
      }
    } catch (error) {
      console.error('Error adding entry:', error);
      toast.error('Error adding entry');
    } finally {
      setIsLoading(false);
    }
  };

  const resetFields = () => {
    setSelectedPerson(null);
    setSelectedProject(null);
    setSelectedDuration(null);
    setValidationErrors([]);
  };

  const copyEntries = async () => {
    try {
      const entriesText = todayEntries.map((e) => e.entry).join('\n');
      await navigator.clipboard.writeText(entriesText);
      toast.success('Entries copied to clipboard!');
    } catch (error) {
      console.error('Failed to copy entries:', error);
      toast.error('Failed to copy entries');
    }
  };

  const exportEntries = () => {
    try {
      const csvData = todayEntries
        .map((entry) => {
          return `${entry.date},${entry.type || 'Task'},${
            entry.project || ''
          },${entry.person || ''},${entry.duration || 0},${entry.entry}`;
        })
        .join('\n');

      const headers = 'Date,Type,Project,Person,Duration (min),Description\n';
      const fullCSV = headers + csvData;

      const blob = new Blob([fullCSV], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `work-logger-${format(selectedDate, 'yyyy-MM-dd')}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success('Entries exported successfully!');
    } catch (error) {
      console.error('Failed to export entries:', error);
      toast.error('Failed to export entries');
    }
  };

  const isAddEntryDisabled = useMemo(() => {
    if (isLoading) return true;
    if (logType === 'Meeting') {
      return !selectedPerson || !selectedProject || !selectedDuration;
    }
    return !selectedProject || !selectedDuration;
  }, [logType, selectedPerson, selectedProject, selectedDuration, isLoading]);

  const handleDeleteEntryWrapper = async (id: string) => {
    try {
      const success = await handleDeleteEntry(
        id,
        todayEntries,
        setTodayEntries,
        selectedDate
      );
      if (success) {
        toast.success('Entry deleted successfully!');
      } else {
        toast.error('Failed to delete entry');
      }
    } catch (error) {
      console.error('Error deleting entry:', error);
      toast.error('Error deleting entry');
    }
  };

  return (
    <div>
      <div className='flex flex-col gap-4 mt-2'>
        <div className='flex flex-row justify-between items-center'>
          <LogTypeSelector logType={logType} setLogType={setLogType} />
          <TotalTimeDisplay todayEntries={todayEntries} />
        </div>

        {logType === 'Meeting' && (
          <MeetingForm
            selectedPerson={selectedPerson}
            setSelectedPerson={setSelectedPerson}
            selectedProject={selectedProject}
            setSelectedProject={setSelectedProject}
            selectedDuration={selectedDuration}
            setSelectedDuration={setSelectedDuration}
          />
        )}
        {logType === 'Task' && (
          <TaskForm
            selectedProject={selectedProject}
            setSelectedProject={setSelectedProject}
            selectedDuration={selectedDuration}
            setSelectedDuration={setSelectedDuration}
            taskRecorded={taskRecorded}
          />
        )}

        {validationErrors.length > 0 && (
          <div className='flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md'>
            <AlertCircleIcon className='w-4 h-4 text-red-500' />
            <div className='text-sm text-red-700'>
              {validationErrors.map((error, index) => (
                <div key={index}>{error}</div>
              ))}
            </div>
          </div>
        )}

        <Button
          onClick={handleAddEntry}
          disabled={isAddEntryDisabled}
          variant='default'
          className='w-full'
        >
          {isLoading ? 'Adding...' : '➕ Add Entry'}
        </Button>
      </div>

      <div className='mt-4'>
        <div className='flex flex-row gap-2 items-center'>
          <h3 className='text-lg font-semibold'>Logs for: </h3>
          <DatePicker
            className='w-2/3'
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
          />
        </div>

        {isLoading ? (
          <div className='mt-4 text-center text-muted-foreground'>
            Loading entries...
          </div>
        ) : todayEntries.length > 0 ? (
          <EntriesList
            entries={todayEntries}
            handleDeleteEntry={handleDeleteEntryWrapper}
            selectedDate={selectedDate ?? new Date()}
          />
        ) : (
          <div className='mt-4 text-center text-muted-foreground'>
            No entries for this date
          </div>
        )}
      </div>

      {todayEntries.length > 0 && (
        <div className='flex gap-2 mt-4'>
          <Button
            onClick={copyEntries}
            variant='outline'
            size='sm'
            className='flex items-center gap-2'
          >
            <CopyIcon className='w-4 h-4' />
            Copy
          </Button>
          <Button
            onClick={exportEntries}
            variant='outline'
            size='sm'
            className='flex items-center gap-2'
          >
            <DownloadIcon className='w-4 h-4' />
            Export CSV
          </Button>
        </div>
      )}
    </div>
  );
};

export default Logger;
