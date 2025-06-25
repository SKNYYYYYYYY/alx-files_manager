/* eslint-disable import/extensions */
import { v4 as uuid4 } from 'uuid';
import fs from 'fs';
import { promisify } from 'util';
import pkg from 'mongodb';
import mime from 'mime-types';
import redisClient from '../utils/redis.js';
import dbClient from '../utils/db.js';

const { ObjectId } = pkg;

const ENV = process.env;
let folderPath = ENV.FOLDER_PATH;
if (!folderPath) {
  folderPath = '/tmp/files_manager';
}
const writeFileAsync = promisify(fs.writeFile);
if (!fs.existsSync(folderPath)) {
  fs.mkdirSync(folderPath, { recursive: true });
}

export const postUpload = (async (req, res) => {
  const token = req.headers['x-token'];
  const userId = await redisClient.get(`auth_${token}`);
  if (!userId) {
    return res.status(401).send({ error: 'Unauthorized' });
  }
  const { name } = req.body;
  if (!name) {
    return res.status(400).send({ error: 'Missing name' });
  }
  const allowedTypes = ['file', 'folder', 'image'];

  const { type } = req.body;
  if (!type || (!allowedTypes.includes(type))) {
    return res.status(400).send({ error: 'Missing type' });
  }

  const { data } = req.body;
  if (!data && (type !== 'folder')) {
    return res.status(400).send({ error: 'Missing data' });
  }

  let { parentId } = req.body;
  if (parentId) {
    const file = await dbClient.getCollection('files').findOne({ _id: new ObjectId(parentId) });
    if (!file) {
      return res.status(400).send({ error: 'Parent not found' });
    }
    if (file.type !== 'folder') {
      return res.status(400).send({ error: 'Parent is not a folder' });
    }
  } else parentId = 0;

  let { isPublic } = req.body;
  if (!isPublic) isPublic = false;

  if (type === 'folder') {
    const newFile = await dbClient.getCollection('files').insertOne({
      userId,
      name,
      type,
      isPublic,
      parentId,
    });
    const createdFile = {
      id: newFile.insertedId,
      userId,
      name,
      type,
      isPublic,
      parentId,
    };
    return res.status(201).json(createdFile);
  }
  const fileName = uuid4();
  const localPath = `${folderPath}/${fileName}`;
  try {
    await writeFileAsync(localPath, Buffer.from(data, 'base64').toString());
  } catch (err) {
    console.log('Error', err);
  }

  const newFile = await dbClient.getCollection('files').insertOne({
    userId,
    name,
    type,
    isPublic,
    parentId,
    localPath,
  });

  const createdFile = {
    id: newFile.insertedId,
    userId,
    name,
    type,
    isPublic,
    parentId,
    localPath,
  };
  return res.status(201).json(createdFile);
});

export const getShow = (async (req, res) => {
  const token = req.headers['x-token'];
  const userId = await redisClient.get(`auth_${token}`);
  if (!userId) {
    return res.status(401).send({ error: 'Unauthorized' });
  }
  const parentId = req.params.id;
  let file;
  if (parentId) {
    file = await dbClient.getCollection('files').findOne({ _id: new ObjectId(parentId), userId });
    if (!file) {
      return res.status(400).send({ error: 'Not found' });
    }
  }
  return res.status(200).send({ file });
});

export const getIndex = (async (req, res) => {
  const token = req.headers['x-token'];
  const userId = await redisClient.get(`auth_${token}`);
  if (!userId) {
    return res.status(401).send({ error: 'Unauthorized' });
  }
  const { parentId } = req.query;
  let file;

  if (parentId) {
    file = await dbClient.getCollection('files').findOne({ _id: new ObjectId(parentId), userId });
    if (!file) {
      return res.status(400).send([]);
    }
    return res.status(200).send({ file });
  }
  const page = parseInt(req.params.page, 10) || 0;

  const pageSize = 20;

  const files = await dbClient.getCollection('files').aggregate([
    { $match: { userId } },
    { $skip: page * pageSize },
    { $limit: pageSize },
  ]).toArray();

  if (!files) return res.send([]);

  return res.send(files);
});

export const putPublish = (async (req, res) => {
  const token = req.headers['x-token'];
  const userId = await redisClient.get(`auth_${token}`);
  if (!userId) {
    return res.status(401).send({ error: 'Unauthorized' });
  }
  const parentId = req.params.id;
  let file;
  let updatedFile;
  if (parentId) {
    file = await dbClient.getCollection('files').findOne({ _id: new ObjectId(parentId), userId });
    if (!file) {
      return res.status(400).send({ error: 'Not found' });
    }
    updatedFile = await dbClient.getCollection('files').findOneAndUpdate(
      { _id: new ObjectId(parentId), userId },
      { $set: { isPublic: true } },
      { returnDocument: 'after' },
    );
    return res.status(200).send(updatedFile.value);
  }
});

export const putUnPublish = (async (req, res) => {
  const token = req.headers['x-token'];
  const userId = await redisClient.get(`auth_${token}`);
  if (!userId) {
    return res.status(401).send({ error: 'Unauthorized' });
  }
  const parentId = req.params.id;
  let file;
  let updatedFile;
  if (parentId) {
    file = await dbClient.getCollection('files').findOne({ _id: new ObjectId(parentId), userId });
    if (!file) {
      return res.status(400).send({ error: 'Not found' });
    }
    updatedFile = await dbClient.getCollection('files').findOneAndUpdate(
      { _id: new ObjectId(parentId), userId },
      { $set: { isPublic: false } },
      { returnDocument: 'after' },
    );
  }
  return res.status(200).send(updatedFile.value);
});


export const getFile = (async (req, res) => {
  const token = req.headers['x-token'];
  const userId = await redisClient.get(`auth_${token}`);

  const Id = req.params.id;
  let file;
  if (Id) {
    file = await dbClient.getCollection('files').findOne({ _id: new ObjectId(Id) });
    if (!file) {
      return res.status(404).send({ error: 'Not found' });
    }
    if (!file.isPublic && file.userId !== userId) {
      return res.status(404).send({ error: 'Not found' });
    }
    if (file.type === 'folder') {
      return res.status(400).send({ error: "A folder doesn't have content" });
    }
    if (!fs.existsSync(file.localPath)) {
      return res.status(404).send({ error: 'Not found' });
    }
  }
  const mimeType = mime.lookup(file.name);
  res.setHeader('Content-Type', mimeType);
  const fileBuffer = fs.readFileSync(file.localPath);

  return res.status(200).send(fileBuffer);
});
