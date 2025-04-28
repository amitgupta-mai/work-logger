import { useEffect, useState } from 'react';
import Select from 'react-select';
import CreatableSelect from 'react-select/creatable';
import { setTheme, loadTheme } from './utils/theme';
import './App.css';
const durationOptions = Array.from({ length: 32 }, (_, i) => ({
  value: (i + 1) * 15,
  label: `${(i + 1) * 15} min`,
}));

type OptionType = { label: string; value: string };

const App = () => {
  const [logType, setLogType] = useState<'meeting' | 'task'>('meeting');
  const [meetings, setMeetings] = useState<OptionType[]>([]);
  const [projects, setProjects] = useState<OptionType[]>([]);
  const [tasks, setTasks] = useState<OptionType[]>([]);
  const [selectedMeeting, setSelectedMeeting] = useState<OptionType | null>(
    null
  );
  const [selectedProject, setSelectedProject] = useState<OptionType | null>(
    null
  );
  const [selectedTask, setSelectedTask] = useState<OptionType | null>(null);
  const [selectedDuration, setSelectedDuration] = useState<{
    value: number;
    label: string;
  } | null>(null);
  const [entries, setEntries] = useState<string[]>([]);
  const [theme, setThemeState] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    loadTheme();
    chrome.storage.local.get(
      ['todayEntries'],
      (result: { todayEntries?: string[] }) => {
        if (result.todayEntries) {
          setEntries(result.todayEntries);
        }
      }
    );
  }, []);

  useEffect(() => {
    chrome.storage.local.set({ todayEntries: entries });
  }, [entries]);

  const handleAddEntry = () => {
    if (logType === 'meeting' && selectedMeeting && selectedDuration) {
      if (!meetings.find((m) => m.value === selectedMeeting.value)) {
        setMeetings((prev) => [...prev, selectedMeeting]);
      }
      if (
        selectedProject &&
        !projects.find((p) => p.value === selectedProject.value)
      ) {
        setProjects((prev) => [...prev, selectedProject]);
      }
      const projectText = selectedProject
        ? ` (Project: ${selectedProject.label})`
        : '';
      setEntries((prev) => [
        ...prev,
        `Meeting: ${selectedMeeting.label} - ${selectedDuration.label}${projectText}`,
      ]);
      resetFields();
    }
    if (logType === 'task' && selectedTask && selectedDuration) {
      if (!tasks.find((t) => t.value === selectedTask.value)) {
        setTasks((prev) => [...prev, selectedTask]);
      }
      setEntries((prev) => [
        ...prev,
        `Task: ${selectedTask.label} - ${selectedDuration.label}`,
      ]);
      resetFields();
    }
  };

  const resetFields = () => {
    setSelectedMeeting(null);
    setSelectedProject(null);
    setSelectedTask(null);
    setSelectedDuration(null);
  };

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    setThemeState(newTheme);
  };

  const copyEntries = () => {
    navigator.clipboard.writeText(entries.join('\n'));
  };

  const startNewDay = () => {
    if (confirm('Are you sure you want to start a new day?')) {
      setEntries([]);
      chrome.storage.local.remove('todayEntries');
    }
  };

  return (
    <div className='container'>
      <div className='header'>
        <h2>Work Logger</h2>
        <button onClick={toggleTheme} className='theme-toggle'>
          {theme === 'light' ? '🌙' : '☀️'}
        </button>
      </div>

      <select
        value={logType}
        onChange={(e) => setLogType(e.target.value as 'meeting' | 'task')}
        className='select-type'
      >
        <option value='meeting'>Meeting</option>
        <option value='task'>Task</option>
      </select>

      {logType === 'meeting' && (
        <>
          <CreatableSelect
            placeholder='Select or type meeting name'
            value={selectedMeeting}
            onChange={(e) => setSelectedMeeting(e)}
            onCreateOption={(inputValue) =>
              setSelectedMeeting({ label: inputValue, value: inputValue })
            }
            options={meetings}
            isClearable
            isSearchable
          />
          <CreatableSelect
            placeholder='Select or type project name'
            value={selectedProject}
            onChange={(e) => setSelectedProject(e)}
            onCreateOption={(inputValue) =>
              setSelectedProject({ label: inputValue, value: inputValue })
            }
            options={projects}
            isClearable
            isSearchable
          />
        </>
      )}

      {logType === 'task' && (
        <CreatableSelect
          placeholder='Select or type task name'
          value={selectedTask}
          onChange={(e) => setSelectedTask(e)}
          onCreateOption={(inputValue) =>
            setSelectedTask({ label: inputValue, value: inputValue })
          }
          options={tasks}
          isClearable
          isSearchable
        />
      )}

      <Select
        placeholder='Select duration'
        value={selectedDuration}
        onChange={(e) => setSelectedDuration(e)}
        options={durationOptions}
      />

      <button onClick={handleAddEntry} className='add-entry'>
        ➕ Add Entry
      </button>

      <h3>Today's Log</h3>

      <button onClick={startNewDay} className='start-new-day'>
        🌅 Start New Day
      </button>

      <ul className='entries-list'>
        {entries.map((entry, index) => (
          <li key={index}>{entry}</li>
        ))}
      </ul>

      <button onClick={copyEntries} className='copy-all'>
        📋 Copy All
      </button>
    </div>
  );
};

export default App;
