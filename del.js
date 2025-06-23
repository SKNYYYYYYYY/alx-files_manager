// import { createClient } from 'redis';

// const redis = createClient();
// redis.on('error', (err) => console.log('Redis Client Error', err));

// (async () => {
//   await redis.connect();
  
//   // Set and get directly
//   await redis.set('key', 'value');
//   const value = await redis.get('key');
//   console.log(value)
  
//   await redis.disconnect();
// })();
import pkg from 'mongodb';
const { MongoClient } = pkg;

const url = 'mongodb://localhost';
const client = new MongoClient(url, { useUnifiedTopology: true });

async function main() {
  await client.connect();
  const db = client.db('myDB');
  // const collection = db.collection('documents');
  const res = await db.collection('documents').find().toArray();

  console.log(res.length);
  // const insertResult = await collection.insertMany([{ a: 1 }, { b: 2 }]);
  // console.log(insertResult);

  // const findResult = await collection.find({ a: 1 }).toArray();
  // console.log(findResult);

  // const updateResult = await collection.updateOne({ b: 15 }, { $set: { c: 18 } });
  // console.log(updateResult);

  // const removeResult = await collection.deleteMany({ a: 1 });
  // console.log(removeResult);

  // const indexName = await collection.createIndex({ b: 2 });
  // console.log(indexName);
  try {
    await collection.insertOne({ _id: 1 });
  } catch (error) {
    // if (error instanceof MongoServerError) {
    //   console.log('Error occured', error);
    // }
  }
}

main()
  .then(() => console.log('OK'))
  .catch((err) => console.log('error occured', err))
  .finally(() => client.close());
