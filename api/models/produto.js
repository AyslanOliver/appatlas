import { ObjectId } from 'mongodb';
import { getCollection } from '../lib/mongodb.js';

export async function getAllProdutos() {
  const collection = await getCollection('produtos');
  return collection.find({}).toArray();
}

export async function getProdutoById(id) {
  const collection = await getCollection('produtos');
  return collection.findOne({ _id: new ObjectId(id) });
}

export async function createProduto(produto) {
  const collection = await getCollection('produtos');
  const result = await collection.insertOne(produto);
  return { ...produto, _id: result.insertedId };
}

export async function updateProduto(id, produto) {
  const collection = await getCollection('produtos');
  await collection.updateOne(
    { _id: new ObjectId(id) },
    { $set: produto }
  );
  return { ...produto, _id: id };
}

export async function deleteProduto(id) {
  const collection = await getCollection('produtos');
  await collection.deleteOne({ _id: new ObjectId(id) });
  return { _id: id };
}