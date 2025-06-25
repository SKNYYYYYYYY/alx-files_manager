/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable import/extensions */
import asyncHandler from 'express-async-handler';
import crypto from 'crypto';
import pkg from 'mongodb';
import redisClient from '../utils/redis.js';
import dbClient from '../utils/db.js';

const { ObjectId } = pkg;

export const postNew = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).send('Missing email');
  }
  const { password } = req.body;
  if (!password) {
    return res.status(400).send('Missing password');
  }
  const users = dbClient.getCollection('users');

  const isPresent = await users.find({ email: `${email}` }).toArray();
  if (isPresent.length > 0) {
    return res.status(400).send('Already exist');
  }
  const hashedPwd = crypto.createHash('sha1').update(password).digest('hex');

  await users.insertOne({ email: `${email}`, password: `${hashedPwd}` });

  const rawUser = await users.find({ email: `${email}` }).toArray();
  const id = rawUser[0]._id;
  const savedEmail = rawUser[0].email;

  const user = { id, email: savedEmail };
  return res.status(201).send(user);
});

export const getMe = asyncHandler(async (req, res) => {
  const token = req.headers['x-token'];
  const userID = await redisClient.get(`auth_${token}`);
  if (!userID) {
    return res.status(401).send({ error: 'Unauthorized' });
  }
  const rawUser = await dbClient.getCollection('users').findOne({ _id: new ObjectId(userID) });
  const { _id, email } = rawUser;
  const user = { _id, email };
  return res.send(user);
});
