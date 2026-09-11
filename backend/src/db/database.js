const { MongoClient } = require('mongodb');
const config = require('../config');

const client = new MongoClient(config.mongodb.url);

let db;

async function connectDatabase() {
    await client.connect();

    db = client.db(config.mongodb.dbName);

    console.log('MongoDB connected successfully');

    return db;
}

function getDatabase() {
    if (!db) {
        throw new Error('Database is not connected');
    }

    return db;
}

module.exports = {
    connectDatabase,
    getDatabase
};