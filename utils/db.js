import pkg from 'mongodb';

const { MongoClient } = pkg;

class DBClient {
  constructor() {
    const ENV = process.env;
    const DB_HOST = ENV.DB_HOST || 'localhost';
    const DB_PORT = ENV.DB_PORT || 27017;
    const DB_DATABASE = ENV.DB_DATABASE || 'files_manager';

    const url = `mongodb://${DB_HOST}:${DB_PORT}`;
    this.status = false;

    this.client = new MongoClient(url, { useUnifiedTopology: true });

  }

  isAlive() {
    return this.status;
  }

  async nbUsers() {
    const users = await this.db.collection('users').find().toArray();
    return users.length;
  }

  async nbFiles() {
    const files = await this.db.collection('files').find().toArray();
    return files.length;
  }
}

const dbClient = new DBClient();
export default dbClient;
