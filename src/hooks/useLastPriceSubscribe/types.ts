export enum EnumLastStatus {
  Down = 'down',
  Neutral = 'neutral',
  Up = 'up',
}

export type LastPriceAction = {
  price: number;
}[];

export type LastPriceState = {
  error: boolean;
  lastPrice: number;
  status: EnumLastStatus;
};
