import type { JsonObject } from 'type-fest';

//* Enums
export enum EnumQuoteAction {
  SNAPSHOT = 'snapshot',
  DELTA = 'delta',
}

export enum EnumQuoteType {
  ASK = 'ask',
  BID = 'bid',
}

export enum EnumQuoteStatus {
  INIT = 'init',
  NEW_PRICE = 'new',
  SIZE_UP = 'up',
  SIZE_DOWN = 'down',
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

export interface QuoteAction {
  type: EnumQuoteAction;
  seqNum: number;
  prevSeqNum: number;
  asks: QuoteArray[]; //* Sell
  bids: QuoteArray[]; //* Buy
}

export interface QuoteState {
  seq: number;
  asks: QuoteData[];
  bids: QuoteData[];
  error: boolean;
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
  prev: QuoteData[];
  curr: QuoteArray[];
}
