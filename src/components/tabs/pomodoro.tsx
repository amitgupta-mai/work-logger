import { useEffect, useState, useCallback } from 'react';
import { toast } from 'sonner';
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
  const [isInitializing, setIsInitializing] = useState(true);

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

  // Ensure popup has focus when it loads to fix first-click issue
  useEffect(() => {
    // Focus the popup window to ensure clicks register properly
    if (window.focus) {
      window.focus();
    }
  }, []);

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

          if (isInitializing) {
            setIsInitializing(false);
          }

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
  }, [settings, isInitializing]);

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
        (response) => {
          if (chrome.runtime.lastError || !response?.success) {
            console.error(
              'Error starting pomodoro:',
              chrome.runtime.lastError || response?.error
            );
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
      const isLongBreak = completedPomodoros % settings.longBreakInterval === 0;
      const duration = isLongBreak
        ? settings.longBreakDuration
        : settings.breakDuration;
      chrome.runtime.sendMessage(
        {
          action: 'startPomodoro',
          duration,
          isBreak: true,
          isLongBreak,
          completedPomodoros,
        },
        (response) => {
          if (chrome.runtime.lastError || !response?.success) {
            console.error(
              'Error starting break:',
              chrome.runtime.lastError || response?.error
            );
            toast.error('Failed to start break');
          } else {
            setIsRunning(true);
            setIsBreak(true);
            setRemaining(duration * 60);
            toast.success('Break started');
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
      chrome.runtime.sendMessage(
        { action: 'stopPomodoro' },
        async (response) => {
          if (chrome.runtime.lastError || !response?.success) {
            console.error(
              'Error stopping pomodoro:',
              chrome.runtime.lastError || response?.error
            );
            toast.error('Failed to stop pomodoro');
          } else {
            if (!isBreak) {
              const newCompleted = completedPomodoros + 1;
              setCompletedPomodoros(newCompleted);
              await setStorageDataAsync({ completedPomodoros: newCompleted });
            }
            setRemaining(settings.workDuration * 60);
            setIsRunning(false);
            setIsBreak(false);
            toast.info(isBreak ? 'Break stopped' : 'Pomodoro stopped');
          }
          setIsLoading(false);
        }
      );
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

  // Wrapper function to ensure popup is focused before handling clicks
  const handleButtonClick = (action: () => void) => {
    return () => {
      // Ensure popup has focus
      if (window.focus) {
        window.focus();
      }
      // Small delay to ensure focus is established
      setTimeout(() => {
        action();
      }, 10);
    };
  };

  return (
    <div className='h-full flex flex-col gap-2'>
      <div className='overflow-y-scroll hide-scrollbar-on-idle pb-4'>
        <Card className='w-full'>
          <CardHeader className='pb-3'>
            <div className='flex items-center justify-between'>
              <CardTitle className='text-lg'>
                {isBreak ? 'Break Timer' : 'Pomodoro Timer'}
              </CardTitle>
              <Button
                variant='ghost'
                size='sm'
                onClick={() => setShowSettings(!showSettings)}
                className='h-8 w-8 p-0'
              >
                <SettingsIcon className='h-4 w-4' />
              </Button>
            </div>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='text-center'>
              <div className='text-4xl font-mono font-bold mb-2'>
                {isInitializing ? (
                  <div className='flex items-center justify-center gap-2'>
                    <div className='animate-spin rounded-full h-6 w-6 border-b-2 border-primary'></div>
                    <span className='text-lg'>Loading...</span>
                  </div>
                ) : (
                  formatTime(remaining)
                )}
              </div>
              <div className='text-sm text-muted-foreground'>
                {isInitializing
                  ? 'Loading...'
                  : isBreak
                  ? 'Break time'
                  : 'Work time'}
              </div>
            </div>

            <div className='text-sm text-muted-foreground text-center'>
              {completedPomodoros > 0
                ? `Completed: ${completedPomodoros} pomodoro${
                    completedPomodoros !== 1 ? 's' : ''
                  }`
                : 'Completed: 0 pomodoros'}
            </div>

            {!isInitializing && (
              <>
                <div className='flex gap-2 justify-center'>
                  {isRunning ? (
                    <Button
                      variant='destructive'
                      onClick={handleButtonClick(stopPomodoro)}
                      disabled={isLoading}
                      className='flex items-center gap-2'
                    >
                      <PauseIcon className='w-4 h-4' />
                      Stop
                    </Button>
                  ) : (
                    <>
                      <Button
                        onClick={handleButtonClick(startPomodoro)}
                        disabled={isLoading}
                        className='flex items-center gap-2'
                      >
                        <PlayIcon className='w-4 h-4' />
                        Start Work
                      </Button>
                      <Button
                        variant='outline'
                        onClick={handleButtonClick(startBreak)}
                        disabled={isLoading}
                      >
                        Start Break
                      </Button>
                    </>
                  )}
                </div>

                {completedPomodoros > 0 && (
                  <div className='flex justify-center'>
                    <Button
                      variant='ghost'
                      size='sm'
                      onClick={handleButtonClick(resetPomodoro)}
                      className='flex items-center gap-2'
                    >
                      <RotateCcwIcon className='w-4 h-4' />
                      Reset Count
                    </Button>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {showSettings && (
          <Card className='w-full mt-4 flex-shrink-0'>
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
                    disabled={isRunning}
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
                    disabled={isRunning}
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

              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <Label htmlFor='longBreakDuration'>Long Break (min)</Label>
                  <Select
                    value={settings.longBreakDuration.toString()}
                    onValueChange={(value) =>
                      handleSettingChange('longBreakDuration', parseInt(value))
                    }
                    disabled={isRunning}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[10, 15, 20, 30].map((duration) => (
                        <SelectItem key={duration} value={duration.toString()}>
                          {duration}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor='longBreakInterval'>Long Break Every</Label>
                  <Select
                    value={settings.longBreakInterval.toString()}
                    onValueChange={(value) =>
                      handleSettingChange('longBreakInterval', parseInt(value))
                    }
                    disabled={isRunning}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[2, 3, 4, 5, 6].map((interval) => (
                        <SelectItem key={interval} value={interval.toString()}>
                          {interval} pomodoro{interval !== 1 ? 's' : ''}
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

              <div className='flex items-center justify-between'>
                <Label htmlFor='playSound'>Play Sound</Label>
                <Switch
                  id='playSound'
                  checked={settings.ttsEnabled ?? true}
                  onCheckedChange={(checked) =>
                    handleSettingChange('ttsEnabled', checked)
                  }
                />
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Popup;
