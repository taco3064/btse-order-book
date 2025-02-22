import cx from 'clsx';
import numeral from 'numeral';
import { useMemo } from 'react';

import type { ColumnConfig } from '~bob/components';
import type { OrderEntry } from '~bob/hooks';

export function useEntryColumns(entryCount: number) {
  return useMemo<ColumnConfig<OrderEntry>[]>(
    () => [
      {
        key: 'price',
        label: 'Price (USD)',
        render: ({ price }) => numeral(price).format('0,0.0'),
        classes: {
          header: 'py-1 text-left w-4/10',
          cell: ({ type }) => cx('py-1', `text-price-${type}`),
        },
      },
      {
        key: 'size',
        label: 'Size',
        render: ({ size }) => numeral(size).format('0,0'),
        classes: { header: 'py-1 text-right w-3/10', cell: () => cx('py-1 text-right') },
      },
      {
        key: 'total',
        label: 'Total',
        classes: { header: 'py-1 text-right w-3/10', cell: () => cx('py-1 text-right') },
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
