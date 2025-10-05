import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://ayslano37:5g2ZC1Uf6gQdBIrk@demolicao.fk6aapp.mongodb.net/pastelaria';
const DATABASE_NAME = 'pastelaria';

let cachedClient = null;
let cachedDb = null;

export async function connectToDatabase() {
    if (cachedClient && cachedDb) {
        return { client: cachedClient, db: cachedDb };
    }

    const client = await MongoClient.connect(MONGODB_URI);
    const db = client.db(DATABASE_NAME);
    
    cachedClient = client;
    cachedDb = db;

    console.log('Conectado ao MongoDB com sucesso!');
    return { client, db };
}

export async function getCollection(collectionName) {
    const { db } = await connectToDatabase();
    return db.collection(collectionName);
}