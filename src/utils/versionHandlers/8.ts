export default function handler(req: IDBOpenDBRequest) {
  const { result: db } = req;
  if (db.objectStoreNames.contains('work')) {
    db.deleteObjectStore('work');
  }
  if (db.objectStoreNames.contains('history')) {
    db.deleteObjectStore('history');
  }
  db.createObjectStore('work');
  db.createObjectStore('history').createIndex('utime', 'utime');
}
