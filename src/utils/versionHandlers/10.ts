export default function handler(req: IDBOpenDBRequest) {
  const { result: db, transaction } = req;
  const workTable = db.objectStoreNames.contains('work')
    ? transaction?.objectStore('work')
    : db.createObjectStore('work');
  workTable?.deleteIndex('id-utime');
  workTable?.createIndex('visited_at', 'visited_at');
  const historyTable = db.objectStoreNames.contains('history')
    ? transaction?.objectStore('history')
    : db.createObjectStore('history');
  if (!historyTable?.indexNames.contains('utime')) {
    historyTable?.createIndex('utime', 'utime');
  }
  historyTable?.createIndex('id-utime', ['id', 'utime']);
}
