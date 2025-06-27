/* eslint-disable */
import { expect } from 'chai';
import redisClient from '../utils/redis.js';
import sinon from 'sinon';

describe('RedisClient', () => {
  let redisClient;
  let mockRedis;

  beforeEach(() => {
    // Create mock Redis client
    mockRedis = {
      connected: true,
      on: sinon.stub(),
      get: sinon.stub(),
      set: sinon.stub(),
      del: sinon.stub(),
      quit: sinon.stub()
    };

    // Stub redis.createClient to return our mock
    sinon.stub(redis, 'createClient').returns(mockRedis);
    redisClient = new RedisClient();
    mockRedis.connected = true;

  });

  afterEach(() => {
    sinon.restore();
  });

  describe('#isAlive', () => {
    it('should return true when Redis is connected', () => {
      mockRedis.connected = true;
      expect(redisClient.isAlive()).to.be.true;
    });

    it('should return false when Redis is disconnected', () => {
      mockRedis.connected = false;
      expect(redisClient.isAlive()).to.be.false;
    });
  });

  describe('#get', () => {
    it('should return value for existing key', async () => {
      mockRedis.get.withArgs('validKey').yields(null, 'testValue');
      const value = await redisClient.get('validKey');
      expect(value).to.equal('testValue');
    });

    it('should return null for non-existent key', async () => {
      mockRedis.get.yields(null, null);
      const value = await redisClient.get('nonexistent');
      expect(value).to.be.null;
    });

    it('should throw error when Redis fails', async () => {
      mockRedis.get.yields(new Error('Redis error'));
      try {
        await redisClient.get('anyKey');
        throw new Error('Should have thrown');
      } catch (err) {
        expect(err).to.be.an('error');
      }
    });
  });

  describe('#set', () => {
    it('should set key-value pair with expiration', async () => {
      mockRedis.set.withArgs('key', 'value', 'EX', 3600).yields(null, 'OK');
      const result = await redisClient.set('key', 'value', 3600);
      expect(result).to.equal('OK');
    });

    it('should set key-value without expiration when not specified', async () => {
      mockRedis.set.withArgs('key', 'value').yields(null, 'OK');
      const result = await redisClient.set('key', 'value');
      expect(result).to.equal('OK');
    });

    it('should handle set errors', async () => {
      mockRedis.set.yields(new Error('Redis error'));
      try {
        await redisClient.set('key', 'value');
        throw new Error('Should have thrown');
      } catch (err) {
        expect(err).to.be.an('error');
      }
    });
  });

  describe('#del', () => {
    it('should delete existing key', async () => {
      mockRedis.del.withArgs('key').yields(null, 1);
      const result = await redisClient.del('key');
      expect(result).to.equal(1);
    });

    it('should return 0 for non-existent key', async () => {
      mockRedis.del.yields(null, 0);
      const result = await redisClient.del('nonexistent');
      expect(result).to.equal(0);
    });

    it('should handle delete errors', async () => {
      mockRedis.del.yields(new Error('Redis error'));
      try {
        await redisClient.del('key');
        throw new Error('Should have thrown');
      } catch (err) {
        expect(err).to.be.an('error');
      }
    });
  });
});