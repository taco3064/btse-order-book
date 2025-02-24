import { nanoid } from 'nanoid';

import {
  EnumQuoteAction,
  EnumQuoteStatus,
  EnumQuoteType,
  type GetQuoteInput,
  type QuoteData,
  type ReducerAction,
  type ReducerState,
  type UpdateQuoteInput,
} from './types';

export function getInitState(maxRows: number): ReducerState {
  return {
    uid: nanoid(),
    seq: -1,
    asks: [],
    bids: [],
    maxRows,
  };
}

export function reducer(
  state: ReducerState,
  { maxRows, type, seqNum, asks, bids }: ReducerAction,
): ReducerState {
  switch (type) {
    case EnumQuoteAction.SNAPSHOT:
      //* 初始取得的 Quote 資料。已由大而小排序，所以前端只需要將 price / size 轉換成數字即可
      return {
        uid: state.uid,
        seq: seqNum,
        maxRows,
        asks: asks
          .slice(maxRows * -1)
          .map((quote) => getQuote({ type: EnumQuoteType.ASK, seq: seqNum, quote })),
        bids: bids
          .slice(0, maxRows)
          .map((quote) => getQuote({ type: EnumQuoteType.BID, seq: seqNum, quote })),
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

      const error =
        seqNum - state.seq !== 1 || //? seq 是否連續
        newAsks.length < maxRows || //? asks 是否不足 maxRows
        newBids.length < maxRows || //? bids 是否不足 maxRows
        newAsks[newAsks.length - 1].price < newBids[0].price; //? asks 最低價格是否小於 bids 最高價格

      return {
        uid: !error ? state.uid : nanoid(),
        seq: seqNum,
        maxRows,
        asks: newAsks,
        bids: newBids,
      };
    }

    default:
  }

  return state;
}

function getQuote({
  seq,
  type,
  quote: [price, size],
  status = EnumQuoteStatus.INIT,
}: GetQuoteInput): QuoteData {
  return {
    seq,
    type,
    status,
    price: Number(price),
    size: Number(size),
  };
}

function updateQuotes({ seq, type, maxRows, prev, curr }: UpdateQuoteInput) {
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

        return acc;
      } else if (size && price < acc[acc.length - 1]?.price) {
        //* 新增的 Quote 有最低價格 (必須有 size)
        acc.push(newQuote);

        return acc;
      }

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
            size > prevQuote.size ? EnumQuoteStatus.SIZE_UP : EnumQuoteStatus.SIZE_DOWN,
        });
      }

      return acc;
    },
    [...prev],
  );

  return EnumQuoteType.ASK === type
    ? result.slice(maxRows * -1)
    : result.slice(0, maxRows);
}
