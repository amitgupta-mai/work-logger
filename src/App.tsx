import { useEffect, useState, useMemo } from 'react';
import { Header } from './components/header';
import { LogTypeSelector } from './components/logTypeSelector';
import { MeetingForm } from './components/meetingForm';
import { TaskForm } from './components/taskForm';
import { DurationSelector } from './ui/durationSelector';
import { EntriesList } from './components/entriesList';
import { setTheme, loadTheme } from './utils/theme';
import { EntryType, OptionType } from './types';
import './App.css';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const App = () => {
  const [logType, setLogType] = useState<'meeting' | 'task'>('meeting');

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

  useEffect(() => {
    loadTheme();
    chrome.storage.local.get(['allEntries'], (result) => {
      const today = (selectedDate ?? new Date()).toISOString().split('T')[0];
      console.log({ today });
      const _todayEntries = result.allEntries?.[today] || [];
      console.log({ _todayEntries });
      setTodayEntries(_todayEntries);
    });
  }, [selectedDate]);

  const handleAddEntry = () => {
    const today = new Date().toISOString().split('T')[0];

    const addEntry = (entryText: string) => {
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

    if (
      logType === 'meeting' &&
      selectedPerson &&
      selectedProject &&
      selectedDuration
    ) {
      const projectText = selectedProject
        ? ` (Project: ${selectedProject.label})`
        : '';
      addEntry(
        `Meeting: ${selectedPerson.label} - ${selectedDuration.label}${projectText}`
      );
    }

    if (logType === 'task' && selectedProject && selectedDuration) {
      addEntry(`Project: ${selectedProject.label} - ${selectedDuration.label}`);
    }
    resetFields();
  };

  const resetFields = () => {
    setSelectedPerson(null);
    setSelectedProject(null);
    setSelectedDuration(null);
  };

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    setThemeState(newTheme);
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

  return (
    <div className='container' style={{ position: 'relative' }}>
      <Header theme={theme} toggleTheme={toggleTheme} />
      <LogTypeSelector logType={logType} setLogType={setLogType} />
      {logType === 'meeting' && (
        <MeetingForm
          selectedPerson={selectedPerson}
          setSelectedPerson={setSelectedPerson}
          selectedProject={selectedProject}
          setSelectedProject={setSelectedProject}
        />
      )}
      {logType === 'task' && (
        <TaskForm
          selectedProject={selectedProject}
          setSelectedProject={setSelectedProject}
        />
      )}
      <DurationSelector
        selectedDuration={selectedDuration}
        setSelectedDuration={setSelectedDuration}
      />
      <button
        onClick={handleAddEntry}
        disabled={isAddEntryDisabled}
        className={isAddEntryDisabled ? 'add-entry disabled' : 'add-entry'}
      >
        ➕ Add Entry
      </button>
      <div className='entries-container'>
        <h3>Logs for {selectedDate?.toLocaleDateString()}</h3>
        <DatePicker
          selected={selectedDate}
          onChange={(date) => setSelectedDate(date)}
          dateFormat='dd/MM/yyyy'
        />
      </div>
      <EntriesList entries={todayEntries.map((e) => e.entry)} />
      <button onClick={copyEntries} className='copy-all'>
        📋 Copy All
      </button>
    </div>
  );
};

export default App;
