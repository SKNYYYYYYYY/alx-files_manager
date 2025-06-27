/* eslint-disable import/extensions */
import pkg from 'mongodb';
import thumbnail from 'image-thumbnail';
import fs from 'fs';
import Queue from 'bull/lib/queue.js';
import dbClient from './utils/db.js';

const { ObjectId } = pkg;

const fileQueue = new Queue('fileQueue');

fileQueue.process(async (job) => {
  const { fileId } = job.data;
  if (!fileId) throw new Error('Missing fileId');

  const { userId } = job.data;
  if (!userId) throw new Error('Missing fileId');

  const img = await dbClient.getCollection('files').findOne({ _id: new ObjectId(fileId), userId });
  if (!img) throw new Error('File not found');
  console.log('File Found ', img);

  (async () => {
    try {
      const file = await dbClient.getCollection('files').findOne({ _id: new ObjectId(fileId), userId });
      const imagePath = file.localPath;
      const widths = [500, 250, 100];
      // Get file information
      const imageBuffer = fs.readFileSync(imagePath);

      // Generate thumbnails for each width
      for (const width of widths) {
        const options = { width };

        // Generate thumbnail
        // eslint-disable-next-line no-await-in-loop
        const thumbnailBuffer = await thumbnail(imageBuffer, options);

        // Create output path
        const outputPath = `${imagePath}_${width}`;

        // Save thumbnail
        fs.writeFileSync(outputPath, thumbnailBuffer);
        console.log(`Thumbnail generated: ${outputPath}`);
      }

      return true;
    } catch (error) {
      console.error('Error generating thumbnails:', error);
      return false;
    }
  })();
});

const userQueue = new Queue('userQueue');
userQueue.process(async (job) => {
  const { userId } = job.data;
  if (!userId) throw new Error('Missing fileId');

  const doc = await dbClient.getCollection('files').findOne({ userId });
  if (!doc) throw new Error('File not found');
  else console.log('Welcome ', doc.email);
});
