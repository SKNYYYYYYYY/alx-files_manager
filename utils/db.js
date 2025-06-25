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
    this.client.connect()
      .then(() => {
        this.db = this.client.db(`${DB_DATABASE}`);
        this.status = true;
      })
      .catch(() => { this.status = false; });
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

  getCollection(name) {
    if (!this.isAlive) throw new Error('DB is not ready');
    return this.db.collection(name);
  }
}

const dbClient = new DBClient();
export default dbClient;
