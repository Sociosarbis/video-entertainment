import { createContext } from 'react';
import SoDB from '../utils/indexDB';

const db = new SoDB('main', 6);

const DBContext = createContext(db);

export { db, DBContext };
