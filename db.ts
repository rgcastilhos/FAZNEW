import { openDB, DBSchema } from 'idb';

interface GalleryDB extends DBSchema {
  images: {
    key: number;
    value: {
      id?: number;
      data: string;
      createdAt: number;
      username?: string;
    };
    indexes: { 'by-date': number, 'by-user': string };
  };
  training_data: {
    key: number;
    value: {
      id?: number;
      imageData: string;
      estimatedWeight: number;
      realWeight: number;
      animalType: string;
      createdAt: number;
      username?: string;
    };
    indexes: { 'by-date': number, 'by-user': string };
  };
  history: {
    key: number;
    value: {
      id?: number;
      type: 'camera' | 'manual';
      animalType: string;
      breed: string;
      weight: number;
      resultText: string;
      imageData?: string;
      createdAt: number;
      username?: string;
    };
    indexes: { 'by-date': number, 'by-user': string };
  };
}

const DB_NAME = 'animal-weight-db';
const STORE_NAME = 'images';
const TRAINING_STORE = 'training_data';
const HISTORY_STORE = 'history';

export const initDB = async () => {
  return openDB<GalleryDB>(DB_NAME, 4, {
    upgrade(db, oldVersion, newVersion, transaction) {
      if (oldVersion < 1) {
        const store = db.createObjectStore(STORE_NAME, {
          keyPath: 'id',
          autoIncrement: true,
        });
        store.createIndex('by-date', 'createdAt');
      }
      if (oldVersion < 2) {
        const store = db.createObjectStore(TRAINING_STORE, {
          keyPath: 'id',
          autoIncrement: true,
        });
        store.createIndex('by-date', 'createdAt');
      }
      if (oldVersion < 3) {
        const store = db.createObjectStore(HISTORY_STORE, {
          keyPath: 'id',
          autoIncrement: true,
        });
        store.createIndex('by-date', 'createdAt');
      }
      
      // Add username index for all stores in version 4
      if (oldVersion < 4) {
        [STORE_NAME, TRAINING_STORE, HISTORY_STORE].forEach(storeName => {
          const store = transaction.objectStore(storeName as any);
          if (!store.indexNames.contains('by-user')) {
            store.createIndex('by-user', 'username');
          }
        });
      }
    },
  });
};

export const addHistory = async (data: Omit<GalleryDB['history']['value'], 'id' | 'createdAt'>, username?: string) => {
  const db = await initDB();
  return db.add(HISTORY_STORE, {
    ...data,
    username,
    createdAt: Date.now(),
  });
};

export const getHistory = async (username?: string) => {
  const db = await initDB();
  if (username) {
    return db.getAllFromIndex(HISTORY_STORE, 'by-user', username);
  }
  return db.getAllFromIndex(HISTORY_STORE, 'by-date');
};

export const deleteHistory = async (id: number) => {
  const db = await initDB();
  return db.delete(HISTORY_STORE, id);
};

export const addTrainingData = async (data: Omit<GalleryDB['training_data']['value'], 'id' | 'createdAt'>, username?: string) => {
  const db = await initDB();
  return db.add(TRAINING_STORE, {
    ...data,
    username,
    createdAt: Date.now(),
  });
};

export const getTrainingData = async (username?: string) => {
  const db = await initDB();
  if (username) {
    return db.getAllFromIndex(TRAINING_STORE, 'by-user', username);
  }
  return db.getAllFromIndex(TRAINING_STORE, 'by-date');
};

export const deleteTrainingData = async (id: number) => {
  const db = await initDB();
  return db.delete(TRAINING_STORE, id);
};

export const addImageToDB = async (imageData: string, username?: string) => {
  const db = await initDB();
  return db.add(STORE_NAME, {
    data: imageData,
    username,
    createdAt: Date.now(),
  });
};

export const getImagesFromDB = async (username?: string) => {
  const db = await initDB();
  if (username) {
    return db.getAllFromIndex(STORE_NAME, 'by-user', username);
  }
  return db.getAllFromIndex(STORE_NAME, 'by-date');
};

export const deleteImageFromDB = async (id: number) => {
  const db = await initDB();
  return db.delete(STORE_NAME, id);
};
