import { createContext } from 'react';
import SoDB, { Table } from '../utils/indexDB';
import { HistoryItem } from '../pages/History';

const tables: Table[] = [
  {
    name: 'history',
    indices: [
      {
        name: 'utime',
        keyPath: 'utime',
      },
    ],
  },
];

export const DBContext = createContext(new SoDB<HistoryItem>('main', tables));
