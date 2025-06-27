import { useEffect, useState } from 'react';
import { OptionType } from '../types';
import { DurationSelector } from './ui/durationSelector';
import {
  getChromeStorageData,
  setChromeStorageData,
} from '../utils/chromeStorageUtils';
import { StyledCreatableSelect } from './ui/creatableSelect';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Label } from './ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs';

interface Duration {
  value: number;
  label: string;
}

interface MeetingFormProps {
  selectedPerson: OptionType | null;
  setSelectedPerson: (person: OptionType | null) => void;
  selectedProject: OptionType | null;
  setSelectedProject: (project: OptionType | null) => void;
  selectedDuration: Duration | null;
  setSelectedDuration: (duration: Duration | null) => void;
  isTimerRunning?: boolean;
  durationMode: 'dropdown' | 'manual';
  setDurationMode: (mode: 'dropdown' | 'manual') => void;
  startHour: string;
  setStartHour: (v: string) => void;
  startMinute: string;
  setStartMinute: (v: string) => void;
  startAmPm: string;
  setStartAmPm: (v: string) => void;
  endHour: string;
  setEndHour: (v: string) => void;
  endMinute: string;
  setEndMinute: (v: string) => void;
  endAmPm: string;
  setEndAmPm: (v: string) => void;
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
}: {
  hour: string;
  onHourChange: (v: string) => void;
  minute: string;
  onMinuteChange: (v: string) => void;
  ampm: string;
  onAmPmChange: (v: string) => void;
  label: string;
  error?: string;
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
          <SelectTrigger className='w-[80px] h-8'>
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
          <SelectTrigger className='w-[80px] h-8'>
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
          <SelectTrigger className='w-[100px] h-8'>
            <SelectValue placeholder='AM/PM' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='AM'>AM</SelectItem>
            <SelectItem value='PM'>PM</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {error && <div className='text-xs text-red-500 mt-1'>{error}</div>}
    </div>
  );
}

export const MeetingForm = ({
  selectedPerson,
  setSelectedPerson,
  selectedProject,
  setSelectedProject,
  selectedDuration,
  setSelectedDuration,
  isTimerRunning = false,
  durationMode,
  setDurationMode,
  startHour,
  setStartHour,
  startMinute,
  setStartMinute,
  startAmPm,
  setStartAmPm,
  endHour,
  setEndHour,
  endMinute,
  setEndMinute,
  endAmPm,
  setEndAmPm,
}: MeetingFormProps) => {
  const [people, setPeople] = useState<OptionType[]>([]);
  const [projects, setProjects] = useState<OptionType[]>([]);

  useEffect(() => {
    getChromeStorageData(
      ['people', 'projects'],
      (result: Record<string, unknown>) => {
        if (result.people && Array.isArray(result.people)) {
          setPeople(result.people as OptionType[]);
        }
        if (result.projects && Array.isArray(result.projects)) {
          setProjects(result.projects as OptionType[]);
        }
      }
    );
  }, [setSelectedPerson, setSelectedProject, selectedPerson, selectedProject]);

  const handleCreatePerson = (inputValue: string) => {
    const newPerson = { label: inputValue, value: inputValue };
    setSelectedPerson(newPerson);
    setChromeStorageData({ people: [...people, newPerson] });
  };

  const handleCreateProject = (inputValue: string) => {
    const newProject = { label: inputValue, value: inputValue };
    setSelectedProject(newProject);
    setChromeStorageData({ projects: [...projects, newProject] });
  };

  const formatTime = (h: string, m: string, ampm: string) =>
    h && m ? `${h}:${m} ${ampm}` : '--:--';

  return (
    <>
      <StyledCreatableSelect
        placeholder={`Select or type person's name`}
        value={selectedPerson}
        onChange={(e) => setSelectedPerson(e)}
        onCreateOption={handleCreatePerson}
        options={people}
        isClearable
        isSearchable
      />
      <StyledCreatableSelect
        placeholder='Select or type project name'
        value={selectedProject}
        onChange={(e) => setSelectedProject(e)}
        onCreateOption={handleCreateProject}
        options={projects}
        isClearable
        isSearchable
        isDisabled={isTimerRunning}
      />
      <RadioGroup
        value={durationMode}
        onValueChange={(value) =>
          setDurationMode(value as 'dropdown' | 'manual')
        }
        className='mb-2 flex gap-6 items-center'
      >
        <div className='flex items-center gap-2'>
          <RadioGroupItem value='dropdown' id='dropdown' className='mt-px' />
          <Label htmlFor='dropdown' className='cursor-pointer'>
            Select Duration
          </Label>
        </div>
        <div className='flex items-center gap-2'>
          <RadioGroupItem value='manual' id='manual' className='mt-px' />
          <Label htmlFor='manual' className='cursor-pointer'>
            Set Start/End Time
          </Label>
        </div>
      </RadioGroup>
      {durationMode === 'dropdown' ? (
        <DurationSelector
          selectedDuration={selectedDuration}
          setSelectedDuration={setSelectedDuration}
        />
      ) : (
        <div className='flex flex-col gap-2 mt-2 bg-muted/60 rounded-lg shadow-inner border border-muted p-4'>
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
              <TimePicker
                hour={startHour}
                onHourChange={setStartHour}
                minute={startMinute}
                onMinuteChange={setStartMinute}
                ampm={startAmPm}
                onAmPmChange={setStartAmPm}
                label='Start Time'
              />
            </TabsContent>
            <TabsContent value='end'>
              <TimePicker
                hour={endHour}
                onHourChange={setEndHour}
                minute={endMinute}
                onMinuteChange={setEndMinute}
                ampm={endAmPm}
                onAmPmChange={setEndAmPm}
                label='End Time'
              />
            </TabsContent>
          </Tabs>
          <div className='text-xs mt-1'>
            Start: {formatTime(startHour, startMinute, startAmPm)} &nbsp; End:{' '}
            {formatTime(endHour, endMinute, endAmPm)}
          </div>
        </div>
      )}
    </>
  );
};
