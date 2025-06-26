import { useEffect, useState } from 'react';
import { OptionType } from '../types';
import { DurationSelector } from './ui/durationSelector';
import {
  getChromeStorageData,
  setChromeStorageData,
} from '../utils/chromeStorageUtils';
import { Button } from './ui/button';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Label } from './ui/label';
import { StyledCreatableSelect } from './ui/creatableSelect';
import { RotateCcwIcon } from 'lucide-react';

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
  onElapsedTimeChange?: (elapsed: number) => void;
}

export const TaskForm = ({
  selectedProject,
  setSelectedProject,
  selectedDuration,
  setSelectedDuration,
  taskRecorded,
  onElapsedTimeChange,
}: TaskFormProps) => {
  const [projects, setProjects] = useState<OptionType[]>([]);
  const [timerOption, setTimerOption] = useState<TimerOption>('selectDuration');
  const [isRunning, setIsRunning] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const selectorDisabled = elapsedTime > 0;

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
    if (onElapsedTimeChange) onElapsedTimeChange(elapsedTime);
  }, [elapsedTime, onElapsedTimeChange]);

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
    <div className='space-y-4'>
      <StyledCreatableSelect
        placeholder='Select or type project name'
        value={selectedProject}
        onChange={(e) => setSelectedProject(e)}
        onCreateOption={handleCreateProject}
        options={projects}
        isClearable
        isSearchable
        isDisabled={selectorDisabled}
      />
      <RadioGroup
        value={timerOption}
        onValueChange={(value: string) => setTimerOption(value as TimerOption)}
        className='mt-4'
        disabled={selectorDisabled}
      >
        <div className='flex space-x-4'>
          <div className='flex space-x-2'>
            <RadioGroupItem
              value='selectDuration'
              id='selectDuration'
              disabled={selectorDisabled}
            />
            <Label htmlFor='selectDuration'>Select Duration</Label>
          </div>
          <div className='flex space-x-2'>
            <RadioGroupItem
              value='startTimer'
              id='startTimer'
              disabled={selectorDisabled}
            />
            <Label htmlFor='startTimer'>Timer</Label>
          </div>
        </div>
      </RadioGroup>
      {timerOption === 'selectDuration' && (
        <DurationSelector
          selectedDuration={selectedDuration}
          setSelectedDuration={setSelectedDuration}
          isDisabled={selectorDisabled}
        />
      )}
      {timerOption === 'startTimer' && (
        <div className='flex items-center space-x-4'>
          <Button onClick={handleStartStop} disabled={!selectedProject}>
            {isRunning ? 'Stop Timer' : 'Start Timer'}
          </Button>
          <div className='flex items-center gap-2'>
            <span>
              {Math.floor(elapsedTime / 60)} min {elapsedTime % 60} sec
            </span>
            {elapsedTime > 0 && !isRunning && (
              <Button
                variant='outline'
                size='icon'
                title='Reset'
                onClick={() => {
                  setElapsedTime(0);
                  setSelectedDuration(null);
                  setChromeStorageData({ elapsedTime: 0 });
                  if (onElapsedTimeChange) onElapsedTimeChange(0);
                }}
              >
                <RotateCcwIcon className='w-4 h-4' />
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
