import { useEffect, useState, useMemo } from 'react';

import { LogTypeSelector } from '../logTypeSelector';
import { MeetingForm } from '../meetingForm';
import { TaskForm } from '../taskForm';

import { EntryType } from '../../types';
import { OptionType } from '../../types';
import { getChromeStorageData } from '../../utils/chromeStorageUtils';
import { loadTheme } from '../../utils/theme';
import { addEntry, handleDeleteEntry } from '../../utils/entryUtils';
import { EntriesList } from '../entriesList';
import { Button } from '../ui/button';
import { DatePicker } from '../ui/datePicker';
import { CopyIcon } from 'lucide-react';
import { format } from 'date-fns';
import { isToday } from '../../utils/dateTimeUtils';
import TotalTimeDisplay from '../totalTimeDisplay';

const Logger = () => {
  const [logType, setLogType] = useState<'Meeting' | 'Task'>('Task');
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

  // hack to record task after if has been done once
  useEffect(() => {
    if (taskRecorded) {
      setTimeout(() => {
        setTaskRecorded(false);
      }, 2000);
    }
  }, [taskRecorded]);

  useEffect(() => {
    loadTheme();
    getChromeStorageData(
      ['allEntries', 'isRunning'],
      (result: Record<string, unknown>) => {
        const allEntries =
          (result.allEntries as Record<string, EntryType[]>) || {};
        const today = format(selectedDate ?? new Date(), 'yyyy-MM-dd');
        const _todayEntries = allEntries[today] || [];
        setTodayEntries(_todayEntries);
      }
    );
  }, [selectedDate]);

  const handleAddEntry = () => {
    if (!selectedProject || !selectedDuration || !isToday(selectedDate)) {
      return;
    }

    let entryText = `Project: ${selectedProject.label} - ${selectedDuration.label}`;

    if (logType === 'Meeting' && selectedPerson) {
      entryText = `Meeting: ${selectedPerson.label} - ${selectedDuration.label} (Project: ${selectedProject.label})`;
    }

    addEntry(entryText, todayEntries, setTodayEntries);
    setTaskRecorded(true);
    resetFields();
  };

  const resetFields = () => {
    setSelectedPerson(null);
    setSelectedProject(null);
    setSelectedDuration(null);
  };

  const copyEntries = () => {
    navigator.clipboard.writeText(todayEntries.map((e) => e.entry).join('\n'));
  };

  const isAddEntryDisabled = useMemo(() => {
    if (logType === 'Meeting') {
      return !selectedPerson || !selectedProject || !selectedDuration;
    }
    return !selectedProject || !selectedDuration;
  }, [logType, selectedPerson, selectedProject, selectedDuration]);

  const handleDeleteEntryWrapper = (id: string) => {
    handleDeleteEntry(id, todayEntries, setTodayEntries, selectedDate);
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
        <Button
          onClick={handleAddEntry}
          disabled={isAddEntryDisabled}
          variant='default'
        >
          ➕ Add Entry
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
        {todayEntries.length > 0 && (
          <EntriesList
            entries={todayEntries}
            handleDeleteEntry={handleDeleteEntryWrapper}
            selectedDate={selectedDate ?? new Date()}
          />
        )}
      </div>
      <Button
        onClick={copyEntries}
        variant='floating'
        className='group bg-primary text-white pl-4 pr-4 hover:pr-6 transition-all duration-300 flex items-center overflow-hidden'
      >
        <span className='whitespace-nowrap hidden max-w-0 opacity-0 group-hover:max-w-[100px] group-hover:opacity-100 group-hover:mr-1 group-hover:flex transition-all duration-300 ease-in-out'>
          Copy
        </span>

        <CopyIcon className='w-4 h-4 shrink-0' />
      </Button>
    </div>
  );
};

export default Logger;
