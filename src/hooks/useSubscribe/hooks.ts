import { useEffect, useImperativeHandle, useRef } from 'react';
import type { JsonPrimitive } from 'type-fest';

import type { SubscribeConfig } from './types';

export function useSubscribe<T>(
  config: () => SubscribeConfig<T>,
  deps: JsonPrimitive[] = [],
) {
  const { uid, url, key } = config();

  const configRef = useRef(config);
  const depsString = JSON.stringify(deps);

  useImperativeHandle(configRef, () => config, [config]);

  useEffect(() => {
    // TODO - onerror 相關的資訊不足，暫不增加相關處理
    const socket = new WebSocket(url);

    socket.onopen = () => socket.send(JSON.stringify({ op: 'subscribe', args: [key] }));

    socket.onmessage = ({ data }) => {
      const { onMessage } = configRef.current();
      const { data: content }: { data: T } = JSON.parse(data);

      if (content) {
        onMessage(content);
      }
    };

    return () => socket.close();
  }, [uid, url, key, depsString]);
}
