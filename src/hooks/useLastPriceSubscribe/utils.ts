import { EnumLastStatus, type ReducerState, type ReducerAction } from './types';

export function getInitState(): ReducerState {
  return {
    lastPrice: -1,
    status: EnumLastStatus.Neutral,
    error: false,
  };
}

export function reducer(state: ReducerState, action: ReducerAction) {
  switch (state.lastPrice) {
    case -1: {
      const [{ price: lastPrice }, { price: prevPrice }] = action;

      return {
        lastPrice,
        status: getStatus(lastPrice, prevPrice),
        error: false,
      };
    }

    default: {
      try {
        const [{ price: lastPrice }] = action;

        return {
          lastPrice,
          status: getStatus(lastPrice, state.lastPrice),
          error: false,
        };
      } catch (e) {
        console.error(e);

        return getInitState();
      }
    }
  }
}

function getStatus(lastPrice: number, prevPrice: number): EnumLastStatus {
  if (lastPrice > prevPrice) {
    return EnumLastStatus.Up;
  } else if (lastPrice < prevPrice) {
    return EnumLastStatus.Down;
  }

  return EnumLastStatus.Neutral;
}
