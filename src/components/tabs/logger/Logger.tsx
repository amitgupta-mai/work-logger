import { LogTypeSelector } from './logTypeSelector';
import { MeetingForm } from './meetingForm';
import { TaskForm } from './taskForm';
import { EntriesList } from './entriesList';
import { Button } from '../../ui/button';
import { DatePicker } from '../../ui/datePicker';
import { CopyIcon, DownloadIcon, AlertCircleIcon } from 'lucide-react';
import TotalTimeDisplay from './totalTimeDisplay';
import { useLoggerState } from './useLoggerState';

const Logger = () => {
  const {
    logType,
    setLogType,
    selectedProject,
    setSelectedProject,
    selectedDuration,
    setSelectedDuration,
    todayEntries,
    selectedPerson,
    setSelectedPerson,
    selectedDate,
    setSelectedDate,
    taskRecorded,
    isLoading,
    validationErrors,
    isTimerRunning,
    taskElapsedTime,
    startTime,
    startAmPm,
    setStartAmPm,
    endTime,
    endAmPm,
    setEndAmPm,
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
    handleAddEntry,
    copyEntries,
    exportEntries,
    isAddEntryDisabled,
    handleDeleteEntryWrapper,
  } = useLoggerState();

  return (
    <div className='h-full flex flex-col gap-2'>
      <div className='flex-shrink-0 rounded-xl border bg-card text-card-foreground shadow-sm flex flex-col max-h-[250px]'>
        <div className='p-2 space-y-1.5 flex-1 overflow-y-auto hide-scrollbar-on-idle pb-0'>
          <div className='flex justify-between items-center'>
            <LogTypeSelector
              logType={logType}
              setLogType={setLogType}
              disabled={isTimerRunning || taskElapsedTime > 0}
            />
            <TotalTimeDisplay todayEntries={todayEntries} />
          </div>
          {logType === 'Task' ? (
            <TaskForm
              selectedProject={selectedProject}
              setSelectedProject={setSelectedProject}
              selectedDuration={selectedDuration}
              setSelectedDuration={setSelectedDuration}
              taskRecorded={taskRecorded}
              startTime={startTime}
              startAmPm={startAmPm}
              setStartAmPm={setStartAmPm}
              endTime={endTime}
              endAmPm={endAmPm}
              setEndAmPm={setEndAmPm}
              durationMode={durationMode}
              setDurationMode={setDurationMode}
              startHour={startHour}
              setStartHour={setStartHour}
              startMinute={startMinute}
              setStartMinute={setStartMinute}
              endHour={endHour}
              setEndHour={setEndHour}
              endMinute={endMinute}
              setEndMinute={setEndMinute}
            />
          ) : (
            <MeetingForm
              selectedPerson={selectedPerson}
              setSelectedPerson={setSelectedPerson}
              selectedProject={selectedProject}
              setSelectedProject={setSelectedProject}
              selectedDuration={selectedDuration}
              setSelectedDuration={setSelectedDuration}
              isTimerRunning={isTimerRunning}
              durationMode={durationMode}
              setDurationMode={setDurationMode}
              startHour={startHour}
              setStartHour={setStartHour}
              startMinute={startMinute}
              setStartMinute={setStartMinute}
              startAmPm={startAmPm}
              setStartAmPm={setStartAmPm}
              endHour={endHour}
              setEndHour={setEndHour}
              endMinute={endMinute}
              setEndMinute={setEndMinute}
              endAmPm={endAmPm}
              setEndAmPm={setEndAmPm}
            />
          )}
          {validationErrors.length > 0 && (
            <div className='text-destructive text-sm p-2 rounded-md bg-destructive/10'>
              <ul className='space-y-1'>
                {validationErrors.map((error, index) => (
                  <li key={index} className='flex items-center gap-2'>
                    <AlertCircleIcon className='size-4' />
                    {error}
                  </li>
                ))}
              </ul>
            </div>
          )}
          <div className='sticky bottom-0 left-0 w-full bg-card py-2 z-10'>
            <Button
              onClick={handleAddEntry}
              disabled={isAddEntryDisabled}
              className='w-full'
            >
              {isLoading ? 'Adding...' : 'Add Entry'}
            </Button>
          </div>
        </div>
      </div>

      <div className='flex-1 flex flex-col min-h-0 rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden'>
        <div className='px-3 py-0 border-b'>
          <div className='flex items-center gap-2 py-1'>
            <h2 className='text-base font-semibold whitespace-nowrap'>
              Logs for:
            </h2>
            <DatePicker
              selectedDate={selectedDate}
              setSelectedDate={setSelectedDate}
            />
          </div>
        </div>
        <div className='flex-1 overflow-y-auto hide-scrollbar-on-idle px-3 pt-1 pb-3 min-h-0'>
          <EntriesList
            entries={todayEntries}
            handleDeleteEntry={handleDeleteEntryWrapper}
            selectedDate={selectedDate}
          />
        </div>
        <div className='flex-shrink-0 px-3 py-2 border-t bg-background'>
          <div className='flex justify-end gap-2'>
            <Button
              variant='outline'
              size='sm'
              onClick={copyEntries}
              disabled={todayEntries.length === 0}
            >
              <CopyIcon className='mr-2 size-4' />
              Copy
            </Button>
            <Button
              variant='outline'
              size='sm'
              onClick={exportEntries}
              disabled={todayEntries.length === 0}
            >
              <DownloadIcon className='mr-2 size-4' />
              Export CSV
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Logger;
