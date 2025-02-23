import { useEffect, useReducer } from 'react';

import { EnumQuoteAction, EnumQuoteStatus, EnumQuoteType } from './types';
import type * as Types from './types';

export function useQuoteSubscribe(maxRows: number, orderCode: string) {
  const [{ seq, asks, bids, error }, dispatch] = useQuoteReducer(maxRows);

  useEffect(() => {
    if (!error) {
      const socket = new WebSocket('wss://ws.btse.com/ws/oss/futures');

      socket.onopen = () =>
        socket.send(
          JSON.stringify({
            op: 'subscribe',
            args: [`update:${orderCode}`],
          }),
        );

      socket.onmessage = ({ data }) => {
        const { data: action }: { data: Types.QuoteMessage } = JSON.parse(data);

        if (action) {
          dispatch({ ...action, maxRows });
        }
      };

      return () => {
        socket.close();
        dispatch({ type: 'reset', maxRows });
      };
    }
  }, [error, maxRows, orderCode, dispatch]);

  return { seq, asks, bids };
}

const useQuoteReducer = (() => {
  function getInitState(maxRows: number): Types.ReducerState {
    return {
      seq: -1,
      asks: [],
      bids: [],
      maxRows,
      error: false,
    };
  }

  function getQuote({
    seq,
    type,
    quote: [price, size],
    status = EnumQuoteStatus.INIT,
  }: Types.GetQuoteInput): Types.QuoteData {
    return {
      seq,
      type,
      status,
      price: Number(price),
      size: Number(size),
    };
  }

  function updateQuotes({ seq, type, maxRows, prev, curr }: Types.UpdateQuoteInput) {
    const result = curr.reduce(
      (acc, quote) => {
        const newQuote = getQuote({
          seq,
          type,
          quote,
          status: EnumQuoteStatus.NEW_PRICE,
        });

        const { price, size } = newQuote;

        if (size && price > acc[0]?.price) {
          //* 新增的 Quote 有最高價格 (必須有 size)
          acc.unshift(newQuote);
        } else if (size && price < acc[acc.length - 1]?.price) {
          //* 新增的 Quote 有最低價格 (必須有 size)
          acc.push(newQuote);
        } else {
          //* 取得最新 Quote 應插入的位置
          const index = acc.findIndex(
            ({ price: p }, i) => p === price || (p > price && acc[i + 1]?.price < price),
          );

          if (!size && acc[index]?.price === price) {
            //* 已存在的 Quote 且 size 為 0，則刪除
            acc.splice(index, 1);
          } else if (size && acc[index]?.price !== price) {
            //* 新增的 Quote (必須有 size)
            acc.splice(index + 1, 0, newQuote);
          } else if (size && acc[index]?.size !== size) {
            const prevQuote = acc[index];

            //* 更新已存在的 Quote (必須有 size)
            acc.splice(index, 1, {
              ...newQuote,
              status:
                size > prevQuote.size
                  ? EnumQuoteStatus.SIZE_UP
                  : EnumQuoteStatus.SIZE_DOWN,
            });
          }
        }

        return acc;
      },
      [...prev],
    );

    return EnumQuoteType.ASK === type
      ? result.slice(maxRows * -1)
      : result.slice(0, maxRows);
  }

  return (maxRows: number) =>
    useReducer<Types.ReducerState, [Types.ReducerAction]>(
      (state, { maxRows, ...action }) => {
        const isReset = action.type === 'reset';

        if (!isReset) {
          const { type, seqNum, asks, bids } = action;

          switch (type) {
            case EnumQuoteAction.SNAPSHOT:
              //* 初始取得的 Quote 資料。已由大而小排序，所以前端只需要將 price / size 轉換成數字即可
              return {
                seq: seqNum,
                maxRows,
                error: false,
                asks: asks
                  .slice(maxRows * -1)
                  .map((quote) =>
                    getQuote({ type: EnumQuoteType.ASK, seq: seqNum, quote }),
                  ),
                bids: bids
                  .slice(0, maxRows)
                  .map((quote) =>
                    getQuote({ type: EnumQuoteType.BID, seq: seqNum, quote }),
                  ),
              };

            case EnumQuoteAction.DELTA: {
              //* 持續更新的 Quote 資料
              const newAsks = updateQuotes({
                type: EnumQuoteType.ASK,
                seq: seqNum,
                maxRows,
                prev: state.asks,
                curr: asks,
              });

              const newBids = updateQuotes({
                type: EnumQuoteType.BID,
                seq: seqNum,
                maxRows,
                prev: state.bids,
                curr: bids,
              });

              const lastAsk = newAsks[newAsks.length - 1];
              const firstBid = newBids[0];

              return {
                seq: seqNum,
                maxRows,
                error: seqNum - state.seq !== 1 || lastAsk.price < firstBid.price,
                asks: newAsks,
                bids: newBids,
              };
            }

            default:
          }
        }

        return isReset ? getInitState(maxRows) : state;
      },
      getInitState(maxRows),
    );
})();
