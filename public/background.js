let timer = null;
let elapsedTime = 0;

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'startTimer') {
    console.log('startTimer called from popup');
    if (!timer) {
      timer = setInterval(() => {
        elapsedTime += 1;
        chrome.storage.local.set({ elapsedTime });
      }, 1000);
    }
  } else if (request.action === 'stopTimer') {
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
  } else if (request.action === 'getElapsedTime') {
    sendResponse({ elapsedTime });
  }
});
