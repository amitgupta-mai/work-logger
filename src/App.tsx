import { useEffect, useState } from 'react';
import { Header } from './components/header';
import { LogTypeSelector } from './components/logTypeSelector';
import { MeetingForm } from './components/meetingForm';
import { TaskForm } from './components/taskForm';
import { DurationSelector } from './ui/durationSelector';
import { EntriesList } from './components/entriesList';
import { setTheme, loadTheme } from './utils/theme';
import { EntryType, OptionType } from './types';
import './App.css';

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
  const [entries, setEntries] = useState<EntryType[]>([]);
  const [theme, setThemeState] = useState<'light' | 'dark'>('dark');
  const [todayEntries, setTodayEntries] = useState<EntryType[]>([]);

  useEffect(() => {
    loadTheme();
    chrome.storage.local.get(['allEntries'], (result) => {
      const today = new Date().toISOString().split('T')[0];
      const _todayEntries = result.allEntries?.filter(
        (entry: EntryType) => entry.date === today
      );
      if (_todayEntries) {
        setTodayEntries(_todayEntries);
      }
    });
  }, []);

  useEffect(() => {
    chrome.storage.local.set({ allEntries: entries });
  }, [entries]);

  const handleAddEntry = () => {
    const today = new Date().toISOString().split('T')[0];
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
        {
          entry: `Meeting: ${selectedMeeting.label} - ${selectedDuration.label}${projectText}`,
          date: today,
        },
      ]);
      resetFields();
    }
    if (logType === 'task' && selectedTask && selectedDuration) {
      if (!tasks.find((t) => t.value === selectedTask.value)) {
        setTasks((prev) => [...prev, selectedTask]);
      }
      setEntries((prev) => [
        ...prev,
        {
          entry: `Task: ${selectedTask.label} - ${selectedDuration.label}`,
          date: today,
        },
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
    navigator.clipboard.writeText(entries.map((e) => e.entry).join('\n'));
  };

  return (
    <div className='container'>
      <Header theme={theme} toggleTheme={toggleTheme} />
      <LogTypeSelector logType={logType} setLogType={setLogType} />
      {logType === 'meeting' && (
        <MeetingForm
          meetings={meetings}
          selectedMeeting={selectedMeeting}
          setSelectedMeeting={setSelectedMeeting}
          projects={projects}
          selectedProject={selectedProject}
          setSelectedProject={setSelectedProject}
        />
      )}
      {logType === 'task' && (
        <TaskForm
          tasks={tasks}
          selectedTask={selectedTask}
          setSelectedTask={setSelectedTask}
        />
      )}
      <DurationSelector
        selectedDuration={selectedDuration}
        setSelectedDuration={setSelectedDuration}
      />
      <button onClick={handleAddEntry} className='add-entry'>
        ➕ Add Entry
      </button>
      <h3>Today's Log</h3>
      <EntriesList entries={todayEntries.map((e) => e.entry)} />
      <button onClick={copyEntries} className='copy-all'>
        📋 Copy All
      </button>
    </div>
  );
};

export default App;
