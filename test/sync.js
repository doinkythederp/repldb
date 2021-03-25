const REPLIT_DB_URL = `https://kv.replit.com/v0/eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE2MTY2NjEyMjgsImlhdCI6MTYxNjU0OTYyOCwiaXNzIjoiY29ubWFuIiwiZGF0YWJhc2VfaWQiOiJlNWFhNGZlYi0zMmZjLTRiYjEtYjY0ZS0xMGJjZTU2MjQyNTEifQ._HENexM5G-xv7n6Ziwk21HBXa3sZMnWmo9HKFi-UMRGAm3Q7boBK396FO8qqshz8Zy45-ekA5Th6rnpZKHOAfA`
const dbClient = require('repldb/sync');
const db = new dbClient(REPLIT_DB_URL);
const log = (v) => {
  console.log('---------------');
  console.log(v);
  console.log('---------------')
};

/*
const curl = (url, opt = []) => {
  return require('child_process').execSync(`curl --silent${opt?' ':''}${opt.join(' ')} ${url}`);
}
*/

log(db.get('hello')); // Shoudn't error, even if undefined

db.set('hello', 'test');

log(db.get('hello')); // test

db.set('testing', 'correct');
db.set('foo', 'oof');

log(db.keys()); // Lists all keys [foo, hello, testing]

db.forEach((key, value) => {
  console.log(key + ': ' + value);
});

log(db.delete('hello')); // true
log(db.get('hello')); // undefined
