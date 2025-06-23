import { createClient } from 'redis';

class RedisClient {
  constructor() {
    this.client = createClient();
    this.isReady = true;
    this.client.on('error', (err) => {
      console.log(err);
      this.isReady = false;
    });
    this.client.on('connect', () => {
      this.isClientConnected = true;
    });
  }

  isAlive() {
    try {
      return this.client.status === 'ready';
    } catch (error) {
      return false;
    }
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
