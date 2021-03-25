const execSync = require('child_process').execSync;
const exec = require('child_process').exec;
const emitter = require('events');
try {
  var syncFetch = require('sync-fetch')
} catch (err) {
  var syncFetch = null;
}


class repldb {
  constructor(customURL, doCache = true) {
    this.cache = new Map();
    this.api.client = this;
    this.doCache = doCache;

    if (customURL) {
      if (customURL.endsWith('/')) customURL = customURL.substring(0, customURL.length - 2);
      this.url = customURL;
    } else if (process.env.REPLIT_DB_URL) {
      this.url = process.env.REPLIT_DB_URL;
    } else {
      // Replit processes always have the DB env set
      throw new Error('No database URL set! Either run in a replit (that you own), or enter a custom URL.');
    }

  }

  // Events

  events = new emitter();

  on = this.events.on;

  off = this.events.off;

  // Base functionality

  // Get a value from a key
  getSync(key, force = false, cache = this.doCache, raw = false) {
    check({
      key: [key, 'string'],
      force: [force, 'boolean'],
      raw: [raw, 'boolean'],
      cache: [cache, 'boolean']
    });
    let value = this.api.getSync(key, force, cache);

    if (raw) {
      return value;
    } else {
      try {
        if (value === null) return null;
        if (value === undefined || value === '') return;
        return JSON.parse(value);
      } catch (err) {
        throw new Error(`Unable to parse value of "${key}":\n${err}`);
      }
    }
  }

  async get(key, force = false, cache = this.doCache, raw = false) {
    check({
      key: [key, 'string'],
      force: [force, 'boolean'],
      raw: [raw, 'boolean'],
      cache: [cache, 'boolean']
    });
    let value = await this.api.get(key, force, cache);

    if (raw) {
      return value;
    } else {
      try {
        if (value === null) return null;
        if (value === undefined || value === '') return;
        return JSON.parse(value);
      } catch (err) {
        throw new Error(`Unable to parse value of "${key}":\n${err}`);
      }
    }
  }

  // Set a key to a value
  setSync(key, value, cache = this.doCache) {
    check({
      key: [key, 'string'],
      cache: [cache, 'boolean']
    });
    var safeValue;

    try {
      safeValue = JSON.stringify(value);
    } catch (err) {
      throw new Error(`Unable to stringify value of "${key}":\n${err}`);
    }
    this.api.setSync(key, safeValue, cache);

    return this;
  }

  async set(key, value, cache = this.doCache) {
    check({
      key: [key, 'string'],
      cache: [cache, 'boolean']
    });
    var safeValue;

    try {
      safeValue = JSON.stringify(value);
    } catch (err) {
      throw new Error(`Unable to stringify value of "${key}":\n${err}`);
    }
    await this.api.set(key, safeValue, cache);

    return this;
  }

  // Remove a value from a key
  deleteSync(key) {
    check({
      key: [key, 'string']
    });

    return this.api.deleteSync(key)
  }

  async delete(key) {
    check({
      key: [key, 'string']
    });

    return await this.api.delete(key)
  }

  // Get all keys that have values
  keysSync() {
    return this.api.keysSync();
  }

  async keys() {
    return await this.api.keys();
  }

  // Dynamic functionality
  // These don't use the base API, or
  // rely on other functions

  // Get all entries in [key, value] pairs
  entriesSync(force = true, cache = this.doCache) {
    check({
      force: [force, 'boolean'],
      cache: [cache, 'boolean']
    });
    let entries = []

    this.keysSync().forEach((key) => {
      let value = this.getSync(key, force);
      entries.push([key, value]);
      if (cache) this.cache.set(key, value);
    });

    return entries;
  }

  async entries(force = true, cache = this.doCache) {
    check({
      force: [force, 'boolean'],
      cache: [cache, 'boolean']
    });
    let entries = []

    (await this.keys()).forEach((key) => {
      let value = this.getSync(key, force);
      entries.push([key, value]);
      if (cache) this.cache.set(key, value);
    });

    return entries;
  }

  // Get all values
  valuesSync(force = true, cache = this.doCache) {
    check({
      force: [force, 'boolean'],
      cache: [cache, 'boolean']
    });
    let values = []

    this.keysSync().forEach((key) => {
      let value = this.getSync(key, force);
      values.push(value);
      if (cache) this.cache.set(key, value);
    });

    return values;
  }

  async values(force = true, cache = this.doCache) {
    check({
      force: [force, 'boolean'],
      cache: [cache, 'boolean']
    });
    let values = []

    (await this.keys()).forEach((key) => {
      let value = this.getSync(key, force);
      values.push(value);
      if (cache) this.cache.set(key, value);
    });

    return values;
  }

  // Run a function on every entry
  forEach(fn, thisArg, force = false, cache = this.doCache) {
    check({
      fn: [fn, 'function'],
      force: [force, 'boolean'],
      cache: [cache, 'boolean']
    });

    this.keysSync().forEach((key, index) => {
      let value = this.getSync(key, force);
      if (cache && force) this.cache.set(key, value);
      fn.call(thisArg, key, value, index);
    });

    return this;
  }

