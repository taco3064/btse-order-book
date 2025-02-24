export enum EnumLastStatus {
  Down = 'down',
  Neutral = 'neutral',
  Up = 'up',
}

export type ReducerAction = {
  price: number;
}[];

export type ReducerState = {
  uid: string;
  lastPrice: number;
  status: EnumLastStatus;
};
