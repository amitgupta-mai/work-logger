import { useEffect, useState } from 'react';
import { OptionType } from '../types';
import { DurationSelector } from './ui/durationSelector';
import {
  getChromeStorageData,
  setChromeStorageData,
} from '../utils/chromeStorageUtils';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Label } from './ui/label';
import { StyledCreatableSelect } from './ui/creatableSelect';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs';

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
  startTime: string;
  startAmPm: string;
  endTime: string;
  endAmPm: string;
  durationMode: 'dropdown' | 'manual';
  setDurationMode: (mode: 'dropdown' | 'manual') => void;
  startHour: string;
  setStartHour: (v: string) => void;
  startMinute: string;
  setStartMinute: (v: string) => void;
  endHour: string;
  setEndHour: (v: string) => void;
  endMinute: string;
  setEndMinute: (v: string) => void;
}

function TimePicker({
  hour,
  onHourChange,
  minute,
  onMinuteChange,
  ampm,
  onAmPmChange,
  label,
  error,
  touched,
  onHourBlur,
  onMinuteBlur,
  onAmPmBlur,
}: {
  hour: string;
  onHourChange: (v: string) => void;
  minute: string;
  onMinuteChange: (v: string) => void;
  ampm: string;
  onAmPmChange: (v: string) => void;
  label: string;
  error?: string;
  touched: boolean;
  onHourBlur: () => void;
  onMinuteBlur: () => void;
  onAmPmBlur: () => void;
}) {
  const hourOptions = Array.from({ length: 12 }, (_, i) =>
    (i + 1).toString().padStart(2, '0')
  );
  const minuteOptions = Array.from({ length: 60 }, (_, i) =>
    i.toString().padStart(2, '0')
  );
  return (
    <div>
      <label className='block text-xs mb-1'>{label}</label>
      <div className='flex gap-2 items-center'>
        <Select value={hour} onValueChange={onHourChange}>
          <SelectTrigger className='w-[80px] h-8' onBlur={onHourBlur}>
            <SelectValue placeholder='hh' />
          </SelectTrigger>
          <SelectContent>
            {hourOptions.map((h) => (
              <SelectItem key={h} value={h}>
                {h}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span>:</span>
        <Select value={minute} onValueChange={onMinuteChange}>
          <SelectTrigger className='w-[80px] h-8' onBlur={onMinuteBlur}>
            <SelectValue placeholder='mm' />
          </SelectTrigger>
          <SelectContent>
            {minuteOptions.map((m) => (
              <SelectItem key={m} value={m}>
                {m}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={ampm} onValueChange={onAmPmChange}>
          <SelectTrigger className='w-[100px] h-8' onBlur={onAmPmBlur}>
            <SelectValue placeholder='AM/PM' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='AM'>AM</SelectItem>
            <SelectItem value='PM'>PM</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {touched && error && (
        <div className='text-xs text-red-500 mt-1'>{error}</div>
      )}
    </div>
  );
}

export const TaskForm = ({
  selectedProject,
  setSelectedProject,
  selectedDuration,
  setSelectedDuration,
  taskRecorded,
  onElapsedTimeChange,
  startTime,
  endTime,
  durationMode,
  setDurationMode,
  startHour,
  setStartHour,
  startMinute,
  setStartMinute,
  endHour,
  setEndHour,
  endMinute,
  setEndMinute,
}: TaskFormProps) => {
  const [projects, setProjects] = useState<OptionType[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const selectorDisabled = elapsedTime > 0;
  const [timeErrors, setTimeErrors] = useState<{
    start?: string;
    end?: string;
  }>({});
  const [startAmPm, setStartAmPm] = useState('AM');
  const [endAmPm, setEndAmPm] = useState('AM');

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
          setDurationMode('dropdown');
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

  useEffect(() => {
    const startError = validateTimeInput(startTime);
    const endError = validateTimeInput(endTime);
    setTimeErrors({ start: startError, end: endError });
  }, [startTime, endTime]);

  const handleCreateProject = (inputValue: string) => {
    const newProject = { label: inputValue, value: inputValue };
    setSelectedProject(newProject);
    setChromeStorageData({ projects: [...projects, newProject] });
  };

  function validateTimeInput(time: string) {
    if (!time) return 'Time is required';
    if (!/^([0]?[1-9]|1[0-2]):[0-5][0-9]$/.test(time))
      return 'Invalid time format (hh:mm)';
    return '';
  }

  function getMinutes(hour: string, minute: string) {
    let h = parseInt(hour, 10);
    if (h === 12) h = 0;
    return h * 60 + parseInt(minute, 10);
  }

  const calculatedDuration =
    durationMode === 'manual'
      ? (() => {
          if (!startHour || !startMinute || !endHour || !endMinute) return '';
          const start = getMinutes(startHour, startMinute);
          const end = getMinutes(endHour, endMinute);
          return end > start ? end - start : '';
        })()
      : selectedDuration?.value || '';

  const formatTime = (h: string, m: string, ampm: string) =>
    h && m ? `${h}:${m} ${ampm}` : '--:--';

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
        className='mb-2'
      />
      <RadioGroup
        value={durationMode}
        onValueChange={(value) =>
          setDurationMode(value as 'dropdown' | 'manual')
        }
        className='mb-2 flex gap-6 items-center'
      >
        <div className='flex items-center gap-2'>
          <RadioGroupItem value='dropdown' id='dropdown' className='' />
          <Label
            htmlFor='dropdown'
            className='cursor-pointer m-0 p-0 leading-none'
          >
            Select Duration
          </Label>
        </div>
        <div className='flex items-center gap-2'>
          <RadioGroupItem value='manual' id='manual' className='' />
          <Label
            htmlFor='manual'
            className='cursor-pointer m-0 p-0 leading-none'
          >
            Set Start/End Time
          </Label>
        </div>
      </RadioGroup>
      {durationMode === 'dropdown' ? (
        <DurationSelector
          selectedDuration={selectedDuration}
          setSelectedDuration={setSelectedDuration}
          isDisabled={selectorDisabled}
        />
      ) : (
        <>
          <div className='bg-muted/60 rounded-lg shadow-inner border border-muted p-4 mb-2'>
            <Tabs defaultValue='start' className='w-full'>
              <TabsList className='w-fit h-7 mb-2 bg-card rounded-md p-1'>
                <TabsTrigger
                  value='start'
                  className='px-3 py-1 text-xs rounded-md data-[state=active]:!bg-[oklch(0.7_0.15_30)] data-[state=active]:!text-white data-[state=active]:shadow-sm transition-colors'
                >
                  Start
                </TabsTrigger>
                <TabsTrigger
                  value='end'
                  className='px-3 py-1 text-xs rounded-md data-[state=active]:!bg-[oklch(0.7_0.15_30)] data-[state=active]:!text-white data-[state=active]:shadow-sm transition-colors'
                >
                  End
                </TabsTrigger>
              </TabsList>
              <TabsContent value='start'>
                <label className='block text-xs font-semibold mb-1'>
                  Start Time
                </label>
                <TimePicker
                  hour={startHour}
                  onHourChange={setStartHour}
                  minute={startMinute}
                  onMinuteChange={setStartMinute}
                  ampm={startAmPm}
                  onAmPmChange={setStartAmPm}
                  label=''
                  error={timeErrors.start}
                  touched={false}
                  onHourBlur={() => {}}
                  onMinuteBlur={() => {}}
                  onAmPmBlur={() => {}}
                />
              </TabsContent>
              <TabsContent value='end'>
                <label className='block text-xs font-semibold mb-1'>
                  End Time
                </label>
                <TimePicker
                  hour={endHour}
                  onHourChange={setEndHour}
                  minute={endMinute}
                  onMinuteChange={setEndMinute}
                  ampm={endAmPm}
                  onAmPmChange={setEndAmPm}
                  label=''
                  error={timeErrors.end}
                  touched={false}
                  onHourBlur={() => {}}
                  onMinuteBlur={() => {}}
                  onAmPmBlur={() => {}}
                />
              </TabsContent>
            </Tabs>
            <div className='text-xs mt-3 text-muted-foreground'>
              Start: {formatTime(startHour, startMinute, startAmPm)} &nbsp; End:{' '}
              {formatTime(endHour, endMinute, endAmPm)}
            </div>
          </div>
          {durationMode === 'manual' &&
            startHour &&
            startMinute &&
            startAmPm &&
            endHour &&
            endMinute &&
            endAmPm &&
            calculatedDuration !== '' && (
              <div className='mt-1 text-sm'>
                Duration: {calculatedDuration} min
              </div>
            )}
        </>
      )}
    </div>
  );
};
