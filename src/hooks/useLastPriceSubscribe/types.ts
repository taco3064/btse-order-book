export enum EnumLastStatus {
  Down = 'down',
  Neutral = 'neutral',
  Up = 'up',
}

export type ReducerAction = {
  price: number;
}[];

export type ReducerState = {
  error: boolean;
  lastPrice: number;
  status: EnumLastStatus;
};
