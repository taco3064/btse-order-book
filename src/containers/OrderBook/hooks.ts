import cx from 'clsx';
import numeral from 'numeral';

import type { ColumnConfig } from '~bob/components';
import { EnumQuoteStatus, type QuoteData } from '~bob/hooks';

export function useQuoteColumns(
  entryCount: number,
  currSeq: number,
): ColumnConfig<QuoteData>[] {
  return [
    {
      key: 'price',
      label: 'Price (USD)',
      render: ({ price }) => numeral(price).format('0,0.0'),
      classes: {
        cell: ({ seq, type, action }) =>
          cx(type, {
            new: seq === currSeq && action === EnumQuoteStatus.NEW_PRICE,
          }),
      },
    },
    {
      key: 'size',
      label: 'Size',
      render: ({ size }) => numeral(size).format('0,0'),
      classes: {
        cell: ({ seq, action }) =>
          cx({
            up: seq === currSeq && action === EnumQuoteStatus.SIZE_UP,
            down: seq === currSeq && action === EnumQuoteStatus.SIZE_DOWN,
          }),
      },
    },
    {
      key: 'total',
      label: 'Total',
      render: ({ type, size }, i, arr) => {
        const all =
          type === 'ask' ? arr.slice(i + 1, entryCount) : arr.slice(entryCount, i);

        return numeral(all.reduce((acc, { size }) => acc + size, 0) + size).format('0,0');
      },
    },
  ];
}
