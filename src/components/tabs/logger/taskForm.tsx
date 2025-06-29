import { useEffect } from 'react';
import { TaskFormProps } from '../../../types';
import { DurationSelector } from '../../ui/durationSelector';
import { setChromeStorageData } from '../../../utils/chromeStorageUtils';
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

export const TaskForm = ({
  selectedProject,
  setSelectedProject,
  selectedDuration,
  setSelectedDuration,
  taskRecorded,
  startAmPm,
  endAmPm,
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
  setStartAmPm,
  setEndAmPm,
}: TaskFormProps) => {
  const selectorDisabled = false;

  const { projects, loadOptions, handleCreateProject } = useOptionsLoader();

  useEffect(() => {
    loadOptions();
  }, [loadOptions]);

  useEffect(() => {
    if (taskRecorded) {
      setSelectedDuration(null);
      setChromeStorageData({ elapsedTime: 0 });
    }
  }, [taskRecorded, setSelectedDuration]);

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

  const endTimeError = getEndTimeError({
    durationMode,
    startHour,
    startMinute,
    startAmPm,
    endHour,
    endMinute,
    endAmPm,
  });

  return (
    <div>
      <CreatableSelectField
        placeholder='Select or type project name'
        value={selectedProject}
        onChange={setSelectedProject}
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
                  error={endTimeError}
                />
              </TabsContent>
            </Tabs>
            <div className='text-xs mt-3 text-muted-foreground'>
              Start: {formatTime(startHour, startMinute, startAmPm)} &nbsp; End:{' '}
              {formatTime(endHour, endMinute, endAmPm)}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
