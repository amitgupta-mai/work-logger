import { useEffect, useState, useCallback } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import {
  getStorageDataAsync,
  setStorageDataAsync,
} from '@/utils/chromeStorageUtils';
import {
  BellIcon,
  CoffeeIcon,
  FootprintsIcon,
  SettingsIcon,
} from 'lucide-react';
import { BreakSettings } from '@/types';

const DEFAULT_SETTINGS: BreakSettings = {
  enabled: false,
  interval: 60,
  reminderType: 'notification',
  breakActivities: [
    'Take a short walk',
    'Stretch your legs',
    'Look away from screen',
    'Drink some water',
    'Deep breathing exercise',
  ],
  customMessage: 'Time for a break!',
  lastBreakTime: 0,
  nextBreakTime: 0,
};

const BreakReminder = () => {
  const [settings, setSettings] = useState<BreakSettings>(DEFAULT_SETTINGS);
  const [showSettings, setShowSettings] = useState(false);
  const [timeUntilBreak, setTimeUntilBreak] = useState<number>(0);

  const loadSettings = useCallback(async () => {
    try {
      const response = await getStorageDataAsync(['breakSettings']);
      if (response.success && response.data?.breakSettings) {
        const savedSettings = {
          ...DEFAULT_SETTINGS,
          ...response.data.breakSettings,
        };
        setSettings(savedSettings);
        calculateNextBreak(savedSettings);
      }
    } catch (error) {
      console.error('Error loading break settings:', error);
    }
  }, []);

  const saveSettings = useCallback(async (newSettings: BreakSettings) => {
    try {
      await setStorageDataAsync({ breakSettings: newSettings });
      setSettings(newSettings);
      toast.success('Settings Saved', {
        description: 'Your break reminders have been updated.',
        duration: 2000,
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    }
  }, []);

  const calculateNextBreak = (currentSettings: BreakSettings) => {
    if (!currentSettings.enabled) return;

    const now = Date.now();
    const lastBreak = currentSettings.lastBreakTime || now;
    const intervalMs = currentSettings.interval * 60 * 1000;
    const nextBreak = lastBreak + intervalMs;

    setTimeUntilBreak(Math.max(0, nextBreak - now));
  };

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  useEffect(() => {
    if (!settings.enabled) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const timeLeft = settings.nextBreakTime - now;
      setTimeUntilBreak(Math.max(0, timeLeft));
    }, 1000);

    return () => clearInterval(interval);
  }, [settings]);

  const markBreakTaken = async () => {
    chrome.runtime.sendMessage(
      {
        action: 'markBreakTaken',
        interval: settings.interval,
        settings: settings,
      },
      (response) => {
        if (chrome.runtime.lastError || !response?.success) {
          console.error(
            'Error marking break taken:',
            chrome.runtime.lastError || response?.error
          );
          toast.error('Failed to mark break as taken');
        } else {
          const now = Date.now();
          const newSettings = {
            ...settings,
            lastBreakTime: now,
            nextBreakTime: now + settings.interval * 60 * 1000,
          };
          setSettings(newSettings);
          setTimeUntilBreak(settings.interval * 60 * 1000);
        }
      }
    );
  };

  const toggleBreakReminder = async () => {
    const newSettings = { ...settings, enabled: !settings.enabled };

    if (newSettings.enabled) {
      // Enable break reminders via background script
      chrome.runtime.sendMessage(
        {
          action: 'enableBreakReminders',
          interval: newSettings.interval,
          settings: newSettings,
        },
        (response) => {
          if (chrome.runtime.lastError || !response?.success) {
            console.error(
              'Error enabling break reminders:',
              chrome.runtime.lastError || response?.error
            );
            toast.error('Failed to enable break reminders');
          } else {
            setSettings(newSettings);
            toast.success('Break reminders enabled!');
          }
        }
      );
    } else {
      // Disable break reminders via background script
      chrome.runtime.sendMessage(
        {
          action: 'disableBreakReminders',
          settings: newSettings,
        },
        (response) => {
          if (chrome.runtime.lastError || !response?.success) {
            console.error(
              'Error disabling break reminders:',
              chrome.runtime.lastError || response?.error
            );
            toast.error('Failed to disable break reminders');
          } else {
            setSettings(newSettings);
            toast.info('Break reminders disabled');
          }
        }
      );
    }
  };

  const handleSettingChange = (
    key: keyof BreakSettings,
    value: string | number | boolean
  ) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);

    // If interval changed and reminders are enabled, update the background script
    if (key === 'interval' && settings.enabled) {
      chrome.runtime.sendMessage(
        {
          action: 'updateBreakReminders',
          interval: value as number,
          settings: newSettings,
        },
        (response) => {
          if (chrome.runtime.lastError || !response?.success) {
            console.error(
              'Error updating break reminders:',
              chrome.runtime.lastError || response?.error
            );
            toast.error('Failed to update break reminders');
          }
        }
      );
    } else {
      // For other settings, just save locally
      saveSettings(newSettings);
    }
  };

  const formatTimeUntilBreak = (ms: number): string => {
    if (ms <= 0) return 'Now!';

    const minutes = Math.floor(ms / (1000 * 60));
    const seconds = Math.floor((ms % (1000 * 60)) / 1000);

    if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    }
    return `${seconds}s`;
  };

  const takeBreakNow = async () => {
    await markBreakTaken();
    toast.success('Break marked as taken!');
  };

  return (
    <div className='h-full flex flex-col gap-2'>
      <div className='overflow-y-scroll hide-scrollbar-on-idle pb-4'>
        <Card className='w-full'>
          <CardHeader className='p-4 pb-2'>
            <div className='flex items-center justify-between'>
              <CardTitle className='text-lg'>Break Reminder</CardTitle>
              <Button
                variant='ghost'
                size='sm'
                onClick={() => setShowSettings(!showSettings)}
              >
                <SettingsIcon className='w-4 h-4' />
              </Button>
            </div>
          </CardHeader>
          <CardContent className='flex flex-col items-center gap-3 p-4 pt-0'>
            <div className='flex items-center gap-2'>
              <BellIcon
                className={`w-6 h-6 ${
                  settings.enabled ? 'text-green-500' : 'text-gray-400'
                }`}
              />
              <span className='text-sm font-medium'>
                {settings.enabled ? 'Active' : 'Inactive'}
              </span>
            </div>

            {settings.enabled && (
              <>
                <div className='text-center'>
                  <div className='text-2xl font-mono font-bold'>
                    {formatTimeUntilBreak(timeUntilBreak)}
                  </div>
                  <div className='text-sm text-muted-foreground'>
                    until next break
                  </div>
                </div>

                <div className='flex gap-2'>
                  <Button
                    onClick={takeBreakNow}
                    variant='outline'
                    size='sm'
                    className='flex items-center gap-2'
                  >
                    <CoffeeIcon className='w-4 h-4' />
                    Take Break Now
                  </Button>
                </div>
              </>
            )}

            <div className='w-full rounded-lg border bg-card p-3'>
              <div className='flex items-center justify-between w-full'>
                <Label htmlFor='breakToggle' className='flex items-center'>
                  Enable Break Reminders
                </Label>
                <Switch
                  id='breakToggle'
                  checked={settings.enabled}
                  onCheckedChange={toggleBreakReminder}
                />
              </div>

              {settings.enabled && (
                <div className='text-xs text-muted-foreground mt-2'>
                  Reminders every {settings.interval} minutes
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {showSettings && (
          <Card className='w-full mt-4 flex-shrink-0'>
            <CardHeader className='p-4 pb-2'>
              <CardTitle className='text-sm'>Settings</CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div>
                <Label htmlFor='interval'>Break Interval (minutes)</Label>
                <Select
                  value={settings.interval.toString()}
                  onValueChange={(value) =>
                    handleSettingChange('interval', parseInt(value))
                  }
                >
                  <SelectTrigger className='w-full'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[30, 45, 60, 90, 120].map((interval) => (
                      <SelectItem key={interval} value={interval.toString()}>
                        {interval}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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

              <div>
                <Label htmlFor='reminderType'>Reminder Type</Label>
                <Select
                  value={settings.reminderType}
                  onValueChange={(value) =>
                    handleSettingChange('reminderType', value)
                  }
                >
                  <SelectTrigger className='w-full'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='notification'>Notification</SelectItem>
                    <SelectItem value='popup'>Popup</SelectItem>
                    <SelectItem value='both'>Both</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor='customMessage'>Custom Message</Label>
                <Input
                  id='customMessage'
                  value={settings.customMessage}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    handleSettingChange('customMessage', e.target.value)
                  }
                  placeholder='Enter your break reminder message'
                />
              </div>

              <div>
                <Label>Break Activities</Label>
                <div className='text-xs text-muted-foreground mt-1'>
                  Random activities will be suggested during breaks
                </div>
                <div className='mt-2 space-y-1'>
                  {settings.breakActivities.map((activity, index) => (
                    <div
                      key={index}
                      className='flex items-center gap-2 text-sm'
                    >
                      <FootprintsIcon className='w-3 h-3 text-muted-foreground' />
                      {activity}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default BreakReminder;
