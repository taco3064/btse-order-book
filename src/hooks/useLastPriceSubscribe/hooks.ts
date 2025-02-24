import { useReducer } from 'react';

import { getInitState, reducer } from './utils';
import { useSubscribe } from '../useSubscribe';
import type { ReducerAction } from './types';

export function useLastPriceSubscribe(orderCode: string) {
  const [{ error, lastPrice, status }, dispatch] = useReducer(reducer, getInitState());

  useSubscribe<ReducerAction>(
    {
      url: 'wss://ws.btse.com/ws/futures',
      key: `tradeHistoryApi:${orderCode}`,
      onMessage: (action) => dispatch(action),
    },
    [error, orderCode],
  );

  return {
    lastPrice: lastPrice <= 0 ? null : lastPrice,
    status,
  };
}
