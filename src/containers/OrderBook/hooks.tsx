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
            //* 若異動 seq 與當前 seq 相同，且報價被標示為新價格
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
            //* 若異動 seq 與當前 seq 相同，且數量被標示為增加
            up: seq === currSeq && status === EnumQuoteStatus.SIZE_UP,
            //* 若異動 seq 與當前 seq 相同，且數量被標示為減少
            down: seq === currSeq && status === EnumQuoteStatus.SIZE_DOWN,
          }),
      },
    },
    {
      key: 'total',
      label: 'Total',
      render: ({ type, size }, i, arr) => {
        //* 依報價類別取得對應總數量
        const { [type]: total } = totals;

        //* 計算累積數量
        const accum =
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
              style={{
                //* 透過 style 動態計算寬度 (Tailwind 不支援)
                width: `${(accum / total) * 100}%`,
              }}
            />

            {numeral(accum).format('0,0')}
          </div>
        );
      },
    },
  ];
}
