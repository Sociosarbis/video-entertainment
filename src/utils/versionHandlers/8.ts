export default function handler(db: IDBDatabase) {
  if (db.objectStoreNames.contains('work')) {
    db.deleteObjectStore('work');
  }
  if (db.objectStoreNames.contains('history')) {
    db.deleteObjectStore('work');
  }
  db.createObjectStore('work');
  db.createObjectStore('history').createIndex('utime', 'utime');
}
