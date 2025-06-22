import { useEffect, useState, useCallback } from 'react';
import { toast } from 'react-toastify';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { formatTime } from '@/utils/dateTimeUtils';
import {
  getStorageDataAsync,
  setStorageDataAsync,
} from '@/utils/chromeStorageUtils';
import { PlayIcon, PauseIcon, RotateCcwIcon, SettingsIcon } from 'lucide-react';
import { PomodoroSettings } from '@/types';

const DEFAULT_SETTINGS: PomodoroSettings = {
  workDuration: 25,
  breakDuration: 5,
  longBreakDuration: 15,
  autoStartBreaks: false,
  autoStartWork: false,
  longBreakInterval: 4,
};

const Popup = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [remaining, setRemaining] = useState(25 * 60);
  const [settings, setSettings] = useState<PomodoroSettings>(DEFAULT_SETTINGS);
  const [showSettings, setShowSettings] = useState(false);
  const [completedPomodoros, setCompletedPomodoros] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const loadSettings = useCallback(async () => {
    try {
      const response = await getStorageDataAsync(['pomodoroSettings']);
      if (response.success && response.data?.pomodoroSettings) {
        setSettings({ ...DEFAULT_SETTINGS, ...response.data.pomodoroSettings });
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  }, []);

  const saveSettings = useCallback(async (newSettings: PomodoroSettings) => {
    try {
      await setStorageDataAsync({ pomodoroSettings: newSettings });
      setSettings(newSettings);
      toast.success('Settings saved!');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    }
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const response = await getStorageDataAsync([
          'isPomodoroRunning',
          'pomodoroStartTime',
          'pomodoroDuration',
          'isBreak',
          'completedPomodoros',
        ]);

        if (response.success && response.data) {
          const now = Date.now();
          const startTime = response.data.pomodoroStartTime || now;
          const duration =
            response.data.pomodoroDuration || settings.workDuration * 60;
          const isBreakMode = response.data.isBreak || false;
          const completed = response.data.completedPomodoros || 0;

          const elapsed = Math.floor((now - startTime) / 1000);
          const remainingTime = Math.max(duration - elapsed, 0);

          setIsRunning(response.data.isPomodoroRunning || false);
          setIsBreak(isBreakMode);
          setRemaining(remainingTime);
          setCompletedPomodoros(completed);

          // Auto-start break or work if enabled
          if (remainingTime === 0 && response.data.isPomodoroRunning) {
            if (isBreakMode && settings.autoStartWork) {
              startPomodoro();
            } else if (!isBreakMode && settings.autoStartBreaks) {
              startBreak();
            }
          }
        }
      } catch (error) {
        console.error('Error updating timer:', error);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [settings]);

  const startPomodoro = async () => {
    setIsLoading(true);
    try {
      const duration = settings.workDuration;

      chrome.runtime.sendMessage(
        {
          action: 'startPomodoro',
          duration,
          isBreak: false,
          completedPomodoros,
        },
        () => {
          if (chrome.runtime.lastError) {
            console.error('Error starting pomodoro:', chrome.runtime.lastError);
            toast.error('Failed to start pomodoro');
          } else {
            setIsRunning(true);
            setIsBreak(false);
            setRemaining(duration * 60);
            toast.success('Pomodoro started!');
          }
          setIsLoading(false);
        }
      );
    } catch (error) {
      console.error('Error starting pomodoro:', error);
      toast.error('Failed to start pomodoro');
      setIsLoading(false);
    }
  };

  const startBreak = async () => {
    setIsLoading(true);
    try {
      const isLongBreak =
        (completedPomodoros + 1) % settings.longBreakInterval === 0;
      const duration = isLongBreak
        ? settings.longBreakDuration
        : settings.breakDuration;

      chrome.runtime.sendMessage(
        {
          action: 'startPomodoro',
          duration,
          isBreak: true,
          isLongBreak,
        },
        () => {
          if (chrome.runtime.lastError) {
            console.error('Error starting break:', chrome.runtime.lastError);
            toast.error('Failed to start break');
          } else {
            setIsRunning(true);
            setIsBreak(true);
            setRemaining(duration * 60);
            toast.success(
              isLongBreak ? 'Long break started!' : 'Break started!'
            );
          }
          setIsLoading(false);
        }
      );
    } catch (error) {
      console.error('Error starting break:', error);
      toast.error('Failed to start break');
      setIsLoading(false);
    }
  };

  const stopPomodoro = async () => {
    setIsLoading(true);
    try {
      chrome.runtime.sendMessage({ action: 'stopPomodoro' }, () => {
        if (chrome.runtime.lastError) {
          console.error('Error stopping pomodoro:', chrome.runtime.lastError);
          toast.error('Failed to stop pomodoro');
        } else {
          setRemaining(settings.workDuration * 60);
          setIsRunning(false);
          setIsBreak(false);
          toast.success('Timer stopped');
        }
        setIsLoading(false);
      });
    } catch (error) {
      console.error('Error stopping pomodoro:', error);
      toast.error('Failed to stop pomodoro');
      setIsLoading(false);
    }
  };

  const resetPomodoro = async () => {
    try {
      await setStorageDataAsync({ completedPomodoros: 0 });
      setCompletedPomodoros(0);
      toast.success('Pomodoro count reset!');
    } catch (error) {
      console.error('Error resetting pomodoro count:', error);
      toast.error('Failed to reset pomodoro count');
    }
  };

  const handleSettingChange = (
    key: keyof PomodoroSettings,
    value: number | boolean
  ) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    saveSettings(newSettings);
  };

  return (
    <div className='w-[350px] h-[400px] flex flex-col'>
      <Card className='w-full flex-1'>
        <CardHeader className='pb-3'>
          <div className='flex items-center justify-between'>
            <CardTitle className='text-lg'>
              {isBreak
                ? remaining > settings.longBreakDuration * 60
                  ? 'Long Break'
                  : 'Break'
                : 'Pomodoro'}
            </CardTitle>
            <Button
              variant='ghost'
              size='sm'
              onClick={() => setShowSettings(!showSettings)}
            >
              <SettingsIcon className='w-4 h-4' />
            </Button>
          </div>
        </CardHeader>

        <CardContent className='flex flex-col items-center gap-4'>
          <div className='text-4xl font-mono font-bold'>
            {formatTime(remaining)}
          </div>

          <div className='text-sm text-muted-foreground text-center'>
            {isRunning
              ? isBreak
                ? 'Break in progress'
                : 'Focus time'
              : `Start a ${settings.workDuration}-minute session`}
          </div>

          {completedPomodoros > 0 && (
            <div className='text-sm text-muted-foreground'>
              Completed: {completedPomodoros} pomodoro
              {completedPomodoros !== 1 ? 's' : ''}
            </div>
          )}

          <div className='flex gap-2'>
            {isRunning ? (
              <Button
                variant='destructive'
                onClick={stopPomodoro}
                disabled={isLoading}
                className='flex items-center gap-2'
              >
                <PauseIcon className='w-4 h-4' />
                Stop
              </Button>
            ) : (
              <>
                <Button
                  onClick={startPomodoro}
                  disabled={isLoading}
                  className='flex items-center gap-2'
                >
                  <PlayIcon className='w-4 h-4' />
                  Start Work
                </Button>
                <Button
                  variant='outline'
                  onClick={startBreak}
                  disabled={isLoading}
                >
                  Start Break
                </Button>
              </>
            )}
          </div>

          {completedPomodoros > 0 && (
            <Button
              variant='ghost'
              size='sm'
              onClick={resetPomodoro}
              className='flex items-center gap-2'
            >
              <RotateCcwIcon className='w-4 h-4' />
              Reset Count
            </Button>
          )}
        </CardContent>
      </Card>

      {showSettings && (
        <Card className='w-full mt-4'>
          <CardHeader>
            <CardTitle className='text-sm'>Settings</CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='grid grid-cols-2 gap-4'>
              <div>
                <Label htmlFor='workDuration'>Work (min)</Label>
                <Select
                  value={settings.workDuration.toString()}
                  onValueChange={(value) =>
                    handleSettingChange('workDuration', parseInt(value))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[15, 20, 25, 30, 45, 60].map((duration) => (
                      <SelectItem key={duration} value={duration.toString()}>
                        {duration}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor='breakDuration'>Break (min)</Label>
                <Select
                  value={settings.breakDuration.toString()}
                  onValueChange={(value) =>
                    handleSettingChange('breakDuration', parseInt(value))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[3, 5, 10, 15].map((duration) => (
                      <SelectItem key={duration} value={duration.toString()}>
                        {duration}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className='flex items-center justify-between'>
              <Label htmlFor='autoStartBreaks'>Auto-start breaks</Label>
              <Switch
                id='autoStartBreaks'
                checked={settings.autoStartBreaks}
                onCheckedChange={(checked) =>
                  handleSettingChange('autoStartBreaks', checked)
                }
              />
            </div>

            <div className='flex items-center justify-between'>
              <Label htmlFor='autoStartWork'>Auto-start work</Label>
              <Switch
                id='autoStartWork'
                checked={settings.autoStartWork}
                onCheckedChange={(checked) =>
                  handleSettingChange('autoStartWork', checked)
                }
              />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Popup;
