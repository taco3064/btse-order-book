import { useEffect, useReducer } from 'react';
import { EnumLastStatus, type LastPriceAction, type LastPriceState } from './types';

export function useLastPrice(orderCode: string) {
  const [{ error, lastPrice, status }, dispatch] = useLastPriceReducer();

  useEffect(() => {
    if (!error) {
      const socket = new WebSocket('wss://ws.btse.com/ws/futures');

      socket.onclose = () => dispatch('reset');

      socket.onopen = () =>
        socket.send(
          JSON.stringify({
            op: 'subscribe',
            args: [`tradeHistoryApi:${orderCode}`],
          }),
        );

      socket.onmessage = ({ data }) => {
        const { data: action }: { data: LastPriceAction } = JSON.parse(data);

        if (action) {
          dispatch(action);
        }
      };

      return () => socket.close();
    }
  }, [error, orderCode, dispatch]);

  return {
    lastPrice: lastPrice <= 0 ? null : lastPrice,
    status,
  };
}

const useLastPriceReducer = (() => {
  function getInitState(): LastPriceState {
    return {
      lastPrice: -1,
      status: EnumLastStatus.Neutral,
      error: false,
    };
  }

  function getStatus(lastPrice: number, prevPrice: number): EnumLastStatus {
    if (lastPrice > prevPrice) {
      return EnumLastStatus.Up;
    } else if (lastPrice < prevPrice) {
      return EnumLastStatus.Down;
    }

    return EnumLastStatus.Neutral;
  }

  return () =>
    useReducer<LastPriceState, [LastPriceAction | 'reset']>((state, action) => {
      const isReset = action === 'reset';

      if (!isReset) {
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

              return {
                ...state,
                error: true,
              };
            }
          }
        }
      }

      return isReset ? getInitState() : state;
    }, getInitState());
})();
