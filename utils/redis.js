import { createClient } from 'redis';

class RedisClient {
  constructor() {
    this.client = createClient()
      .on('error', (err) => console.log(err))
      .connect();
  }

  isAlive() {
    const status = this.client.isReady;
    return status;
  }

  async get(key) {
    const value = await this.client.get(key);
    return value;
  }

  async set(key, value, duration) {
    await this.client.set(key, value);
    await this.client.expire(key, duration);
  }

  async del(key) {
    await this.client.del(key);
  }
}
const redisClient = new RedisClient();
export default redisClient;
