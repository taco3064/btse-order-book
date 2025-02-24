import cx from 'clsx';
import numeral from 'numeral';

import { ArrowIcon, Table } from '~bob/components';
import { useQuoteColumns } from './hooks';
import type { OrderBookProps } from './types';

import {
  EnumLastStatus,
  EnumQuoteType,
  useQuoteSubscribe,
  useLastPriceSubscribe,
} from '~bob/hooks';

export default function OrderBook({ maxRows, orderCode }: OrderBookProps) {
  const { seq, asks, bids } = useQuoteSubscribe(maxRows, orderCode);
  const { lastPrice, status } = useLastPriceSubscribe(orderCode);

  const columns = useQuoteColumns(maxRows, seq, {
    [EnumQuoteType.ASK]: asks.reduce((acc, { size }) => acc + size, 0),
    [EnumQuoteType.BID]: bids.reduce((acc, { size }) => acc + size, 0),
  });

  return (
    <div className="container max-w-xs">
      <h1 className="text-typography text-lg">Order Book</h1>

      <Table
        classes={{ root: 'order-book' }}
        columns={columns}
        data={[...asks, ...bids]}
        loading={!asks.length && !bids.length}
        skeletonRows={maxRows * 2}
        summary={{
          rows: maxRows,
          content: (
            <div className={cx('last-price', `status-${status}`)}>
              {!lastPrice ? <>&nbsp;</> : numeral(lastPrice).format('0,0.0')}

              {EnumLastStatus.Neutral !== status && <ArrowIcon direction={status} />}
            </div>
          ),
        }}
      />
    </div>
  );
}
