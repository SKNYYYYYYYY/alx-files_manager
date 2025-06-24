/* eslint-disable import/extensions */
import asyncHandler from 'express-async-handler';
import redisClient from '../../utils/redis.js';
import dbClient from '../../utils/db.js';

export const getStatus = asyncHandler(async (req, res) => {
  if (redisClient.isAlive() && dbClient.isAlive()) {
    res.status(200).send('{ "redis": true, "db": true }');
  }
});

export const getStats = asyncHandler(async (req, res) => {
  const users = await dbClient.nbUsers();
  const files = await dbClient.nbFiles();
  res.status(200).send(`{ "users": ${users}, "files": ${files} }`);
});
