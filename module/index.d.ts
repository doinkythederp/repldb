declare module "repldb" {
  /**
   * @module repldb
   */
  import EventEmitter from 'events';

  /**
   * A safe value that can be stored in JSON format
   * @typedef {(undefined | null | string | number | safeValue[] | {[key: string]: safeValue})} safeValue
   */
  type safeValue =
    | null
    | string
    | number
    | safeValue[]
    | { [key: string]: safeValue };

  /**
   * A function that takes a key, value, and/or index
   * @typedef {((key?: string, value?: safeValue, index?: number) => void)} forEachFunction
   */
  type forEachFunction = (key?: string, value?: safeValue, index?: number) => void;

  /**
   * A function that takes a key, value and/or index and returns a boolean
   * @typedef {((key?: string, value?: safeValue, index?: number) => boolean)} filterFunction
   */
  type filterFunction = (key?: string, value?: safeValue, index?: number) => boolean;

  class InvalidTokenError extends Error { }

  interface API<db> {
    getSync(key: string, force: boolean | undefined, cache: boolean): string,
    get(key: string, force: boolean | undefined, cache: boolean): Promise<string>,
    setSync(key: string, value: safeValue, cache: boolean): void,
    set(key: string, value: safeValue, cache: boolean): Promise<void>,
    keysSync(): string[],
    keys(): Promise<string[]>,
    deleteSync(key: string): boolean,
    delete(key: string): Promise<boolean>,
    client: db
  }

  export class repldb {
    /**
     * A repldb instance to interact with a Repl's Database
     * @param {string} [customURL=process.env.REPLIT_DB_URL] - The custom URL to use - leave blank if you are the owner of the repl
     * @param {boolean} [doCache=true] - Save the downloaded values in a cache for faster access
     */
    constructor(doCache?: boolean, customURL?: string);

    /**
     * The URL used to connect
     * @type {string}
     * @readonly
    */
    url: string

    // Cache

    /**
     *  The map of cached raw values that have been downloaded
     *  @see doCache
     *  @type {Map<string, string>}
     */
    cache: Map<string, string>;
    /**
     * Controls whether or not to use the cache
     * @see cache
     * @type {boolean}
     */
    doCache: boolean;

    // Events

    /**
     * The event emitter used to broadcast events
     * @type {EventEmitter}
     * @requires events
     */
    events: EventEmitter;
    /**
     * Used to start listening for events
     * @see events
     */
    on: EventEmitter.on;
    /**
     * Used to stop listening for events
     * @see events
     */
    off: EventEmitter.on;
    /**
     * Used to listen for an event once
     * @see events
     */
    once: EventEmitter.on;

    // Base functionality

    /**
     * Syncronously gets the value of a key from the database
     * @param {string} key The key to look up
     * @param {boolean} force Force an API request
     * @param {boolean} cache Cache the returned value
     * @param {boolean} raw Return the unparsed value
     * @returns {safeValue | string}
     * @throws Throws an error when it encounters invalid JSON
     */
    getSync(
      key: string,
      force?: boolean,
      cache?: boolean,
      raw?: boolean
    ): safeValue | string;

    /**
     * Asyncronously gets the value of a key from the database
     * @async
     * @param {string} key The key to look up
     * @param {boolean} force Force an API request
     * @param {boolean} cache Cache the returned value
     * @param {boolean} raw Return the unparsed value
     * @returns {Promise<safeValue | string>}
     * @throws Rejects when it encounters invalid JSON
     */
    get(
      key: string,
      force?: boolean,
      cache?: boolean,
      raw?: boolean
    ): Promise<safeValue | string>;

    /**
     * Syncronously sets the value of a key to the database
     * @param {string} key The key to set
     * @param {safeValue} value The key to set
     * @param {boolean} cache Cache the set value
     * @returns {this}
     * @throws Throws an error when it cannot stringify the value
     */
    setSync(key: string, value: safeValue, cache?: boolean): this;

    /**
     * Asyncronously sets the value of a key to the database
     * @async
     * @param {string} key The key to set
     * @param {safeValue} value The key to set
     * @param {boolean} cache Cache the set value
     * @returns {Promise<this>}
     * @throws Rejects when it cannot stringify the value
     */
    set(
      key: string,
      value: safeValue,
      cache?: boolean
    ): Promise<this>;

    /**
     * Syncronously deletes a key from the database
     * @param {string} key The key to delete
     * @returns {boolean} true, but false if they key didn't exist
     */
    deleteSync(key: string): boolean;

    /**
     * Asyncronously deletes a key from the database
     * @async
     * @param {string} key The key to delete
     * @returns {Promise<boolean>} true, but false if they key didn't exist
     */
    delete(key: string): Promise<boolean>;

    /**
     * Syncronously retrieves all keys from the database
     * @returns {string[]}
     */
    keysSync(): string[];

    /**
     * Asyncronously retrieves all keys from the database
     * @async
     * @returns {Promise<string[]>}
     */
    keys(): Promise<string[]>;

    // Dynamic Functionality - not builtin

    /**
     * Syncronously gets all key/value pairs from the database
     * @param {boolean} force Force an API request
     * @param {boolean} cache Cache the returned value
     * @returns {Array<[string, safeValue]>}
     * @throws Throws an error when it encounters invalid JSON
     */
    entriesSync(
      force?: boolean,
      cache?: boolean
    ): Array<[string, safeValue]>;

    /**
     * Asyncronously gets all key/value pairs from the database
     * @async
     * @param {boolean} force Force an API request
     * @param {boolean} cache Cache the returned value
     * @returns {Promise<Array<[string, safeValue]>>}
     * @throws Throws an error when it encounters invalid JSON
     */
    entries(
      force?: boolean,
      cache?: boolean
    ): Promise<Array<[string, safeValue]>>;

    /**
     * Syncronously gets all values from the database
     * @param {boolean} force Force an API request
     * @param {boolean} cache Cache the returned value
     * @returns {safeValue[]}
     * @throws Throws an error when it encounters invalid JSON
     */
    valuesSync(
      force?: boolean,
      cache?: boolean
    ): safeValue[];

    /**
     * Asyncronously gets all values from the database
     * @async
     * @param {boolean} force Force an API request
     * @param {boolean} cache Cache the returned value
     * @returns {Promise<safeValue[]>}
     * @throws Throws an error when it encounters invalid JSON
     */
    values(
      force?: boolean,
      cache?: boolean
    ): Promise<safeValue[]>;

    /**
     * Run a function on each key/value of the database
     * @param fn The function to run on each value
     * @param thisArg The value to use for the "this" variable
     * @param force Force API request(s) to update the cache
     * @param cache Cache any downloaded values
     * @returns {this}
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map/forEach}
     */
    forEach(fn: forEachFunction, thisArg: any, force?: boolean, cache?: boolean): this;

    /**
     * Syncronously check if a key exists
     * @param key The key to check for
     * @param force Force an API request
     * @param cache Cache any downloaded values
     * @returns {boolean}
     */
    hasSync(key: string, force?: boolean, cache?: boolean): boolean;

    /**
     * Asyncronously check if a key exists
     * @async
     * @param key The key to check for
     * @param force Force an API request
     * @param cache Cache any downloaded values
     * @returns {Promise<boolean>}
     */
    has(key: string, force?: boolean, cache?: boolean): boolean;

    /**
     * Syncronously clear the database
     * @returns {this}
     */
    clearSync(): this;

    /**
     * Asyncronously check if a key exists
     * @async
     * @returns {Promise<this>}
     */
    clear(): Promise<this>;

    /**
     * Get the size of the database
     * @returns {number}
     */
    size: number;

    /**
     * Downloads the database to the cache
     * @param {filterFunction} - A filter that decides whether or not to cache the value
     * @returns {this}
     */
    downloadSync(condition?: filterFunction): this;

    /**
     * Asyncronously downloads the database to the cache
     * @async
     * @param {filterFunction} - A filter that decides whether or not to cache the value
     * @returns {Promise<this>}
     */
    download(condition?: filterFunction): Promise<this>;

    /**
     * Download and convert the database to a Map
     * @returns {Map<string, safeValue>}
     */
    toMap(): Map<string, safeValue>

    api: API<this>
  }
}




