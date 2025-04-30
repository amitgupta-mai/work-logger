import { useEffect, useState } from 'react';
import CreatableSelect from 'react-select/creatable';
import { OptionType } from '../types';
import { DurationSelector } from '../ui/durationSelector';

type TimerOption = 'startTimer' | 'selectDuration';

interface DurationOption {
  value: number;
  label: string;
}

interface TaskFormProps {
  selectedProject: OptionType | null;
  setSelectedProject: (project: OptionType | null) => void;
  selectedDuration: DurationOption | null;
  setSelectedDuration: (value: DurationOption | null) => void;
}

export const TaskForm = ({
  selectedProject,
  setSelectedProject,
  selectedDuration,
  setSelectedDuration,
}: TaskFormProps) => {
  const [projects, setProjects] = useState<OptionType[]>([]);
  const [timerOption, setTimerOption] = useState<TimerOption>('selectDuration');

  useEffect(() => {
    chrome.storage.local.get(['projects'], (result) => {
      if (result.projects) {
        setProjects(result.projects);
      }
    });
  }, [setSelectedProject, selectedProject]);

  const handleCreateProject = (inputValue: string) => {
    const newProject = { label: inputValue, value: inputValue };
    setSelectedProject(newProject);
    chrome.storage.local.set({ projects: [...projects, newProject] });
  };

  return (
    <>
      <div>
        <label>
          <input
            type='radio'
            value='startTimer'
            checked={timerOption === 'startTimer'}
            onChange={() => setTimerOption('startTimer')}
          />
          Start Timer
        </label>
        <label>
          <input
            type='radio'
            value='selectDuration'
            checked={timerOption === 'selectDuration'}
            onChange={() => setTimerOption('selectDuration')}
          />
          Select Duration
        </label>
      </div>
      {timerOption === 'selectDuration' && (
        <DurationSelector
          selectedDuration={selectedDuration}
          setSelectedDuration={setSelectedDuration}
        />
      )}
      <CreatableSelect
        placeholder='Select or type project name'
        value={selectedProject}
        onChange={(e) => setSelectedProject(e)}
        onCreateOption={handleCreateProject}
        options={projects}
        isClearable
        isSearchable
      />
    </>
  );
};
