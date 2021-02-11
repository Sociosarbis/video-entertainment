export default function handler(db: IDBDatabase) {
  db.createObjectStore('work');
}
