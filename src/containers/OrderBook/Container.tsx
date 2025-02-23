import cx from 'clsx';
import numeral from 'numeral';

import { ArrowIcon, Table } from '~bob/components';
import { EnumLastStatus, EnumQuoteType, useQuoteData, useLastPrice } from '~bob/hooks';
import { useQuoteColumns } from './hooks';
import type { OrderBookProps } from './types';

export default function OrderBook({ entryCount, orderCode }: OrderBookProps) {
  const { seq, asks, bids } = useQuoteData(entryCount, orderCode);
  const { lastPrice, status } = useLastPrice(orderCode);

  const columns = useQuoteColumns(entryCount, seq, {
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
        summary={{
          rows: 8,
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
