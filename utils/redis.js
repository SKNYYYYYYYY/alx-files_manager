import { createClient } from 'redis';

class RedisClient {
  constructor() {
    this.client = createClient();
    this.isConnected = true;

    this.client.on('connect', () => {
      this.isReady = true;
    });

    this.client.on('error', (err) => {
      console.log('Redis Client Error', err);
      this.isReady = false;
    });
    this.client.connect();
  }

  isAlive() {
    return this.isReady;
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
