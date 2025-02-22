import { useEffect, useReducer } from 'react';
import type { OrderAction, OrderEntryArray, OrderEntry, OrderState } from './types';

export function useEntryData(maxRows: number, orderCode: string) {
  const [{ asks, bids }, dispatch] = useOrderReducer();

  useEffect(() => {
    const socket = new WebSocket('wss://ws.btse.com/ws/oss/futures');

    socket.onopen = () =>
      socket.send(JSON.stringify({ op: 'subscribe', args: [`update:${orderCode}`] }));

    socket.onmessage = ({ data }) => {
      const { data: order }: { data: OrderAction } = JSON.parse(data);

      if (order) {
        dispatch(order);
      }
    };

    return () => {
      dispatch('reset');
      socket.close();
    };
  }, [orderCode, dispatch]);

  return {
    asks: asks.slice(maxRows * -1),
    bids: bids.slice(0, maxRows),
  };
}

const useOrderReducer = (() => {
  function getInitState(): OrderState {
    return { seq: -1, asks: [], bids: [] };
  }

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
    arr: OrderEntryArray[], //* WebSocket 回傳的 Entry 更新紀錄
  ) {
    return arr.reduce(
      (acc, entryArray) => {
        const { price, size } = getOrderEntry(type, entryArray);

        if (size && price > acc[0]?.price) {
          //* 新增的 Entry 有最高價格 (必須有 size)
          acc.unshift({ type, price, size });
        } else if (size && price < acc[acc.length - 1]?.price) {
          //* 新增的 Entry 有最低價格 (必須有 size)
          acc.push({ type, price, size });
        } else {
          //* 取得最新 Entry 應插入的位置
          const index = acc.findIndex(
            ({ price: p }, i) => p === price || (p > price && acc[i + 1]?.price < price),
          );

          if (size && acc[index]?.price !== price) {
            //* 新增的 Entry (必須有 size)
            acc.splice(index + 1, 0, { type, price, size });
          } else if (!size && acc[index]?.price === price) {
            //* 已存在的 Entry 且 size 為 0，則刪除
            acc.splice(index, 1);
          } else if (size) {
            //* 更新已存在的 Entry (必須有 size)
            acc[index] = { type, price, size };
          }
        }

        return acc;
      },
      [...curr],
    );
  }

  return () =>
    useReducer<OrderState, [OrderAction | 'reset']>((state, action) => {
      if (action !== 'reset' && action.seqNum > state.seq) {
        const { type, seqNum, asks, bids } = action;

        switch (type) {
          case 'snapshot':
            //* 初始取得的 Entry 資料。已由大而小排序，所以前端只需要將 price / size 轉換成數字即可
            return {
              seq: seqNum,
              asks: asks.map((ask) => getOrderEntry('ask', ask)),
              bids: bids.map((bid) => getOrderEntry('bid', bid)),
            };

          case 'delta':
            //* 持續更新的 Entry 資料
            return {
              seq: seqNum,
              asks: updateEntries('ask', state.asks, asks),
              bids: updateEntries('bid', state.bids, bids),
            };

          default:
        }
      }

      return action !== 'reset' ? state : getInitState();
    }, getInitState());
})();
