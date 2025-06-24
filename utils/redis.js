import { createClient } from 'redis';
import { promisify } from 'util';

class RedisClient {
  constructor() {
    this.client = createClient();
    this.isConnected = true;

    this.client.on('connect', () => {
      this.isConnected = true;
    });

    this.client.on('error', (err) => {
      console.log('Redis Client Error', err);
      this.isConnected = false;
    });
  }

  isAlive() {
    return this.isConnected;
  }

  async get(key) {
    // const value = await this.client.get(key);
    // return value;
    const getAsync = promisify(this.client.get).bind(this.client)
    const value = getAsync(key);
    return value
  }

  async set(key, value, duration) {
    // await this.client.set(key, value);
    // await this.client.expire(key, duration);
    const setexAsync = promisify(this.client.setex).bind(this.client);
      await setexAsync(key, duration, value)
  }

  async del(key) {
    // await this.client.del(key);
    const delAsync = promisify(this.client.del).bind(this.client)
    await delAsync(key);
  }
}
const redisClient = new RedisClient();
export default redisClient;
