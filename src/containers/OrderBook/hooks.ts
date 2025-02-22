import cx from 'clsx';
import numeral from 'numeral';
import { useMemo } from 'react';

import type { ColumnConfig } from '~bob/components';
import type { QuoteData } from '~bob/hooks';

export function useQuoteColumns(entryCount: number) {
  return useMemo<ColumnConfig<QuoteData>[]>(
    () => [
      {
        key: 'price',
        label: 'Price (USD)',
        render: ({ price }) => numeral(price).format('0,0.0'),
        classes: {
          cell: ({ type }) => cx(`type-${type}`),
        },
      },
      {
        key: 'size',
        label: 'Size',
        render: ({ size }) => numeral(size).format('0,0'),
      },
      {
        key: 'total',
        label: 'Total',
        render: ({ type, size }, i, arr) => {
          const all =
            type === 'ask' ? arr.slice(i + 1, entryCount) : arr.slice(entryCount, i);

          return numeral(all.reduce((acc, { size }) => acc + size, 0) + size).format(
            '0,0',
          );
        },
      },
    ],
    [entryCount],
  );
}
