/* eslint-disable */
import { expect } from 'chai';
import dbClient from '../utils/db.js';

describe('dBClient', () => {
  describe('#isAlive', () => {
    it('should return true when connected', () => {
      expect(dbClient.isAlive()).to.be.true;
    });
  });

  describe('#nbUsers', () => {
    it('should return number of users', async () => {
      const count = await dbClient.nbUsers();
      expect(count).to.be.a('number');
    });
  });
});
