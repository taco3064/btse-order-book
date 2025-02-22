import { useEffect, useReducer } from 'react';
import type { QuoteAction, QuoteArray, QuoteData, QuoteState } from './types';

export function useQuoteData(maxRows: number, orderCode: string) {
  const [{ asks, bids, error }, dispatch] = useQuoteReducer();

  useEffect(() => {
    if (!error) {
      const socket = new WebSocket('wss://ws.btse.com/ws/oss/futures');

      socket.onclose = () => dispatch('reset');

      socket.onopen = () =>
        socket.send(
          JSON.stringify({
            op: 'subscribe',
            args: [`update:${orderCode}`],
          }),
        );

      socket.onmessage = ({ data }) => {
        const { data: action }: { data: QuoteAction } = JSON.parse(data);

        if (action) {
          dispatch(action);
        }
      };

      return () => socket.close();
    }
  }, [error, orderCode, dispatch]);

  return {
    asks: asks.slice(maxRows * -1),
    bids: bids.slice(0, maxRows),
  };
}

const useQuoteReducer = (() => {
  function getInitState(): QuoteState {
    return {
      seq: -1,
      asks: [],
      bids: [],
      error: false,
    };
  }

  function getQuote(type: QuoteData['type'], [price, size]: QuoteArray): QuoteData {
    return {
      type,
      price: Number(price),
      size: Number(size),
    };
  }

  function updateQuotes(
    type: QuoteData['type'],
    curr: QuoteData[],
    arr: QuoteArray[], //* WebSocket 回傳的 Quote 更新紀錄
  ) {
    return arr.reduce(
      (acc, quoteArray) => {
        const { price, size } = getQuote(type, quoteArray);

        if (size && price > acc[0]?.price) {
          //* 新增的 Quote 有最高價格 (必須有 size)
          acc.unshift({ type, price, size });
        } else if (size && price < acc[acc.length - 1]?.price) {
          //* 新增的 Quote 有最低價格 (必須有 size)
          acc.push({ type, price, size });
        } else {
          //* 取得最新 Quote 應插入的位置
          const index = acc.findIndex(
            ({ price: p }, i) => p === price || (p > price && acc[i + 1]?.price < price),
          );

          if (size && acc[index]?.price !== price) {
            //* 新增的 Quote (必須有 size)
            acc.splice(index + 1, 0, { type, price, size });
          } else if (!size && acc[index]?.price === price) {
            //* 已存在的 Quote 且 size 為 0，則刪除
            acc.splice(index, 1);
          } else if (size) {
            //* 更新已存在的 Quote (必須有 size)
            acc[index] = { type, price, size };
          }
        }

        return acc;
      },
      [...curr],
    );
  }

  return () =>
    useReducer<QuoteState, [QuoteAction | 'reset']>((state, action) => {
      const isReset = action === 'reset';

      if (!isReset) {
        const { type, seqNum, asks, bids } = action;

        switch (type) {
          case 'snapshot':
            //* 初始取得的 Quote 資料。已由大而小排序，所以前端只需要將 price / size 轉換成數字即可
            return {
              seq: seqNum,
              error: false,
              asks: asks.map((ask) => getQuote('ask', ask)),
              bids: bids.map((bid) => getQuote('bid', bid)),
            };

          case 'delta': {
            //* 持續更新的 Quote 資料
            const newAsks = updateQuotes('ask', state.asks, asks);
            const newBids = updateQuotes('bid', state.bids, bids);
            const lastAsk = newAsks[newAsks.length - 1];
            const firstBid = newBids[0];

            return {
              seq: seqNum,
              error: seqNum - state.seq !== 1 || lastAsk.price < firstBid.price,
              asks: newAsks,
              bids: newBids,
            };
          }

          default:
        }
      }

      return isReset ? getInitState() : state;
    }, getInitState());
})();
