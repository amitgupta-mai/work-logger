import { useEffect, useState } from 'react';
import CreatableSelect from 'react-select/creatable';
import { OptionType } from '../types';
import { DurationSelector } from './ui/durationSelector';
import {
  getChromeStorageData,
  setChromeStorageData,
} from '../utils/chromeStorageUtils';
import { Button } from './ui/button';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Label } from './ui/label';

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
  taskRecorded: boolean;
}

export const TaskForm = ({
  selectedProject,
  setSelectedProject,
  selectedDuration,
  setSelectedDuration,
  taskRecorded,
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
    let intervalId: ReturnType<typeof setInterval> | null = null;

    getChromeStorageData(
      ['elapsedTime', 'isRunning', 'activeProject'],
      (result) => {
        const isTimerRunning =
          typeof result.isRunning === 'boolean' && result.isRunning;
        const elapsed =
          typeof result.elapsedTime === 'number' ? result.elapsedTime : 0;

        setIsRunning(isTimerRunning);
        setElapsedTime(elapsed);

        if (isTimerRunning) {
          setSelectedProject(result?.activeProject as OptionType);
          setTimerOption('startTimer');
          intervalId = setInterval(() => {
            getChromeStorageData(
              ['elapsedTime', 'isRunning'],
              (intervalResult) => {
                if (typeof intervalResult.elapsedTime === 'number') {
                  setElapsedTime(intervalResult.elapsedTime);
                }
                if (typeof intervalResult.isRunning === 'boolean') {
                  setIsRunning(intervalResult.isRunning);
                }
              }
            );
          }, 1000);
        }
      }
    );

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isRunning]);

  useEffect(() => {
    if (taskRecorded) {
      setElapsedTime(0);
      setSelectedDuration(null);
      setChromeStorageData({ elapsedTime: 0 });
    }
  }, [taskRecorded]);

  const handleCreateProject = (inputValue: string) => {
    const newProject = { label: inputValue, value: inputValue };
    setSelectedProject(newProject);
    setChromeStorageData({ projects: [...projects, newProject] });
  };

  const handleStartStop = () => {
    if (isRunning) {
      const minutes = Math.ceil(elapsedTime / 60);
      setIsRunning(false);
      setSelectedDuration({ value: minutes, label: `${minutes} min` });
      chrome.runtime.sendMessage({ action: 'stopTimer' });
    } else {
      chrome.runtime.sendMessage({ action: 'startTimer' });
      chrome.storage.local.set({ activeProject: selectedProject }, () => {
        setIsRunning(true);
      });
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
      <RadioGroup
        value={timerOption}
        onValueChange={(value: string) => setTimerOption(value as TimerOption)}
      >
        <div className='flex space-x-4'>
          <div className='flex items-center space-x-2'>
            <RadioGroupItem value='selectDuration' id='selectDuration' />
            <Label htmlFor='selectDuration'>Select Duration</Label>
          </div>
          <div className='flex items-center space-x-2'>
            <RadioGroupItem value='startTimer' id='startTimer' />
            <Label htmlFor='startTimer'>Timer</Label>
          </div>
        </div>
      </RadioGroup>
      {timerOption === 'selectDuration' && (
        <DurationSelector
          selectedDuration={selectedDuration}
          setSelectedDuration={setSelectedDuration}
        />
      )}
      {timerOption === 'startTimer' && (
        <div className='flex items-center space-x-4'>
          <Button onClick={handleStartStop} disabled={!selectedProject}>
            {isRunning ? 'Stop Timer' : 'Start Timer'}
          </Button>
          <div>
            {Math.floor(elapsedTime / 60)} min {elapsedTime % 60} sec
          </div>
        </div>
      )}
    </>
  );
};
