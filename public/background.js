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

      chrome.alarms.create('pomodoroAlarm', {
        delayInMinutes: duration,
      });

      const storageData = {
        isPomodoroRunning: true,
        pomodoroStartTime: startTime,
        pomodoroDuration: duration * 60, // store in seconds
        isBreak: isBreak,
      };

      // Update completed pomodoros if this is a work session
      if (!isBreak) {
        chrome.storage.local.get('completedPomodoros', (result) => {
          const currentCompleted = result.completedPomodoros || 0;
          storageData.completedPomodoros = currentCompleted + 1;

          chrome.storage.local.set(storageData, () => {
            if (chrome.runtime.lastError) {
              console.error(
                'Error starting pomodoro:',
                chrome.runtime.lastError
              );
              sendResponse({
                success: false,
                error: chrome.runtime.lastError.message,
              });
            } else {
              sendResponse({ success: true });
            }
          });
        });
      } else {
        chrome.storage.local.set(storageData, () => {
          if (chrome.runtime.lastError) {
            console.error('Error starting break:', chrome.runtime.lastError);
            sendResponse({
              success: false,
              error: chrome.runtime.lastError.message,
            });
          } else {
            sendResponse({ success: true });
          }
        });
      }
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
    } else {
      sendResponse({ success: false, error: 'Unknown action' });
    }
  } catch (error) {
    console.error('Error in message listener:', error);
    sendResponse({ success: false, error: error.message });
  }
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
      chrome.storage.local.get(['isPomodoroRunning', 'isBreak'], (result) => {
        if (chrome.runtime.lastError) {
          console.error(
            'Error getting pomodoro status:',
            chrome.runtime.lastError
          );
          return;
        }

        const isBreak = result.isBreak || false;
        const title = isBreak ? 'Break Complete! 🎯' : 'Pomodoro Complete! 🍅';
        const message = isBreak
          ? 'Break time is over. Ready to work?'
          : 'Great work! Take a break 🍅⏲️';

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

        chrome.storage.local.set(
          {
            isPomodoroRunning: false,
            pomodoroStartTime: null,
            pomodoroDuration: null,
            isBreak: false,
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
      });
    }
  } catch (error) {
    console.error('Error handling alarm:', error);
  }
});

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
