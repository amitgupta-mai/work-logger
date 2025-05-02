import { useEffect, useState, useMemo } from "react";
import { Header } from "./components/header";
import { LogTypeSelector } from "./components/logTypeSelector";
import { MeetingForm } from "./components/meetingForm";
import { TaskForm } from "./components/taskForm";
import { EntriesList } from "./components/entriesList";
import { loadTheme, toggleTheme } from "./utils/theme";
import { EntryType, OptionType } from "./types";
import { addEntry, handleDeleteEntry } from "./utils/entryUtils";
import TotalTimeDisplay from "./components/totalTimeDisplay";
import DateSelector from "./components/dateSelector";
import { getChromeStorageData } from "./utils/chromeStorageUtils";

import "./App.css";
import "react-confirm-alert/src/react-confirm-alert.css";

const App = () => {
  const [logType, setLogType] = useState<"meeting" | "task">("task");
  const [selectedProject, setSelectedProject] = useState<OptionType | null>(
    null
  );
  const [selectedDuration, setSelectedDuration] = useState<{
    value: number;
    label: string;
  } | null>(null);
  const [theme, setThemeState] = useState<"light" | "dark">("dark");
  const [todayEntries, setTodayEntries] = useState<EntryType[]>([]);
  const [selectedPerson, setSelectedPerson] = useState<OptionType | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [taskRecorded, setTaskRecorded] = useState(false);

  useEffect(() => {
    loadTheme();
    getChromeStorageData(
      ["allEntries", "isRunning"],
      (result: Record<string, unknown>) => {
        const allEntries =
          (result.allEntries as Record<string, EntryType[]>) || {};
        const today = (selectedDate ?? new Date()).toISOString().split("T")[0];
        const _todayEntries = allEntries[today] || [];
        setTodayEntries(_todayEntries);
      }
    );
  }, [selectedDate]);

  const handleAddEntry = () => {
    if (!selectedProject || !selectedDuration) {
      return;
    }

    let entryText = `Project: ${selectedProject.label} - ${selectedDuration.label}`;

    if (logType === "meeting" && selectedPerson) {
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
    navigator.clipboard.writeText(todayEntries.map((e) => e.entry).join("\n"));
  };

  const isAddEntryDisabled = useMemo(() => {
    if (logType === "meeting") {
      return !selectedPerson || !selectedProject || !selectedDuration;
    }
    return !selectedProject || !selectedDuration;
  }, [logType, selectedPerson, selectedProject, selectedDuration]);

  const handleDeleteEntryWrapper = (id: string) => {
    handleDeleteEntry(id, todayEntries, setTodayEntries, selectedDate);
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <TotalTimeDisplay todayEntries={todayEntries} />
      <Header
        theme={theme}
        toggleTheme={() => toggleTheme(theme, setThemeState)}
      />
      <LogTypeSelector logType={logType} setLogType={setLogType} />
      {logType === "meeting" && (
        <MeetingForm
          selectedPerson={selectedPerson}
          setSelectedPerson={setSelectedPerson}
          selectedProject={selectedProject}
          setSelectedProject={setSelectedProject}
          selectedDuration={selectedDuration}
          setSelectedDuration={setSelectedDuration}
        />
      )}
      {logType === "task" && (
        <TaskForm
          selectedProject={selectedProject}
          setSelectedProject={setSelectedProject}
          selectedDuration={selectedDuration}
          setSelectedDuration={setSelectedDuration}
          taskRecorded={taskRecorded}
        />
      )}
      <button
        onClick={handleAddEntry}
        disabled={isAddEntryDisabled}
        className={`w-full md:w-auto py-2 px-4 rounded-md ${
          isAddEntryDisabled
            ? "bg-gray-400 cursor-not-allowed text-white "
            : "bg-red-600 hover:bg-red-700 text-white"
        } transition-colors duration-200`}
      >
        ➕ Add Entry
      </button>
      <div className="entries-container">
        <h3 className="mt-2.5 mb-2.5">
          Logs for {selectedDate?.toLocaleDateString()}
        </h3>
        <div className="w-full mb-4">
          <DateSelector
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
      <button
        onClick={copyEntries}
        className="w-full md:w-auto py-2 px-4 mt-4 rounded-md bg-blue-500 hover:bg-blue-600 text-white transition-colors duration-200"
      >
        📋 Copy All
      </button>
    </div>
  );
};

export default App;
