interface GetStorageCallback {
  (result: Record<string, unknown>): void;
}

interface StorageData {
  [key: string]: unknown;
}

interface SetStorageCallback {
  (): void;
}

export const getChromeStorageData = (
  keys: string[],
  callback: GetStorageCallback
) => {
  chrome.storage.local.get(keys, callback);
};

export const setChromeStorageData = (
  data: StorageData,
  callback?: SetStorageCallback
) => {
  chrome.storage.local.set(data, callback || (() => {}));
};
