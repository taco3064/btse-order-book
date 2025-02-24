import { nanoid } from 'nanoid';
import { EnumLastStatus, type ReducerState, type ReducerAction } from './types';

export function getInitState(): ReducerState {
  return {
    uid: nanoid(),
    lastPrice: -1,
    status: EnumLastStatus.Neutral,
  };
}

export function reducer(state: ReducerState, action: ReducerAction): ReducerState {
  switch (state.lastPrice) {
    case -1: {
      const [{ price: lastPrice }, { price: prevPrice }] = action;

      return {
        uid: state.uid,
        lastPrice,
        status: getStatus(lastPrice, prevPrice),
      };
    }

    default: {
      try {
        const [{ price: lastPrice }] = action;

        return {
          uid: state.uid,
          lastPrice,
          status: getStatus(lastPrice, state.lastPrice),
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
