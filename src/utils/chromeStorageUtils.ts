import { ChromeStorageData, StorageResponse } from '../types';

interface GetStorageCallback {
  (result: Record<string, unknown>): void;
}

interface SetStorageCallback {
  (): void;
}

// Improved Chrome Storage API with error handling
export const getChromeStorageData = (
  keys: string[],
  callback: GetStorageCallback
): void => {
  try {
    chrome.storage.local.get(keys, (result) => {
      if (chrome.runtime.lastError) {
        console.error('Chrome storage get error:', chrome.runtime.lastError);
        callback({});
        return;
      }
      callback(result);
    });
  } catch (error) {
    console.error('Error accessing Chrome storage:', error);
    callback({});
  }
};

export const setChromeStorageData = (
  data: Partial<ChromeStorageData>,
  callback?: SetStorageCallback
): void => {
  try {
    chrome.storage.local.set(data, () => {
      if (chrome.runtime.lastError) {
        console.error('Chrome storage set error:', chrome.runtime.lastError);
      }
      callback?.();
    });
  } catch (error) {
    console.error('Error setting Chrome storage:', error);
    callback?.();
  }
};

// Async wrapper for Chrome storage operations
export const getStorageDataAsync = async (
  keys: string[]
): Promise<StorageResponse> => {
  return new Promise((resolve) => {
    try {
      chrome.storage.local.get(keys, (result) => {
        if (chrome.runtime.lastError) {
          resolve({
            success: false,
            error: chrome.runtime.lastError.message,
          });
          return;
        }
        resolve({
          success: true,
          data: result as ChromeStorageData,
        });
      });
    } catch (error) {
      resolve({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });
};

export const setStorageDataAsync = async (
  data: Partial<ChromeStorageData>
): Promise<StorageResponse> => {
  return new Promise((resolve) => {
    try {
      chrome.storage.local.set(data, () => {
        if (chrome.runtime.lastError) {
          resolve({
            success: false,
            error: chrome.runtime.lastError.message,
          });
          return;
        }
        resolve({ success: true });
      });
    } catch (error) {
      resolve({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });
};

// Utility function to clear specific storage keys
export const clearStorageData = async (
  keys: string[]
): Promise<StorageResponse> => {
  return new Promise((resolve) => {
    try {
      chrome.storage.local.remove(keys, () => {
        if (chrome.runtime.lastError) {
          resolve({
            success: false,
            error: chrome.runtime.lastError.message,
          });
          return;
        }
        resolve({ success: true });
      });
    } catch (error) {
      resolve({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });
};

// Utility function to get all storage data
export const getAllStorageData = async (): Promise<StorageResponse> => {
  return new Promise((resolve) => {
    try {
      chrome.storage.local.get(null, (result) => {
        if (chrome.runtime.lastError) {
          resolve({
            success: false,
            error: chrome.runtime.lastError.message,
          });
          return;
        }
        resolve({
          success: true,
          data: result as ChromeStorageData,
        });
      });
    } catch (error) {
      resolve({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });
};
