chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'startTimer') {
    chrome.storage.local.get('isRunning', (result) => {
      if (!result.isRunning) {
        chrome.alarms.create('timerAlarm', { periodInMinutes: 1 / 60 });
        chrome.storage.local.set({ isRunning: true });
      }
    });
  } else if (request.action === 'stopTimer') {
    chrome.storage.local.get('isRunning', (result) => {
      if (result.isRunning) {
        chrome.alarms.clear('timerAlarm');
        chrome.storage.local.set({ isRunning: false, activeProject: null });
      }
    });
  }
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'timerAlarm') {
    chrome.storage.local.get('isRunning', (result) => {
      if (result.isRunning) {
        chrome.storage.local.get('elapsedTime', (result) => {
          chrome.storage.local.set({
            elapsedTime: (result.elapsedTime || 0) + 1,
          });
        });
      }
    });
  }
});
