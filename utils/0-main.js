import redisClient from './redis.js';

(async () => {
  console.log(redisClient.isAlive());
})();
