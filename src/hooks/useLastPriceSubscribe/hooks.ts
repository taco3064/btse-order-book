import { useReducer } from 'react';

import { getInitState, reducer } from './utils';
import { useSubscribe } from '../useSubscribe';
import type { ReducerAction } from './types';

export function useLastPriceSubscribe(orderCode: string) {
  const [{ uid, lastPrice, status }, dispatch] = useReducer(reducer, getInitState());

  useSubscribe<ReducerAction>(() => ({
    uid,
    url: 'wss://ws.btse.com/ws/futures',
    key: `tradeHistoryApi:${orderCode}`,
    onMessage: dispatch,
  }));

  return {
    lastPrice: lastPrice <= 0 ? null : lastPrice,
    status,
  };
}
