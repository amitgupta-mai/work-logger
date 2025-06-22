import { useEffect, useState, useMemo, useCallback } from 'react';
import { toast } from 'sonner';

import { LogTypeSelector } from '../logTypeSelector';
import { MeetingForm } from '../meetingForm';
import { TaskForm } from '../taskForm';
import { Card, CardContent } from '../ui/card';

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
        toast.success('Entry deleted successfully');
      } else {
        toast.error('Failed to delete entry');
      }
    } catch (error) {
      console.error('Failed to delete entry:', error);
      toast.error('Failed to delete entry');
    }
  };

  return (
    <Card className='h-full grid grid-rows-[auto_1fr]'>
      <CardContent className='p-4 space-y-4'>
        <div className='flex justify-between items-center'>
          <LogTypeSelector logType={logType} setLogType={setLogType} />
          <TotalTimeDisplay todayEntries={todayEntries} />
        </div>
        {logType === 'Task' ? (
          <TaskForm
            selectedProject={selectedProject}
            setSelectedProject={setSelectedProject}
            selectedDuration={selectedDuration}
            setSelectedDuration={setSelectedDuration}
            taskRecorded={taskRecorded}
          />
        ) : (
          <MeetingForm
            selectedPerson={selectedPerson}
            setSelectedPerson={setSelectedPerson}
            selectedProject={selectedProject}
            setSelectedProject={setSelectedProject}
            selectedDuration={selectedDuration}
            setSelectedDuration={setSelectedDuration}
          />
        )}
        {validationErrors.length > 0 && (
          <div className='text-destructive text-sm p-2 rounded-md bg-destructive/10'>
            <ul className='space-y-1'>
              {validationErrors.map((error, index) => (
                <li key={index} className='flex items-center gap-2'>
                  <AlertCircleIcon className='size-4' />
                  {error}
                </li>
              ))}
            </ul>
          </div>
        )}
        <Button
          onClick={handleAddEntry}
          disabled={isAddEntryDisabled}
          className='w-full'
        >
          {isLoading ? 'Adding...' : 'Add Entry'}
        </Button>
        <div className='flex items-center gap-2'>
          <h2 className='text-base font-semibold whitespace-nowrap'>
            Logs for:
          </h2>
          <DatePicker
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            className='flex-shrink-0'
          />
        </div>
      </CardContent>
      <div className='relative overflow-y-auto hide-scrollbar-on-idle px-4 pb-4'>
        <EntriesList
          entries={todayEntries}
          handleDeleteEntry={handleDeleteEntryWrapper}
          selectedDate={selectedDate}
        />
        <div className='sticky bottom-2 right-0 flex justify-end p-2 bg-background'>
          <Button
            variant='outline'
            size='sm'
            onClick={copyEntries}
            disabled={todayEntries.length === 0}
            className='mr-2'
          >
            <CopyIcon className='mr-2 size-4' />
            Copy
          </Button>
          <Button
            variant='outline'
            size='sm'
            onClick={exportEntries}
            disabled={todayEntries.length === 0}
          >
            <DownloadIcon className='mr-2 size-4' />
            Export CSV
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default Logger;
