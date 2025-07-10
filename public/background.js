// Enhanced timer functionality with better error handling
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  try {
    if (request.action === 'startTimer') {
      chrome.storage.local.get('isRunning', (result) => {
        if (chrome.runtime.lastError) {
          console.error(
            'Error checking timer status:',
            chrome.runtime.lastError
          );
          sendResponse({
            success: false,
            error: chrome.runtime.lastError.message,
          });
          return;
        }

        if (!result.isRunning) {
          chrome.alarms.create('timerAlarm', { periodInMinutes: 1 / 60 });
          chrome.storage.local.set({ isRunning: true }, () => {
            if (chrome.runtime.lastError) {
              console.error('Error starting timer:', chrome.runtime.lastError);
              sendResponse({
                success: false,
                error: chrome.runtime.lastError.message,
              });
            } else {
              sendResponse({ success: true });
            }
          });
        } else {
          sendResponse({ success: true });
        }
      });
    } else if (request.action === 'stopTimer') {
      chrome.storage.local.get('isRunning', (result) => {
        if (chrome.runtime.lastError) {
          console.error(
            'Error checking timer status:',
            chrome.runtime.lastError
          );
          sendResponse({
            success: false,
            error: chrome.runtime.lastError.message,
          });
          return;
        }

        if (result.isRunning) {
          chrome.alarms.clear('timerAlarm');
          chrome.storage.local.set(
            { isRunning: false, activeProject: null },
            () => {
              if (chrome.runtime.lastError) {
                console.error(
                  'Error stopping timer:',
                  chrome.runtime.lastError
                );
                sendResponse({
                  success: false,
                  error: chrome.runtime.lastError.message,
                });
              } else {
                sendResponse({ success: true });
              }
            }
          );
        } else {
          sendResponse({ success: true });
        }
      });
    } else if (request.action === 'startPomodoro') {
      const duration = request.duration || 25;
      const isBreak = request.isBreak || false;
      const startTime = Date.now();
      const completedPomodoros = request.completedPomodoros || 0;

      chrome.alarms.create('pomodoroAlarm', {
        delayInMinutes: duration,
      });

      const storageData = {
        isPomodoroRunning: true,
        pomodoroStartTime: startTime,
        pomodoroDuration: duration * 60, // store in seconds
        isBreak: isBreak,
        completedPomodoros: completedPomodoros,
      };

      chrome.storage.local.set(storageData, () => {
        if (chrome.runtime.lastError) {
          console.error('Error starting pomodoro:', chrome.runtime.lastError);
          sendResponse({
            success: false,
            error: chrome.runtime.lastError.message,
          });
        } else {
          sendResponse({ success: true });
        }
      });
    } else if (request.action === 'stopPomodoro') {
      chrome.alarms.clear('pomodoroAlarm');
      chrome.storage.local.set(
        {
          isPomodoroRunning: false,
          pomodoroStartTime: null,
          pomodoroDuration: null,
          isBreak: false,
        },
        () => {
          if (chrome.runtime.lastError) {
            console.error('Error stopping pomodoro:', chrome.runtime.lastError);
            sendResponse({
              success: false,
              error: chrome.runtime.lastError.message,
            });
          } else {
            sendResponse({ success: true });
          }
        }
      );
    } else if (request.action === 'enableBreakReminders') {
      // Enable break reminders and set up the alarm
      const interval = request.interval || 60;
      const now = Date.now();
      const nextBreakTime = now + interval * 60 * 1000;

      chrome.alarms.create('breakReminderAlarm', {
        delayInMinutes: interval,
      });

      chrome.storage.local.set(
        {
          breakSettings: {
            ...request.settings,
            enabled: true,
            lastBreakTime: now,
            nextBreakTime: nextBreakTime,
          },
        },
        () => {
          if (chrome.runtime.lastError) {
            console.error(
              'Error enabling break reminders:',
              chrome.runtime.lastError
            );
            sendResponse({
              success: false,
              error: chrome.runtime.lastError.message,
            });
          } else {
            sendResponse({ success: true });
          }
        }
      );
    } else if (request.action === 'disableBreakReminders') {
      // Disable break reminders and clear the alarm
      chrome.alarms.clear('breakReminderAlarm');

      chrome.storage.local.set(
        {
          breakSettings: {
            ...request.settings,
            enabled: false,
            lastBreakTime: 0,
            nextBreakTime: 0,
          },
        },
        () => {
          if (chrome.runtime.lastError) {
            console.error(
              'Error disabling break reminders:',
              chrome.runtime.lastError
            );
            sendResponse({
              success: false,
              error: chrome.runtime.lastError.message,
            });
          } else {
            sendResponse({ success: true });
          }
        }
      );
    } else if (request.action === 'updateBreakReminders') {
      // Update break reminder settings and reset the alarm
      const interval = request.interval || 60;
      const now = Date.now();
      const nextBreakTime = now + interval * 60 * 1000;

      chrome.alarms.clear('breakReminderAlarm');
      chrome.alarms.create('breakReminderAlarm', {
        delayInMinutes: interval,
      });

      chrome.storage.local.set(
        {
          breakSettings: {
            ...request.settings,
            lastBreakTime: now,
            nextBreakTime: nextBreakTime,
          },
        },
        () => {
          if (chrome.runtime.lastError) {
            console.error(
              'Error updating break reminders:',
              chrome.runtime.lastError
            );
            sendResponse({
              success: false,
              error: chrome.runtime.lastError.message,
            });
          } else {
            sendResponse({ success: true });
          }
        }
      );
    } else if (request.action === 'markBreakTaken') {
      // Mark break as taken and schedule next break
      const interval = request.interval || 60;
      const now = Date.now();
      const nextBreakTime = now + interval * 60 * 1000;

      chrome.alarms.clear('breakReminderAlarm');
      chrome.alarms.create('breakReminderAlarm', {
        delayInMinutes: interval,
      });

      chrome.storage.local.set(
        {
          breakSettings: {
            ...request.settings,
            lastBreakTime: now,
            nextBreakTime: nextBreakTime,
          },
        },
        () => {
          if (chrome.runtime.lastError) {
            console.error(
              'Error marking break taken:',
              chrome.runtime.lastError
            );
            sendResponse({
              success: false,
              error: chrome.runtime.lastError.message,
            });
          } else {
            sendResponse({ success: true });
          }
        }
      );
    } else if (request.action === 'showBreakReminder') {
      // Handle break reminder with audio notification
      const customMessage = request.message || 'Time for a break!';
      chrome.storage.local.get(['breakSettings'], (result) => {
        const ttsEnabled =
          result.breakSettings &&
          typeof result.breakSettings.ttsEnabled === 'boolean'
            ? result.breakSettings.ttsEnabled
            : true; // default to true
        if (ttsEnabled) {
          playNotificationSound('Break reminder');
        }

        chrome.notifications.create(
          {
            type: 'basic',
            iconUrl: 'icon.png',
            title: 'Break Reminder! 🎯',
            message: customMessage,
            priority: 2,
          },
          (notificationId) => {
            if (chrome.runtime.lastError) {
              console.error(
                'Error creating break reminder notification:',
                chrome.runtime.lastError
              );
              sendResponse({
                success: false,
                error: chrome.runtime.lastError.message,
              });
            } else {
              sendResponse({ success: true });
            }
          }
        );
      });
    } else {
      sendResponse({ success: false, error: 'Unknown action' });
    }
  } catch (error) {
    console.error('Error in message listener:', error);
    sendResponse({ success: false, error: error.message });
  }

  // Return true to indicate you wish to send a response asynchronously
  return true;
});

