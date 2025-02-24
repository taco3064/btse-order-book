export interface SubscribeConfig<T> {
  uid: string;
  url: `wss://ws.btse.com/${string}`;
  key: string;
  onMessage: (data: T) => void;
}
