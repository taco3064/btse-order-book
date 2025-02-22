import type { JsonObject } from 'type-fest';

export type QuoteArray = [string, string];

export interface QuoteData extends JsonObject {
  type: 'ask' | 'bid';
  price: number;
  size: number;
}

export interface QuoteAction {
  type: 'snapshot' | 'delta';
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