// Handle alarms with better error handling
chrome.alarms.onAlarm.addListener((alarm) => {
  try {
    if (alarm.name === 'timerAlarm') {
      chrome.storage.local.get('isRunning', (result) => {
        if (chrome.runtime.lastError) {
          console.error(
            'Error getting timer status:',
            chrome.runtime.lastError
          );
          return;
        }

        if (result.isRunning) {
          chrome.storage.local.get('elapsedTime', (result) => {
            if (chrome.runtime.lastError) {
              console.error(
                'Error getting elapsed time:',
                chrome.runtime.lastError
              );
              return;
            }

            chrome.storage.local.set(
              {
                elapsedTime: (result.elapsedTime || 0) + 1,
              },
              () => {
                if (chrome.runtime.lastError) {
                  console.error(
                    'Error updating elapsed time:',
                    chrome.runtime.lastError
                  );
                }
              }
            );
          });
        }
      });
    } else if (alarm.name === 'pomodoroAlarm') {
      chrome.storage.local.get(
        [
          'isPomodoroRunning',
          'isBreak',
          'pomodoroSettings',
          'completedPomodoros',
        ],
        (result) => {
          if (chrome.runtime.lastError) {
            console.error(
              'Error getting pomodoro status:',
              chrome.runtime.lastError
            );
            return;
          }

          const isBreak = result.isBreak || false;
          const currentCompleted = result.completedPomodoros || 0;
          const title = isBreak
            ? 'Break Complete! 🎯'
            : 'Pomodoro Complete! 🍅';
          const message = isBreak
            ? 'Break time is over. Ready to work?'
            : 'Great work! Take a break 🍅⏲️';

          // Play notification sound with appropriate message if ttsEnabled is true
          const audioMessage = isBreak
            ? 'Break time complete'
            : 'Pomodoro complete';
          const ttsEnabled =
            result.pomodoroSettings &&
            typeof result.pomodoroSettings.ttsEnabled === 'boolean'
              ? result.pomodoroSettings.ttsEnabled
              : true; // default to true
          if (ttsEnabled) {
            playNotificationSound(audioMessage);
          }

          chrome.notifications.create(
            {
              type: 'basic',
              iconUrl: 'icon.png',
              title: title,
              message: message,
              priority: 2,
            },
            (notificationId) => {
              if (chrome.runtime.lastError) {
                console.error(
                  'Error creating notification:',
                  chrome.runtime.lastError
                );
              }
            }
          );

          // Increment completed count if it was a work session (not a break)
          const newCompleted = isBreak
            ? currentCompleted
            : currentCompleted + 1;

          chrome.storage.local.set(
            {
              isPomodoroRunning: false,
              pomodoroStartTime: null,
              pomodoroDuration: null,
              isBreak: false,
              completedPomodoros: newCompleted,
            },
            () => {
              if (chrome.runtime.lastError) {
                console.error(
                  'Error resetting pomodoro state:',
                  chrome.runtime.lastError
                );
              }
            }
          );
        }
      );
    } else if (alarm.name === 'breakReminderAlarm') {
      chrome.storage.local.get(['breakSettings'], (result) => {
        if (chrome.runtime.lastError) {
          console.error(
            'Error getting break settings:',
            chrome.runtime.lastError
          );
          return;
        }

        const breakSettings = result.breakSettings;
        if (!breakSettings || !breakSettings.enabled) {
          return;
        }

        const randomActivity =
          breakSettings.breakActivities &&
          breakSettings.breakActivities.length > 0
            ? breakSettings.breakActivities[
                Math.floor(Math.random() * breakSettings.breakActivities.length)
              ]
            : 'Take a short walk';

        const message = `${
          breakSettings.customMessage || 'Time for a break!'
        }\n\nSuggested activity: ${randomActivity}`;

        // Play notification sound if enabled
        const ttsEnabled =
          breakSettings.ttsEnabled !== undefined
            ? breakSettings.ttsEnabled
            : true;
        if (ttsEnabled) {
          playNotificationSound('Break reminder');
        }

        // Show notification based on reminder type
        if (
          breakSettings.reminderType === 'notification' ||
          breakSettings.reminderType === 'both'
        ) {
          chrome.notifications.create(
            {
              type: 'basic',
              iconUrl: 'icon.png',
              title: 'Break Reminder! 🎯',
              message: message,
              priority: 2,
            },
            (notificationId) => {
              if (chrome.runtime.lastError) {
                console.error(
                  'Error creating break reminder notification:',
                  chrome.runtime.lastError
                );
              }
            }
          );
        }

        // Schedule next break
        const interval = breakSettings.interval || 60;
        const now = Date.now();
        const nextBreakTime = now + interval * 60 * 1000;

        chrome.alarms.create('breakReminderAlarm', {
          delayInMinutes: interval,
        });

        chrome.storage.local.set(
          {
            breakSettings: {
              ...breakSettings,
              lastBreakTime: now,
              nextBreakTime: nextBreakTime,
            },
          },
          () => {
            if (chrome.runtime.lastError) {
              console.error(
                'Error updating break settings:',
                chrome.runtime.lastError
              );
            }
          }
        );
      });
    }
  } catch (error) {
    console.error('Error handling alarm:', error);
  }
});

