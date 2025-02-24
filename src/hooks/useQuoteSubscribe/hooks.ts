import { useReducer } from 'react';

import { useSubscribe } from '../useSubscribe';
import { getInitState, reducer } from './utils';
import type { QuoteMessage } from './types';

export function useQuoteSubscribe(maxRows: number, orderCode: string) {
  const [{ seq, asks, bids, error }, dispatch] = useReducer(
    reducer,
    getInitState(maxRows),
  );

  useSubscribe<QuoteMessage>(
    {
      url: 'wss://ws.btse.com/ws/oss/futures',
      key: `update:${orderCode}`,
      onMessage: (action) => dispatch({ ...action, maxRows }),
    },
    [error, maxRows, orderCode],
  );

  return { seq, asks, bids };
}
