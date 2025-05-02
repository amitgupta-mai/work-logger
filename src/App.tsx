import { useEffect, useState, useMemo } from "react";
import { Header } from "./components/header";
import { LogTypeSelector } from "./components/logTypeSelector";
import { MeetingForm } from "./components/meetingForm";
import { TaskForm } from "./components/taskForm";
import { DurationSelector } from "./ui/durationSelector";
import { EntriesList } from "./components/entriesList";
import { setTheme, loadTheme } from "./utils/theme";
import { EntryType, OptionType } from "./types";
import "./App.css";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { confirmAlert } from "react-confirm-alert";
import "react-confirm-alert/src/react-confirm-alert.css";

const App = () => {
  const [logType, setLogType] = useState<"meeting" | "task">("meeting");
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

  useEffect(() => {
    loadTheme();
    chrome.storage.local.get(["allEntries"], (result) => {
      const today = (selectedDate ?? new Date()).toISOString().split("T")[0];
      const _todayEntries = result.allEntries?.[today] || [];
      setTodayEntries(_todayEntries);
    });
  }, [selectedDate]);

  const handleAddEntry = () => {
    const today = new Date().toISOString().split("T")[0];

    const addEntry = (entryText: string) => {
      const entryId = new Date().toISOString();
      const newEntry = { id: entryId, entry: entryText, date: today };
      setTodayEntries([newEntry, ...todayEntries]);

      chrome.storage.local.get(["allEntries"], (result) => {
        const allEntries = result.allEntries || {};
        const dateEntries = allEntries[today] || [];
        allEntries[today] = [newEntry, ...dateEntries];
        chrome.storage.local.set({ allEntries });
      });
    };

    if (
      logType === "meeting" &&
      selectedPerson &&
      selectedProject &&
      selectedDuration
    ) {
      const projectText = selectedProject
        ? ` (Project: ${selectedProject.label})`
        : "";
      addEntry(
        `Meeting: ${selectedPerson.label} - ${selectedDuration.label}${projectText}`
      );
    }

    if (logType === "task" && selectedProject && selectedDuration) {
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
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    setThemeState(newTheme);
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

  const handleDeleteEntry = (entryId: string) => {
    confirmAlert({
      title: "Confirm to delete",
      message: "Are you sure you want to delete this entry?",
      buttons: [
        {
          label: "Yes",
          onClick: () => {
            setTodayEntries(
              todayEntries.filter((entry) => entry.id !== entryId)
            );
            chrome.storage.local.get(["allEntries"], (result) => {
              const allEntries = result.allEntries || {};
              const today = (selectedDate ?? new Date())
                .toISOString()
                .split("T")[0];
              allEntries[today] = allEntries[today].filter(
                (entry: EntryType) => entry.id !== entryId
              );
              chrome.storage.local.set({ allEntries });
            });
            toast.success("Entry deleted successfully!");
          },
        },
        { label: "No", onClick: () => {} },
      ],
    });
  };

  return (
    <div className="container" style={{ position: "relative" }}>
      <Header theme={theme} toggleTheme={toggleTheme} />
      <LogTypeSelector logType={logType} setLogType={setLogType} />
      {logType === "meeting" && (
        <MeetingForm
          selectedPerson={selectedPerson}
          setSelectedPerson={setSelectedPerson}
          selectedProject={selectedProject}
          setSelectedProject={setSelectedProject}
        />
      )}
      {logType === "task" && (
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
        className={`w-full mt-4 rounded-lg px-4 py-2 text-white font-semibold transition-all ${
          isAddEntryDisabled
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-red-600 hover:bg-red-700"
        }`}
      >
        ➕ Add Entry
      </button>
      <div className="entries-container">
        <h3 className="mt-2.5 mb-2.5">
          Logs for {selectedDate?.toLocaleDateString()}
        </h3>
        <div className="w-full mb-4">
          <DatePicker
            selected={selectedDate}
            onChange={(date) => setSelectedDate(date)}
            dateFormat="dd/MM/yyyy"
            wrapperClassName="w-full"
            className="w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 shadow-sm transition duration-200 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholderText="Select a date"
          />
        </div>
        {todayEntries.length > 0 && (
          <EntriesList
            entries={todayEntries}
            handleDeleteEntry={handleDeleteEntry}
            selectedDate={selectedDate ?? new Date()}
          />
        )}
      </div>
      <button
        onClick={copyEntries}
        className="w-full mt-6 rounded-lg bg-white text-red-600 border border-red-600 hover:bg-red-600 hover:text-white text-white font-semibold py-2 px-4 transition duration-300 shadow-md"
      >
        📋 Copy All
      </button>
    </div>
  );
};

export default App;
