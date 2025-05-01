import { useEffect, useState, useMemo } from 'react';
import { Header } from './components/header';
import { LogTypeSelector } from './components/logTypeSelector';
import { MeetingForm } from './components/meetingForm';
import { TaskForm } from './components/taskForm';
import { EntriesList } from './components/entriesList';
import { loadTheme, toggleTheme } from './utils/theme';
import { EntryType, OptionType } from './types';
import { addEntry, handleDeleteEntry } from './utils/entryUtils';
import TotalTimeDisplay from './components/totalTimeDisplay';
import DateSelector from './components/dateSelector';
import { getChromeStorageData } from './utils/chromeStorageUtils';

import './App.css';
import 'react-confirm-alert/src/react-confirm-alert.css';

const App = () => {
  const [logType, setLogType] = useState<'meeting' | 'task'>('task');
  const [selectedProject, setSelectedProject] = useState<OptionType | null>(
    null
  );
  const [selectedDuration, setSelectedDuration] = useState<{
    value: number;
    label: string;
  } | null>(null);
  const [theme, setThemeState] = useState<'light' | 'dark'>('dark');
  const [todayEntries, setTodayEntries] = useState<EntryType[]>([]);
  const [selectedPerson, setSelectedPerson] = useState<OptionType | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadTheme();
    getChromeStorageData(
      ['allEntries', 'isRunning'],
      (result: Record<string, unknown>) => {
        const allEntries =
          (result.allEntries as Record<string, EntryType[]>) || {};
        const today = (selectedDate ?? new Date()).toISOString().split('T')[0];
        const _todayEntries = allEntries[today] || [];
        setTodayEntries(_todayEntries);
        setIsLoading(false);
      }
    );
  }, [selectedDate]);

  const handleAddEntry = () => {
    if (!selectedProject || !selectedDuration) {
      return;
    }

    let entryText = `Project: ${selectedProject.label} - ${selectedDuration.label}`;

    if (logType === 'meeting' && selectedPerson) {
      entryText = `Meeting: ${selectedPerson.label} - ${selectedDuration.label} (Project: ${selectedProject.label})`;
    }

    addEntry(entryText, todayEntries, setTodayEntries);
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
    if (logType === 'meeting') {
      return !selectedPerson || !selectedProject || !selectedDuration;
    }
    return !selectedProject || !selectedDuration;
  }, [logType, selectedPerson, selectedProject, selectedDuration]);

  const handleDeleteEntryWrapper = (id: string) => {
    handleDeleteEntry(id, todayEntries, setTodayEntries, selectedDate);
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className='container' style={{ position: 'relative' }}>
      <TotalTimeDisplay todayEntries={todayEntries} />
      <Header
        theme={theme}
        toggleTheme={() => toggleTheme(theme, setThemeState)}
      />
      <LogTypeSelector logType={logType} setLogType={setLogType} />
      {logType === 'meeting' && (
        <MeetingForm
          selectedPerson={selectedPerson}
          setSelectedPerson={setSelectedPerson}
          selectedProject={selectedProject}
          setSelectedProject={setSelectedProject}
          selectedDuration={selectedDuration}
          setSelectedDuration={setSelectedDuration}
        />
      )}
      {logType === 'task' && (
        <TaskForm
          selectedProject={selectedProject}
          setSelectedProject={setSelectedProject}
          selectedDuration={selectedDuration}
          setSelectedDuration={setSelectedDuration}
        />
      )}
      <button
        onClick={handleAddEntry}
        disabled={isAddEntryDisabled}
        className={isAddEntryDisabled ? 'add-entry disabled' : 'add-entry'}
      >
        ➕ Add Entry
      </button>
      <div className='entries-container'>
        <h3>Logs for {selectedDate?.toLocaleDateString()}</h3>
        <DateSelector
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
        />
        {todayEntries.length > 0 && (
          <EntriesList
            entries={todayEntries}
            handleDeleteEntry={handleDeleteEntryWrapper}
            selectedDate={selectedDate ?? new Date()}
          />
        )}
      </div>
      <button onClick={copyEntries} className='copy-all'>
        📋 Copy All
      </button>
    </div>
  );
};

export default App;
