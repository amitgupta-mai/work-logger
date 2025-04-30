import { useEffect, useState } from 'react';
import CreatableSelect from 'react-select/creatable';
import { OptionType } from '../types';
import { DurationSelector } from '../ui/durationSelector';
import {
  getChromeStorageData,
  setChromeStorageData,
} from '../utils/chromeStorageUtils';

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
  const [isRunning, setIsRunning] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    getChromeStorageData(['projects'], (result: Record<string, unknown>) => {
      if (result.projects && Array.isArray(result.projects)) {
        setProjects(result.projects as OptionType[]);
      }
    });
  }, [setSelectedProject, selectedProject]);

  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | null = null;

    if (isRunning) {
      timer = setInterval(() => {
        setElapsedTime((prevTime) => prevTime + 1);
      }, 1000);
    } else if (!isRunning && elapsedTime !== 0) {
      if (timer !== null) {
        clearInterval(timer);
      }
    }
    return () => {
      if (timer !== null) {
        clearInterval(timer);
      }
    };
  }, [isRunning, elapsedTime]);

  const handleCreateProject = (inputValue: string) => {
    const newProject = { label: inputValue, value: inputValue };
    setSelectedProject(newProject);
    setChromeStorageData({ projects: [...projects, newProject] });
  };

  const handleStartStop = () => {
    if (isRunning) {
      setIsRunning(false);
      const minutes = Math.ceil(elapsedTime / 60);
      setSelectedDuration({ value: minutes, label: `${minutes} min` });
      setElapsedTime(0);
    } else {
      setIsRunning(true);
    }
  };

  return (
    <>
      <CreatableSelect
        placeholder='Select or type project name'
        value={selectedProject}
        onChange={(e) => setSelectedProject(e)}
        onCreateOption={handleCreateProject}
        options={projects}
        isClearable
        isSearchable
      />
      <div>
        <label>
          <input
            type='radio'
            value='selectDuration'
            checked={timerOption === 'selectDuration'}
            onChange={() => setTimerOption('selectDuration')}
          />
          Select Duration
        </label>
        <label>
          <input
            type='radio'
            value='startTimer'
            checked={timerOption === 'startTimer'}
            onChange={() => setTimerOption('startTimer')}
          />
          Timer
        </label>
      </div>
      {timerOption === 'selectDuration' && (
        <DurationSelector
          selectedDuration={selectedDuration}
          setSelectedDuration={setSelectedDuration}
        />
      )}
      {timerOption === 'startTimer' && (
        <div>
          <button onClick={handleStartStop} disabled={!selectedProject}>
            {isRunning ? 'Stop Timer' : 'Start Timer'}
          </button>
          <div>
            Elapsed Time: {Math.floor(elapsedTime / 60)} min {elapsedTime % 60}{' '}
            sec
          </div>
        </div>
      )}
    </>
  );
};
