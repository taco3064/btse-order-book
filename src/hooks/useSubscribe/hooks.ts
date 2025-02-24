import { useEffect, useImperativeHandle, useRef, type DependencyList } from 'react';
import type { WebSocketInput } from './types';

export function useSubscribe<T>(
  { url, key, onMessage }: WebSocketInput<T>,
  deps: DependencyList,
) {
  const onMessageRef = useRef(onMessage);

  useImperativeHandle(onMessageRef, () => onMessage, [onMessage]);

  useEffect(() => {
    // TODO - onerror 相關的資訊不足，暫不增加相關處理
    const socket = new WebSocket(url);

    socket.onopen = () => socket.send(JSON.stringify({ op: 'subscribe', args: [key] }));

    socket.onmessage = ({ data }) => {
      const { data: content }: { data: T } = JSON.parse(data);

      if (content) {
        onMessageRef.current?.(content);
      }
    };

    return () => socket.close();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url, key, ...deps]);
}