declare module "repldb/sync" {
  /**
   * @module repldb/sync
   */
  import EventEmitter from 'events';


  /**
   * A safe value that can be stored in JSON format
   * @typedef {(undefined | null | string | number | safeValue[] | {[key: string]: safeValue})} safeValue
   */
  type safeValue =
    | null
    | string
    | number
    | safeValue[]
    | { [key: string]: safeValue };

  /**
   * A function that takes a key, value, and/or index
   * @typedef {((key?: string, value?: safeValue, index?: number) => void)} forEachFunction
   */
  type forEachFunction = (key?: string, value?: safeValue, index?: number) => void;

  /**
   * A function that takes a key, value and/or index and returns a boolean
   * @typedef {((key?: string, value?: safeValue, index?: number) => boolean)} filterFunction
   */
  type filterFunction = (key?: string, value?: safeValue, index?: number) => boolean;

  interface SyncAPI<db> {
    get(key: string, force: boolean | undefined, cache: boolean): string,
    set(key: string, value: safeValue, cache: boolean): void,
    keys(): string[],
    delete(key: string): boolean,
    client: db
  }

  /**
   * Options used to create a repldb instance
   * @typedef {object} repldbOptions
   * @param {string} [customURL=process.env.REPLIT_DB_URL] - The custom URL to use - leave blank if you are the owner of the repl
   * @param {boolean} [doCache=true] - Save the downloaded values in a cache for faster access
   */
  interface repldbOptions {
    doCache?: boolean,
    customURL?: string
  }