// Function to play notification sound
function playNotificationSound(message) {
  try {
    // Use chrome.tts for audio notification in background script
    chrome.tts.speak(message, {
      rate: 0.8, // Slower rate for better clarity
      pitch: 1.2, // Higher pitch for better audibility
      volume: 1.0, // Maximum volume (100%)
      onEvent: function (event) {
        if (event.type === 'error') {
          console.error('TTS error:', event);
        }
      },
    });
  } catch (error) {
    console.error('Error playing notification sound:', error);
  }
}

// Handle notification clicks
chrome.notifications.onClicked.addListener((notificationId) => {
  try {
    // Focus the extension popup when notification is clicked
    chrome.action.openPopup();
  } catch (error) {
    console.error('Error handling notification click:', error);
  }
});

// Handle extension installation
chrome.runtime.onInstalled.addListener((details) => {
  try {
    if (details.reason === 'install') {
      // Set default settings on first install
      chrome.storage.local.set(
        {
          completedPomodoros: 0,
          pomodoroSettings: {
            workDuration: 25,
            breakDuration: 5,
            longBreakDuration: 15,
            autoStartBreaks: false,
            autoStartWork: false,
            longBreakInterval: 4,
          },
          breakSettings: {
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
          },
        },
        () => {
          if (chrome.runtime.lastError) {
            console.error(
              'Error setting default settings:',
              chrome.runtime.lastError
            );
          }
        }
      );
    }
  } catch (error) {
    console.error('Error handling installation:', error);
  }
});
