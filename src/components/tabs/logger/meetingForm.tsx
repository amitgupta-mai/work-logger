import { useEffect } from 'react';
import { MeetingFormProps } from '../../../types';
import { DurationSelector } from '../../ui/durationSelector';
import { RadioGroup, RadioGroupItem } from '../../ui/radio-group';
import { Label } from '../../ui/label';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../ui/tabs';
import TimePicker from './TimePicker';
import CreatableSelectField from './CreatableSelectField';
import { useOptionsLoader } from './useOptionsLoader';
import {
  getEndTimeError,
  formatTime,
  getCalculatedDuration,
  formatMinutesToHM,
} from './loggerUtils';
import { ClockIcon } from 'lucide-react';

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
  const {
    people,
    projects,
    loadOptions,
    handleCreatePerson,
    handleCreateProject,
  } = useOptionsLoader();

  useEffect(() => {
    loadOptions();
  }, [loadOptions]);

  const endTimeError = getEndTimeError({
    durationMode,
    startHour,
    startMinute,
    startAmPm,
    endHour,
    endMinute,
    endAmPm,
  });

  const calculatedDuration = getCalculatedDuration({
    durationMode,
    startHour,
    startMinute,
    startAmPm,
    endHour,
    endMinute,
    endAmPm,
    selectedDuration,
  });

  return (
    <div className='space-y-4'>
      <CreatableSelectField
        placeholder={`Select or type person's name`}
        value={selectedPerson}
        onChange={setSelectedPerson}
        onCreateOption={handleCreatePerson}
        options={people}
        isClearable
        isSearchable
      />
      <CreatableSelectField
        placeholder='Select or type project name'
        value={selectedProject}
        onChange={setSelectedProject}
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
        />
      ) : (
        <div className='flex flex-col gap-2 mt-2 bg-muted/60 rounded-lg shadow-inner border border-muted p-4'>
          <Tabs defaultValue='start' className='w-full'>
            <div className='flex justify-between'>
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
              {durationMode === 'manual' &&
                startHour &&
                startMinute &&
                startAmPm &&
                endHour &&
                endMinute &&
                endAmPm &&
                calculatedDuration !== '' && (
                  <div className='text-sm flex items-center gap-1'>
                    <ClockIcon className='w-4 h-4 text-white' />
                    {formatMinutesToHM(Number(calculatedDuration))}
                  </div>
                )}
            </div>
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
                error={endTimeError}
              />
            </TabsContent>
          </Tabs>
          <div className='text-xs mt-1'>
            Start: {formatTime(startHour, startMinute, startAmPm)} &nbsp; End:{' '}
            {formatTime(endHour, endMinute, endAmPm)}
          </div>
        </div>
      )}
    </div>
  );
};
