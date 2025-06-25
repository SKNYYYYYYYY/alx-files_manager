/* eslint-disable import/extensions */
/* eslint-disable import/no-extraneous-dependencies */
import asyncHandler from 'express-async-handler';
import { v4 as uuid4 } from 'uuid';
import crypto from 'crypto';
import dbClient from '../utils/db.js';
import redisClient from '../utils/redis.js';

export const getConnect = asyncHandler(async (req, res) => {
  const authHeader = req.headers.authorization;
  const base64credentials = authHeader.split(' ')[1];
  const credentials = Buffer.from(base64credentials, 'base64').toString('utf-8');
  const [email, unhashedpassword] = credentials.split(':');

  const password = crypto.createHash('sha1').update(unhashedpassword).digest('hex');

  const user = await dbClient.getCollection('users').findOne({ email, password });
  if (user === null) {
    return res.status(401).send({ error: 'Unauthorized' });
  }
  const token = uuid4();
  const key = `auth_${token}`;

  const userId = user._id.toString();
  await redisClient.set(key, userId, 86400);
  return res.status(200).send({ token: `${token}` });
});

export const getDisconnect = asyncHandler(async (req, res) => {
  const token = req.headers['x-token'];
  const isPresent = await redisClient.get(`auth_${token}`);
  if (!isPresent) {
    return res.status(401).send({ error: 'Unauthorized' });
  }
  await redisClient.del(`auth_${token}`);
  return res.status(204).send();
});
