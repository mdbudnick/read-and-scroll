export const STORAGE_PREFIX = "readAndScrollConfig_";

// Default values for when storage fails or is empty
const DEFAULT_VALUES: Record<string, unknown> = {
  [`${STORAGE_PREFIX}saveSettings`]: false,
  [`${STORAGE_PREFIX}alwaysEnabled`]: false,
  [`${STORAGE_PREFIX}fontSize`]: "18px",
  [`${STORAGE_PREFIX}theme`]: "light",
  [`${STORAGE_PREFIX}imageSize`]: "normal",
  [`${STORAGE_PREFIX}fontWeight`]: "normal",
  [`${STORAGE_PREFIX}isScrolling`]: false,
  [`${STORAGE_PREFIX}speed`]: 0,
  [`${STORAGE_PREFIX}value`]: "0",
  [`${STORAGE_PREFIX}label`]: "Stopped",
  [`${STORAGE_PREFIX}isClickStopped`]: false,
  [`${STORAGE_PREFIX}isPaused`]: false,
  [`${STORAGE_PREFIX}scrollLabel`]: "Stopped",
};

// Promisified Chrome storage operations with error handling and sane defaults
export const chromeStorageLocal = {
  get: (
    keys?: string | string[] | Record<string, unknown> | null
  ): Promise<Record<string, unknown>> => {
    return new Promise((resolve) => {
      chrome.storage.local.get(keys || null, (result) => {
        if (chrome.runtime.lastError) {
          // On error, return sane defaults for the requested keys
          console.warn('Chrome storage get error:', chrome.runtime.lastError);
          const defaults: Record<string, unknown> = {};
          
          if (keys === null || keys === undefined) {
            // If getting all, return all defaults
            Object.assign(defaults, DEFAULT_VALUES);
          } else if (typeof keys === 'string') {
            // Single key
            defaults[keys] = DEFAULT_VALUES[keys];
          } else if (Array.isArray(keys)) {
            // Array of keys
            keys.forEach(key => {
              if (typeof key === 'string') {
                defaults[key] = DEFAULT_VALUES[key];
              }
            });
          } else if (typeof keys === 'object') {
            // Object with default values
            Object.assign(defaults, keys);
          }
          
          resolve(defaults);
        } else {
          // Merge result with defaults for missing keys
          const resultWithDefaults = { ...result };
          
          if (keys === null || keys === undefined) {
            // Getting all - ensure all defaults are present
            Object.keys(DEFAULT_VALUES).forEach(key => {
              if (!(key in resultWithDefaults)) {
                resultWithDefaults[key] = DEFAULT_VALUES[key];
              }
            });
          } else if (typeof keys === 'string') {
            // Single key - ensure default is present if missing
            if (!(keys in resultWithDefaults)) {
              resultWithDefaults[keys] = DEFAULT_VALUES[keys];
            }
          } else if (Array.isArray(keys)) {
            // Array of keys - ensure defaults are present for missing keys
            keys.forEach(key => {
              if (typeof key === 'string' && !(key in resultWithDefaults)) {
                resultWithDefaults[key] = DEFAULT_VALUES[key];
              }
            });
          }
          
          resolve(resultWithDefaults);
        }
      });
    });
  },

  set: (items: Record<string, unknown>): Promise<void> => {
    return new Promise((resolve, reject) => {
      chrome.storage.local.set(items, () => {
        if (chrome.runtime.lastError) {
          console.error('Chrome storage set error:', chrome.runtime.lastError);
          reject(new Error(chrome.runtime.lastError.message));
        } else {
          resolve();
        }
      });
    });
  },

  remove: (keys: string | string[]): Promise<void> => {
    return new Promise((resolve, reject) => {
      chrome.storage.local.remove(keys, () => {
        if (chrome.runtime.lastError) {
          console.error('Chrome storage remove error:', chrome.runtime.lastError);
          reject(new Error(chrome.runtime.lastError.message));
        } else {
          resolve();
        }
      });
    });
  },

  clear: (): Promise<void> => {
    return new Promise((resolve, reject) => {
      chrome.storage.local.clear(() => {
        if (chrome.runtime.lastError) {
          console.error('Chrome storage clear error:', chrome.runtime.lastError);
          reject(new Error(chrome.runtime.lastError.message));
        } else {
          resolve();
        }
      });
    });
  },
};
