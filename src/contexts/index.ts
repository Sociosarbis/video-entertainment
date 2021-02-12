import { createContext } from 'react';
import { useLoading } from '../components/Loading';
import { useMessage } from '../components/Message';

export type GlobalContextValue = {
  showMessage: ReturnType<typeof useMessage>['showMessage'];
  withLoading: ReturnType<typeof useLoading>['withLoading'];
  setLoading: ReturnType<typeof useLoading>['setLoading'];
};

const GlobalContext = createContext<GlobalContextValue | null>(null);

export { GlobalContext };
