const REPLIT_DB_URL = `https://kv.replit.com/v0/eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE2MTY2NjEyMjgsImlhdCI6MTYxNjU0OTYyOCwiaXNzIjoiY29ubWFuIiwiZGF0YWJhc2VfaWQiOiJlNWFhNGZlYi0zMmZjLTRiYjEtYjY0ZS0xMGJjZTU2MjQyNTEifQ._HENexM5G-xv7n6Ziwk21HBXa3sZMnWmo9HKFi-UMRGAm3Q7boBK396FO8qqshz8Zy45-ekA5Th6rnpZKHOAfA`
const dbClient = require('repldb');
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

log(db.getSync('hello')); // Shoudn't error, even if undefined

db.setSync('hello', 'test');

log(db.getSync('hello')); // test

db.setSync('testing', 'correct');
db.setSync('foo', 'oof');

log(db.keysSync()); // Lists all keys [foo, hello, testing]

db.forEach((key, value) => {
  console.log(key + ': ' + value);
});

log(db.deleteSync('hello')); // true
log(db.getSync('hello')); // undefined
