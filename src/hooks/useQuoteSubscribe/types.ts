import type { JsonObject } from 'type-fest';

//* 資料更新的動作
export enum EnumQuoteAction {
  SNAPSHOT = 'snapshot', // 初始取得
  DELTA = 'delta', // 持續更新
}

//* 報價類型
export enum EnumQuoteType {
  ASK = 'ask', // Sell
  BID = 'bid', // Buy
}

//* 報價資料狀態
export enum EnumQuoteStatus {
  INIT = 'init', // 初始匯入
  NEW_PRICE = 'new', // 新加入之價格
  SIZE_UP = 'up', // 數量增加
  SIZE_DOWN = 'down', // 數量減少
}

//* Variables
export type QuoteArray = [string, string];

export interface QuoteData extends JsonObject {
  type: EnumQuoteType;
  seq: number;
  status: EnumQuoteStatus;
  price: number;
  size: number;
}

export interface QuoteMessage {
  type: EnumQuoteAction;
  seqNum: number;
  prevSeqNum: number;
  asks: QuoteArray[];
  bids: QuoteArray[];
}

export interface ReducerState {
  seq: number;
  asks: QuoteData[];
  bids: QuoteData[];
  maxRows: number;
  error: boolean;
}

export interface ReducerAction extends QuoteMessage {
  maxRows: number;
}

//* For Functions
export interface GetQuoteInput {
  seq: number;
  type: EnumQuoteType;
  status?: EnumQuoteStatus.INIT | EnumQuoteStatus.NEW_PRICE;
  quote: QuoteArray;
}

export interface UpdateQuoteInput {
  seq: number;
  type: EnumQuoteType;
  maxRows: number;
  prev: QuoteData[];
  curr: QuoteArray[];
}
