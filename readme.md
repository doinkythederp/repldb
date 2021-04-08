##### | [Github Repo](https://github.com/doinkythederp/repldb) | [NPM](https://www.npmjs.com/package/repldb) |
# Replit Database Client
Repldb is a **sync/async** client for the [Replit Database](https://docs.replit.com/misc/database). If you are looking for an official client, check out this: [@replit/database](https://www.npmjs.com/package/@replit/database)

The Replit Database is a key-value storage system built into every [Replit](https://replit.com) repl. It can be used to store data more privately than say, a database directly in the repl's files (By default files are public).

## Table of contents

- [Getting a URL](#getting-a-url)
- [Disclaimer](#disclaimer) # Read Me
- [Installation](#install)
- [Example](#example)
- [Info](#info)
  - [Sync and Async](#sync-and-async)
  - [Caching](#caching)
- [Documentation](#documentation)
  - [repldb **Class**](#repldb-class)
  - [safeValue **Any**](#safevalue-any)

## Geting a URL
As the database is HTTP-based, you need a URL for it to connect to. *If you are running this module inside a repl, you don't have to worry about this section, and can initiate the database without a URL.*

Otherwise, you need to [open](https://replit.com/repls)/[create](https://replit.com/new/nodejs) a repl, click "Shell" (at the top of the large black window), and run the following command:

`echo $REPLIT_DB_URL`

You can then use the output to access your database outside of Replit. 

**Keep your URL private - it gives full access to all of the data you've put in it.**
##### Note that the URL will change every so often.

## Disclaimer

As this is a very new package, there may be bug fixes required for it to work properly. It's not guaranteed to be completely stable.
## Install
Run the following command:

`npm i repldb`

Then, to import it:
```js
const repldb = require('repldb');
```
The exported item is the database client.
## Example
```javascript
const Repldb = require('replit.db');
const db = new Repldb(`https://kv.replit.com/v0/abcdefg12345678ThisIsNotARealURL`);
// Example is not a repl, so we need the URL

db.download(); // Download the database for faster operations
db.setSync('connected', true);
db.getSync('connected'); // true

db.setSync('restarts', 1)

process.exit() // After restarting, we'll have our program skip to where it left off

db.getSync('connected'); // Still true
db.getSync('restarts') // 1
db.deleteSync('restarts') // true
```
## Info
Links refering to the below topics will appear in the documentation to signal that they are relevant.
### Sync and Async
Some functions have [async](https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Asynchronous) support, such as [`repldb.set`](#set-mehtod-async-cache). You can run these function in sync mode instead appending "Sync" to the function name:

`set` => `setSync`

If you want the functions to always run in sync mode (as in, without the "Sync" suffix), use the following require statement:
```js
require('repldb/sync');
```
___
### Caching
The module caches (stores) the values of keys when they are set or retrieved from the database for an overall faster experience. However, this means that if the database if modified externally (not by the same client), the cache will be storing an old version of the key/value pair. Therefore, it is recommended to update the cache frequently through one of the following:
- Use the [`repldb.download`](#download-method-async-cache) method
- Turn off the cache:

  `repldb.doCache = false`
- Force an API request when fetching key/value pairs:

  `repldb.get('key', true)`
___
### Dependencies
repldb has an *optional* dependency of [`sync-fetch`](https://www.npmjs.com/package/sync-fetch). If `sync-fetch` isn't installed, it will fall back and attempt to use your terminal's `curl` command.
___
## Documentation
When requiring the module, the `repldb` class will be returned. It can be used to access a database and edit it.
### `repldb` **Class**
**Constructor:**
```js
new repldb()
```
| [Properties](#properties) | [Methods](#asyncsync-methods) | [Sync-only Methods](#sync-methods) | [Events](#events) |
|------------|---------|-------------------|--------|
| [cache](#cache-property-map) | [get](#get-method-async-cache) | [forEach](#foreach-method-cache) | [download](#download-event) |
| [size](#size-property-number) | [set](#set-method-async-cache) | [toMap](#tomap-method) | [upload](#upload-event) |
| [doCache](#docache-property-boolean) | [delete](#delete-method-async-cache) |||
|| [keys](#keys-method-async) |||
|| [entries](#entries-method-async-cache) |||
|| [values](#values-method-async-cache) |||
|| [has](#has-method-async-cache) |||
|| [clear](#clear-method-async-cache) |||
|| [download](#download-method-async-cache) |||
___
#### **Properties**
___
#### `.cache` **Property** (**Map**)
The cache - used to store values so that they don't need to be redownloaded.
___
#### `.size` **Property** (**Number**)
The number of keys in the database
___
#### `.doCache` **Property** (**Boolean**)
Controls default caching behavior
___
#### **Async/Sync Methods**
___
#### `.get` **Method** ([**Async**](#sync-and-async), [**Cache**](#caching))
Usage: `get(key, force = false, cache = this.doCache, raw = false)`

Retrieve an item from a key in the database.

Returns the value of the key retrieved

* `key` **String** : The key of the item to retrieve
* `force` **Boolean** : Skip the cache check and force an API request
* `cache` **Boolean** : Save the result to the cache
* `raw` **Boolean** : Return the raw JSON response for debugging
```javascript
const db = new Repldb();

// Async

db.get('users').then((users) => {
  if (users.includes("Phil")) console.log('Phil is registered!');
});

// Sync

let users = db.getSync('users');
if (users.includes("Phil")) console.log('Phil is registered!');
```
___
#### `.set` **Method** ([**Async**](#sync-and-async), [**Cache**](#caching))
Usage: `set(key, value, cache = this.doCache)`

Set an item to a key in the database

Returns the repldb
* `key` **String** : The key to store the value in
* `value` **[SafeValue](#safevalue-any)** : The value to store
* `cache` **Boolean** : Cache the updated value
```js
const db = new Repldb();

// Async

myWebsite.on('connection', () => {
  db.get('visits').then( async (visits) => {
    ++visits;
    console.log(`${visits} visits.`);
    await db.set('visits', visits);
  });
});

// Sync

myWebsite.on('connection', () => {
  let visits = db.getSync('visits').
  ++visits;
  console.log(`${visits} visits.`);
  db.setSync('visits', visits);
});
```
______
#### `.delete` **Method** ([**Async**](#sync-and-async), [**Cache**](#caching))
Usage: `delete(key)`

Delete a key/value pair from the database

Returns `true` if the value existed, and `false` if it didn't
- `key` **String** : The key to delete
```js
const db = new Repldb();

// Async

db.get('user-123456').then( async (user) => {
  if (user.username === "Phil") {
    console.log('Goodbye, Phil!');
    await db.delete('user-123456');
  }
});

// Sync

let user = db.getSync('user-123456');
if (user.username === "Phil") {
  console.log('Goodbye, Phil!');
  db.deleteSync('user-123456');
}
```
___
#### `.keys` **Method** ([**Async**](#sync-and-async))
Usage: `keys()`

Returns an array of every key in the database
```js
repldb.keysSync() // e.g. ["hello", "foo", "keyNumberThree"]
```
___
#### `.entries` **Method** ([**Async**](#sync-and-async), [**Cache**](#caching))
Usage: `entries(force = true, cache = this.doCache)`

Returns an array of every key/value pair in the database
- `force` **Boolean** : Skip the cache and make an API request
- `cache` **Boolean** : Cache any updated values
```js
repldb.entriesSync() // e.g. [["hello", "hey"], ["foo", "oof"], ["keyNumberThree", 3]]
```
___
#### `.values` **Method** ([**Async**](#sync-and-async), [**Cache**](#caching))
Usage: `entries(force = true, cache = this.doCache)`

Returns an array of every value in the database, without their respective key
- `force` **Boolean** : Skip the cache and make an API request
- `cache` **Boolean** : Cache any updated values
```js
repldb.valuesSync() // e.g. ["hey", "oof", 3]
```
___
#### `.has` **Method** ([**Async**](#sync-and-async), [**Cache**](#caching))
Usage: `has(key, force = true, cache = this.doCache)`

Returns a Boolean value indicating whether the key provided exists in the database
- `key` **String** : The key to search for
- `force` **Boolean** : Skip the cache and make an API request
- `cache` **Boolean** : Cache any updated values
```js
if (!repldb.hasSync('Phil')) throw new ReferenceError("Could not find Phil!");
```
___
#### `.clear` **Method** ([**Async**](#sync-and-async), [**Cache**](#caching))
Usage: `clear()`

Deletes every key/value pair from the database, permanently

Returns the repldb
```js
// Say we have a lot of useless keys and we want a fresh start
replitdb.clear().then(() => {
  /* Do something with your new cleaned-out database */
});
```
___
#### `.download` **Method** ([**Async**](#sync-and-async), [**Cache**](#caching))
Usage: `download(condition = () => true)`

Downloads and caches the portion of the database the meets the conditions, for faster key access

The following arguments are supplied to the condition:
1. `key` **String** : The key of this key/value pair
2. `value` **Any** : The value of this key/value pair
3. `index` **Number** : The index of this key/value pair

Returns the repldb.
- `condition` **Function** : The condition to run on each key before storing in the cache
```js
const repldb = new repldb();
replbdb.downloadSync();

repldb.getSync('hello'); // The value for this key is likely already known, so it can be accessed faster.

repldb.getSync('hello', true); // Skipping the cache makes accessing keys slower, but can have its benefits.
```
___
#### **Sync Methods**
___
#### `.forEach` **Method** ([**Cache**](#caching))
Usage: `forEach(callback, thisArg, force = false, cache = this.doCache)`

Runs a function for each item with the following arguments as input:
1. `key` **String** : The key of the key/value pair
2. `value` **Any** : The value of the key/value pair
3. `index` **Number** : The index of this key/value pair

Returns the repldb.
- `callback` **Function** : The function to run on each item
- `thisArg` **Any** : The value of the "this" variable
- `force` **Boolean** : Download all keys from the API instead of relying on the cache
- `cache` **Boolean** : Cache any new values
```js
let users = 0;
repldb.forEach((key) => {
  if (key.startsWith('user-')) ++users;
});

console.log(users);
```
___
#### `.toMap` **Method**
Usage: `toMap()`

Downloads the database and converts it to a map. Skips any caching functions - see [download](#download-method-async-cache) if you would like to cache the database.

Returns a Map containing the values of the database
___
#### **Events**
Listeners can be added/removed with the `repldb.events.on`/`.off` method (or their aliases `repldb.on`/`.off`) See [Events](https://nodejs.org/api/events.html) for more info.
___
#### `download` **Event**
Sent when content is downloaded from the database
- `key` **String** : The key downloaded
- `value` **String** : The raw JSON value downloaded
```js
repldb.on('download', (key) => {
  console.log(key + ' was downloaded.');
});
```
___
#### `upload` **Event**
Sent when content is uploaded to the database (when keys are set)
- `key` **String** : The key uploaded
- `value` **String** : The raw JSON value uploaded
___
### `safeValue` **Any**
One of several types that can be stored in JSON format.
See [JSON.parse](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/parse) and [JSON.stringify](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify).
```js
// Safe objects can be stringified, then parsed, and stay the same
function isOK(input) {
  let parsed = JSON.parse(JSON.stringify(input));
  return (input === parsed);
}

isOK(Buffer.from('hello')) // false
isOK([1, 2, "three"]) // true

let circular = {
  a: 1,
  b: 2
}
circular.c = circular;

isOK(circular) // TypeError: Converting circular structure to JSON
```
___
## Version History

* 1.0.0 - Release
* 1.0.1 - General readme.md fixes
* 1.0.2 - Fixed `repldb.prototype.download()` not storing raw data, and therefore fixed data being parsed twice

##### | [Back to Top](#replit-database-client) | [Github Repo](https://github.com/doinkythederp/repldb) | [NPM](https://www.npmjs.com/package/repldb) |
