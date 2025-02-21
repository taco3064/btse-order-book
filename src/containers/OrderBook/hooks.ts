import cx from 'clsx';
import numeral from 'numeral';
import { useEffect, useMemo, useReducer } from 'react';

import type { ColumnConfig } from '~bob/components';
import type { OrderAction, OrderEntryArray, OrderEntry, OrderState } from './types';

export function useEntryColumns(entryCount: number) {
  return useMemo<ColumnConfig<OrderEntry>[]>(
    () => [
      {
        key: 'price',
        label: 'Price (USD)',
        render: ({ price }) => numeral(price).format('0,0.0'),
        classes: {
          header: 'py-1 text-left w-4/10',
          cell: ({ type }) => cx('py-1', `text-price-${type}`),
        },
      },
      {
        key: 'size',
        label: 'Size',
        render: ({ size }) => numeral(size).format('0,0'),
        classes: { header: 'py-1 text-right w-3/10', cell: () => cx('py-1 text-right') },
      },
      {
        key: 'total',
        label: 'Total',
        classes: { header: 'py-1 text-right w-3/10', cell: () => cx('py-1 text-right') },
        render: ({ type, size }, i, arr) => {
          const all =
            type === 'ask' ? arr.slice(i + 1, entryCount) : arr.slice(entryCount, i);

          return numeral(all.reduce((acc, { size }) => acc + size, 0) + size).format(
            '0,0',
          );
        },
      },
    ],
    [entryCount],
  );
}

export function useOrderSocket(count: number) {
  const [{ asks, bids }, dispatch] = useOrderReducer();

  useEffect(() => {
    const socket = new WebSocket('wss://ws.btse.com/ws/oss/futures');

    socket.onopen = () =>
      socket.send(JSON.stringify({ op: 'subscribe', args: ['update:BTCPFC'] }));

    socket.onmessage = ({ data }) => {
      const { data: order }: { data: OrderAction } = JSON.parse(data);

      if (order) {
        dispatch(order);
      }
    };

    return () => socket.close();
  }, [dispatch]);

  return {
    asks: asks.slice(count * -1),
    bids: bids.slice(0, count),
  };
}

const useOrderReducer = (() => {
  function getOrderEntry(
    type: OrderEntry['type'],
    [price, size]: OrderEntryArray,
  ): OrderEntry {
    return {
      type,
      price: Number(price),
      size: Number(size),
    };
  }

  function updateEntries(
    type: OrderEntry['type'],
    curr: OrderEntry[],
    arr: OrderEntryArray[],
  ) {
    return arr.reduce(
      (acc, entryArray) => {
        const { price, size } = getOrderEntry(type, entryArray);

        if (size && price > acc[0]?.price) {
          acc.unshift({ type, price, size });
        } else if (size && price < acc[acc.length - 1]?.price) {
          acc.push({ type, price, size });
        } else {
          const index = acc.findIndex(
            ({ price: p }, i) => p === price || (p > price && acc[i + 1]?.price < price),
          );

          if (size && acc[index]?.price !== price) {
            acc.splice(index + 1, 0, { type, price, size });
          } else if (!size && acc[index]?.price === price) {
            acc.splice(index, 1);
          } else if (size) {
            acc[index] = { type, price, size };
          }
        }

        return acc;
      },
      [...curr],
    );
  }

  return () =>
    useReducer<OrderState, [OrderAction]>(
      (state, { type, seqNum, asks, bids }) => {
        if (seqNum > state.seq) {
          switch (type) {
            case 'snapshot':
              return {
                seq: seqNum,
                asks: asks.map((ask) => getOrderEntry('ask', ask)),
                bids: bids.map((bid) => getOrderEntry('bid', bid)),
              };

            case 'delta':
              return {
                seq: seqNum,
                asks: updateEntries('ask', state.asks, asks),
                bids: updateEntries('bid', state.bids, bids),
              };
          }
        }

        return state;
      },
      { seq: -1, asks: [], bids: [] },
    );
})();
