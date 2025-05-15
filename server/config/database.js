// server/config/database.js
const { MongoClient } = require('mongodb');
require('dotenv').config();

class Database {
  constructor() {
    this.client = null;
    this.db = null;
    this.uri = process.env.MONGODB_URI;
  }

  async connect() {
    if (this.db) {
      return this.db;
    }

    try {
      this.client = new MongoClient(this.uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        maxPoolSize: 10,
        minPoolSize: 5,
        maxIdleTimeMS: 30000,
        connectTimeoutMS: 10000,
        socketTimeoutMS: 45000,
      });

      await this.client.connect();
      console.log("Connected to MongoDB");
      
      this.db = this.client.db("cardgame");
      return this.db;
    } catch (error) {
      console.error("MongoDB connection error:", error);
      throw error;
    }
  }

  async disconnect() {
    if (this.client) {
      await this.client.close();
      this.client = null;
      this.db = null;
      console.log("Disconnected from MongoDB");
    }
  }

  async getCollection(collectionName) {
    if (!this.db) {
      await this.connect();
    }
    return this.db.collection(collectionName);
  }
}

// Create a singleton instance
const database = new Database();

module.exports = database;