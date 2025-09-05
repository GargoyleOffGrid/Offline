import Dexie from 'dexie';
export const db = new Dexie('gargoyleDB');
db.version(1).stores({
  items: '++id, name, category, qty, par, expiresOn, location'
});