import cx from 'clsx';
import numeral from 'numeral';

import type { ColumnConfig } from '~bob/components';
import { EnumQuoteStatus, EnumQuoteType, type QuoteData } from '~bob/hooks';

export function useQuoteColumns(
  maxRows: number,
  currSeq: number,
  totals: Record<EnumQuoteType, number>,
): ColumnConfig<QuoteData>[] {
  return [
    {
      key: 'price',
      label: 'Price (USD)',
      render: ({ price }) => numeral(price).format('0,0.0'),
      classes: {
        cell: ({ seq, type, status }) =>
          cx(type, {
            new: seq === currSeq && status === EnumQuoteStatus.NEW_PRICE,
          }),
      },
    },
    {
      key: 'size',
      label: 'Size',
      render: ({ size }) => numeral(size).format('0,0'),
      classes: {
        cell: ({ seq, status }) =>
          cx({
            up: seq === currSeq && status === EnumQuoteStatus.SIZE_UP,
            down: seq === currSeq && status === EnumQuoteStatus.SIZE_DOWN,
          }),
      },
    },
    {
      key: 'total',
      label: 'Total',
      render: ({ type, size }, i, arr) => {
        const { [type]: total } = totals;

        const sum =
          size +
          (type === 'ask' ? arr.slice(i + 1, maxRows) : arr.slice(maxRows, i)).reduce(
            (acc, { size }) => acc + size,
            0,
          );

        return (
          <div className="accum-total-size">
            <div
              className={cx('bar', {
                'bg-content-down': type === EnumQuoteType.ASK,
                'bg-content-up': type === EnumQuoteType.BID,
              })}
              style={{ width: `${(sum / total) * 100}%` }}
            />

            {numeral(sum).format('0,0')}
          </div>
        );
      },
    },
  ];
}
