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

  function getMinutes(hour: string, minute: string, ampm: string) {
    let h = parseInt(hour, 10);
    if (ampm === 'PM' && h !== 12) h += 12;
    if (ampm === 'AM' && h === 12) h = 0;
    return h * 60 + parseInt(minute, 10);
  }

  const calculatedDuration =
    durationMode === 'manual'
      ? (() => {
          if (!startHour || !startMinute || !endHour || !endMinute) return '';
          const start = getMinutes(startHour, startMinute, startAmPm);
          const end = getMinutes(endHour, endMinute, endAmPm);
          return end > start ? end - start : '';
        })()
      : selectedDuration?.value || '';

  const formatTime = (h: string, m: string, ampm: string) =>
    h && m ? `${h}:${m} ${ampm}` : '--:--';

  const isManualTimeFilled =
    !!startHour &&
    !!startMinute &&
    !!startAmPm &&
    !!endHour &&
    !!endMinute &&
    !!endAmPm;

  const endTimeError =
    durationMode === 'manual' &&
    isManualTimeFilled &&
    getMinutes(endHour, endMinute, endAmPm) <=
      getMinutes(startHour, startMinute, startAmPm)
      ? 'End time must be after start time'
      : '';

  return (
    <div className='space-y-4'>
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
                  onAmPmChange={() => {}}
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
                  onAmPmChange={() => {}}
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
