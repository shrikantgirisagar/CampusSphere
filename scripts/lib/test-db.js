// scripts/lib/test-db.js
// Isolated In-Memory MongoDB Test Harness
// Strictly enforces localhost/127.0.0.1 and *_test database naming rules.

const { MongoMemoryServer } = require("mongodb-memory-server");
const mongoose = require("mongoose");

let mongodInstance = null;

function validateTestUri(uri) {
  if (!uri) {
    throw new Error("Missing MONGODB_URI");
  }
  let parsed;
  try {
    parsed = new URL(uri);
  } catch (err) {
    throw new Error(`Invalid MONGODB_URI '${uri}': ${err.message}`);
  }

  const host = parsed.hostname;
  if (host !== "127.0.0.1" && host !== "localhost") {
    throw new Error(
      `CRITICAL TEST SAFETY VIOLATION: MONGODB_URI host '${host}' is not 127.0.0.1 or localhost! Refusing to run tests against non-local database.`
    );
  }

  const dbName = parsed.pathname.replace(/^\//, "").split("?")[0];
  if (!dbName.endsWith("_test")) {
    throw new Error(
      `CRITICAL TEST SAFETY VIOLATION: Test database name '${dbName}' must end with '_test'!`
    );
  }
}

// Intercept mongoose.connect to prevent accidental connection to Atlas or production databases in tests
const originalMongooseConnect = mongoose.connect.bind(mongoose);
mongoose.connect = async function (uri, options) {
  const targetUri = uri || process.env.MONGODB_URI;
  validateTestUri(targetUri);
  return originalMongooseConnect(targetUri, options);
};

async function startTestDb(dbName = "CampusSphere_test") {
  if (!dbName.endsWith("_test")) {
    dbName = `${dbName}_test`;
  }

  if (mongodInstance) {
    let uri = mongodInstance.getUri();
    const baseUri = uri.endsWith("/") ? uri : uri + "/";
    const finalUri = baseUri + dbName;
    process.env.MONGODB_URI = finalUri;
    validateTestUri(finalUri);
    return finalUri;
  }

  mongodInstance = await MongoMemoryServer.create({
    instance: {
      dbName: dbName
    }
  });

  let uri = mongodInstance.getUri();
  const baseUri = uri.endsWith("/") ? uri : uri + "/";
  const finalUri = baseUri + dbName;

  process.env.MONGODB_URI = finalUri;
  validateTestUri(finalUri);
  return finalUri;
}

async function setupTestDb(dbName = "CampusSphere_test") {
  const uri = await startTestDb(dbName);
  if (mongoose.connection.readyState === 0) {
    await originalMongooseConnect(uri, { serverSelectionTimeoutMS: 5000 });
  } else if (mongoose.connection.readyState === 1) {
    // If already connected to another URI or db, switch or ensure matching
    if (mongoose.connection.name !== dbName && !mongoose.connection.name.endsWith("_test")) {
      await mongoose.disconnect();
      await originalMongooseConnect(uri, { serverSelectionTimeoutMS: 5000 });
    }
  }
  return uri;
}

async function stopTestDb() {
  try {
    if (mongoose.connection && mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
  } catch (_) {}

  if (mongodInstance) {
    try {
      await mongodInstance.stop();
    } catch (_) {}
    mongodInstance = null;
  }
}

async function cleanCollections() {
  if (mongoose.connection && mongoose.connection.readyState === 1) {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      try {
        await collections[key].deleteMany({});
      } catch (_) {}
    }
  }
}

module.exports = {
  startTestDb,
  setupTestDb,
  stopTestDb,
  cleanCollections,
  validateTestUri
};
