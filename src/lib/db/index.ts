import PouchDB from 'pouchdb';
import PouchFind from 'pouchdb-find';
import { v4 as uuidv4 } from 'uuid';

// Register PouchDB plugins
PouchDB.plugin(PouchFind);

// Initialize local databases
const db = {
  products: new PouchDB('pos_products'),
  customers: new PouchDB('pos_customers'),
  invoices: new PouchDB('pos_invoices'),
  users: new PouchDB('pos_users'),
  stockAdjustments: new PouchDB('pos_stock_adjustments')
};

// Initialize remote sync if REMOTE_COUCHDB_URL is set
const REMOTE_COUCHDB_URL = import.meta.env.VITE_REMOTE_COUCHDB_URL;

if (REMOTE_COUCHDB_URL) {
  Object.keys(db).forEach(dbName => {
    const remoteDb = new PouchDB(`${REMOTE_COUCHDB_URL}/${dbName}`);
    
    // Set up two-way sync
    db[dbName].sync(remoteDb, {
      live: true,
      retry: true
    }).on('error', function (err) {
      console.error('Sync error:', err);
    });
  });
}

// Create indexes for faster querying
async function createIndexes() {
  try {
    // Products indexes
    await db.products.createIndex({
      index: { fields: ['sku', 'name', 'barcode'] }
    });

    // Customers indexes
    await db.customers.createIndex({
      index: { fields: ['phone', 'name'] }
    });

    // Invoices indexes
    await db.invoices.createIndex({
      index: { fields: ['createdAt', 'status', 'customerId'] }
    });
  } catch (error) {
    console.error('Error creating indexes:', error);
  }
}

createIndexes();

// Helper functions
export async function addDocument(dbName, doc) {
  try {
    doc._id = doc._id || uuidv4();
    doc.createdAt = doc.createdAt || new Date().toISOString();
    doc.updatedAt = new Date().toISOString();
    
    const result = await db[dbName].put(doc);
    return { ...doc, _rev: result.rev };
  } catch (error) {
    throw new Error(`Error adding document to ${dbName}: ${error.message}`);
  }
}

export async function getDocument(dbName, id) {
  try {
    return await db[dbName].get(id);
  } catch (error) {
    if (error.status === 404) return null;
    throw new Error(`Error getting document from ${dbName}: ${error.message}`);
  }
}

export async function updateDocument(dbName, id, updates) {
  try {
    const doc = await db[dbName].get(id);
    const updatedDoc = {
      ...doc,
      ...updates,
      updatedAt: new Date().toISOString()
    };
    const result = await db[dbName].put(updatedDoc);
    return { ...updatedDoc, _rev: result.rev };
  } catch (error) {
    throw new Error(`Error updating document in ${dbName}: ${error.message}`);
  }
}

export async function deleteDocument(dbName, id) {
  try {
    const doc = await db[dbName].get(id);
    await db[dbName].remove(doc);
    return true;
  } catch (error) {
    throw new Error(`Error deleting document from ${dbName}: ${error.message}`);
  }
}

export async function queryDocuments(dbName, query) {
  try {
    return await db[dbName].find(query);
  } catch (error) {
    throw new Error(`Error querying documents in ${dbName}: ${error.message}`);
  }
}

export default db;