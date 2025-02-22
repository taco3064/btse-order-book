import type { JsonObject } from 'type-fest';

export type OrderEntryArray = [string, string];

export interface OrderEntry extends JsonObject {
  type: 'ask' | 'bid';
  price: number;
  size: number;
}

export interface OrderAction {
  type: 'snapshot' | 'delta';
  seqNum: number;
  prevSeqNum: number;
  asks: OrderEntryArray[]; //* Sell
  bids: OrderEntryArray[]; //* Buy
}

export interface OrderState {
  seq: number;
  asks: OrderEntry[];
  bids: OrderEntry[];
}
