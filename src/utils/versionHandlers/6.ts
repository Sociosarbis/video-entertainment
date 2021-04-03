export default function handler(db: IDBDatabase) {
  db.deleteObjectStore('work');
  db.deleteObjectStore('history');
  db.createObjectStore('work');
  db.createObjectStore('history');
}
