import { useReducer } from 'react';

import { useSubscribe } from '../useSubscribe';
import { getInitState, reducer } from './utils';
import type { QuoteMessage } from './types';

export function useQuoteSubscribe(maxRows: number, orderCode: string) {
  const [{ uid, seq, asks, bids }, dispatch] = useReducer(reducer, getInitState(maxRows));

  useSubscribe<QuoteMessage>(
    () => ({
      uid,
      url: 'wss://ws.btse.com/ws/oss/futures',
      key: `update:${orderCode}`,
      onMessage: (action) => dispatch({ ...action, maxRows }),
    }),
    [maxRows],
  );

  return { seq, asks, bids };
}