  export class repldbSync {
    /**
     * A sync repldb instance to interact with a Repl's Database
     * @param {string} [customURL=process.env.REPLIT_DB_URL] - The custom URL to use - leave blank if you are the owner of the repl
     * @param {boolean} [doCache=true] - Save the downloaded values in a cache for faster access
     */
    constructor(doCache?: boolean, customURL?: string);

    // Cache

    /**
     *  The map of cached raw values that have been downloaded
     *  @see doCache
     *  @type {Map<string, string>}
     */
    cache: Map<string, string>;
    /**
     * Controls whether or not to use the cache
     * @see cache
     * @type {boolean}
     */
    doCache: boolean;

    // Events

    /**
     * The event emitter used to broadcast events
     * @type {EventEmitter}
     * @requires events
     */
    events: EventEmitter;
    /**
     * Used to start listening for events
     * @see events
     */
    on: EventEmitter.on;
    /**
     * Used to stop listening for events
     * @see events
     */
    off: EventEmitter.on;
    /**
     * Used to listen for an event once
     * @see events
     */
    once: EventEmitter.on;

    // Base functionality

    /**
     * Syncronously gets the value of a key from the database
     * @param {string} key The key to look up
     * @param {boolean} force Force an API request
     * @param {boolean} cache Cache the returned value
     * @param {boolean} raw Return the unparsed value
     * @returns {safeValue | string}
     * @throws Throws an error when it encounters invalid JSON
     */
    get(
      key: string,
      force?: boolean,
      cache?: boolean,
      raw?: boolean
    ): safeValue | string;

    /**
     * Syncronously sets the value of a key to the database
     * @param {string} key The key to set
     * @param {safeValue} value The key to set
     * @param {boolean} cache Cache the set value
     * @returns {this}
     * @throws Throws an error when it cannot stringify the value
     */
    set(key: string, value: safeValue, cache?: boolean): this;

    /**
     * Syncronously deletes a key from the database
     * @param {string} key The key to delete
     * @returns {boolean} true, but false if they key didn't exist
     */
    delete(key: string): this;

    /**
     * Syncronously retrieves all keys from the database
     * @returns {string[]}
     */
    keys(): string[];

    // Dynamic Functionality - not builtin

    /**
     * Syncronously gets all key/value pairs from the database
     * @param {boolean} force Force an API request
     * @param {boolean} cache Cache the returned value
     * @returns {Array<[string, safeValue]>}
     * @throws Throws an error when it encounters invalid JSON
     */
    entries(
      force?: boolean,
      cache?: boolean
    ): Array<[string, safeValue]>;

    /**
     * Syncronously gets all values from the database
     * @param {boolean} force Force an API request
     * @param {boolean} cache Cache the returned value
     * @returns {safeValue[]}
     * @throws Throws an error when it encounters invalid JSON
     */
    values(
      force?: boolean,
      cache?: boolean
    ): safeValue[];

    /**
     * Run a function on each key/value of the database
     * @param fn The function to run on each value
     * @param thisArg The value to use for the "this" variable
     * @param force Force API request(s) to update the cache
     * @param cache Cache any downloaded values
     * @returns {this}
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map/forEach}
     */
    forEach(fn: forEachFunction, thisArg: any, force: boolean, cache: boolean): this;

    /**
     * Syncronously check if a key exists
     * @param key The key to check for
     * @param force Force an API request
     * @param cache Cache any downloaded values
     * @returns {boolean}
     */
    has(key: string, force: boolean, cache: boolean): boolean;

    /**
     * Syncronously clear the database
     * @returns {this}
     */
    clear(): this;

    /**
     * Get the size of the database
     * @returns {number}
     */
    size: number;

    /**
     * Downloads the database to the cache
     * @param {filterFunction} - A filter that decides whether or not to cache the value
     * @returns {this}
     */
    download(condition?: filterFunction): this;

    /**
     * Download and convert the database to a Map
     * @returns {Map<string, safeValue>}
     */
    toMap(): Map<string, safeValue>

    api: SyncAPI<this>
  }
}