  // Check if a key exists
  hasSync(key, force, cache) {
    return !!(this.getSync(key, force, cache));
  }

  async has(key, force, cache) {
    return !!(await this.get(key, force, cache));
  }

  // Delete all keys
  clearSync() {
    this.keysSync().forEach((key) => {
      this.deleteSync(key);
    });

    this.cache.clear();

    return this;
  }

  async clear() {
    (await this.keys()).forEach((key) => {
      this.deleteSync(key);
    });

    this.cache.clear();

    return this;
  }

  // Get how many keys have been set
  get size() {
    return this.keysSync(true).length;
  }

  // Download all values to the cache
  downloadSync(condition = returnTrue) {
    this.doCache = true;
    this.keysSync().forEach((key) => {
      let value = this.getSync(key, true);
      if (condition(key, value)) this.cache.set(key, value);
    });

    return this;
  }

  async download(condition = returnTrue) {
    this.doCache = true;
    (await this.keys()).forEach((key, index) => {
      let value = this.getSync(key, true);
      if (condition(key, value, index)) this.cache.set(key, value);
    });

    return this;
  }

  toMap() {
    return new Map([...this.entriesSync(true)]);
  }

  // API functions
  // These deal directly with the server
  api = {
    "getSync": function getSync(key, force, cache) {
      let value;
      if (force || !this.client.cache.has(key)) {
        value = fetchSync(`${this.client.url}/${key}`);
        if (cache) this.client.cache.set(key, value);
        this.client.events.emit('download', key, value);
        return value;
      } else {
        return this.client.cache.get(key);
      }
    },
    "setSync": function setSync(key, value, cache) {
      let url = this.client.url;

      postSync(url, `${encodeURIComponent(key)}=${encodeURIComponent(value)}`);
      if (cache) this.client.cache.set(key, value);
      this.client.events.emit('upload', key, value);
    },
    "keysSync": function keysSync() {
      let keys = fetchSync(`${this.client.url}?encode=true&prefix`);

      return decodeURIComponent(keys).split('\n');
    },
    "deleteSync": function delSync(key) {
        if (this.getSync(key, true)) {
          removeSync(`${this.client.url}/${key}`);
          this.client.events.emit('delete', key);
          this.client.cache.delete(key);
          return true;
        } else return false;
    },
    "get": async function get(key, force, cache) {
      if (force || !this.client.cache.has(key)) {
        return await fetch(`${this.client.url}/${key}`).then((value) => {
          if (cache) this.client.cache.set(key, value);
          this.client.events.emit('download', key, value);
          return value;
        })
      } else {
        return this.client.cache.get(key);
      }
    },
    "set": async function set(key, value, cache) {
      post(this.client.url, `${encodeURIComponent(key)}=${encodeURIComponent(value)}`).then(() => {
        if (cache) this.client.cache.set(key, value);
        this.client.events.emit('upload', key, value);
        return;
      })
    },
    "keys": async function keys() {
      return await fetch(`${this.client.url}?encode=true&prefix`).then((keys) => {
        return decodeURIComponent(keys).split('\n');
      });
    },
    "delete": async function del(key) {
      if (await this.get(key, true)) {
        await remove(`${this.client.url}/${key}`);
        this.client.events.emit('delete', key);
        this.client.cache.delete(key);
        return true;
      } else return false;
    }
  }
}

module.exports = repldb;

// This is for checking each value to ensure it
// is of the correct type.
function check(input) {
  Object.entries(input).forEach(([name, [value, type]]) => {
    if (typeof value !== type.toLowerCase())
      throw new TypeError(`Argument ${name} must be a ${type} - it was a ${typeof value} instead.`)
  });
};

// HTTP functions
function postSync(url, content) {
  if (syncFetch) {
    return syncFetch(url, {
      body: content,
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      }
    }).text();
  }
  return execSync(`curl "${prep(url)}" --silent -d "${content}"`).toString();
}

function fetchSync(url) {
  if (syncFetch) {
    return syncFetch(url).text();
  }
  return execSync(`curl "${prep(url)}" --silent`).toString();
}

function removeSync(url) {
  if (syncFetch) {
    return syncFetch(url, {
      method: "DELETE"
    }).text();
  }
  return execSync(`curl -XDELETE "${prep(url)}" --silent`).toString();
}

// Async HTTP functions
async function post(url, content) {
  if (syncFetch) {
    return syncFetch(url, {
      body: content,
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      }
    }).text();
  }
  let value = await exec(`curl "${prep(url)}" --silent -d "${content}"`);
  return value.toString();
}
async function fetch(url) {
  if (syncFetch) {
    return syncFetch(url).text();
  }
  let value = await exec(`curl "${prep(url)}" --silent`);
  return value.toString();
}
async function remove(url) {
  if (syncFetch) {
    return syncFetch(url, {
      method: "DELETE"
    }).text();
  }
  let value = await exec(`curl -XDELETE "${prep(url)}" --silent`);
  return value.toString();
}

function prep(str) {
  let arr = str.split('');
  arr.forEach((char, index) => {
    if (char === `"`) arr[index] = `\\"`
  });
  return arr.join('');
}

function returnTrue() {
  return true;
}