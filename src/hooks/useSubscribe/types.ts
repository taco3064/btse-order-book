export interface WebSocketInput<T> {
  url: `wss://ws.btse.com/${string}`;
  key: string;
  onMessage: (data: T) => void;
}
