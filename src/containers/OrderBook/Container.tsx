import { Table } from '~bob/components';
import { useEntryColumns, useOrderSocket } from './hooks';
import type { OrderBookProps } from './types';

export default function OrderBook({ entryCount }: OrderBookProps) {
  const { asks, bids } = useOrderSocket(entryCount);
  const columns = useEntryColumns(entryCount);

  return (
    <div className="flex flex-col flex-nowrap w-60">
      <h1 className="text-typography text-lg">Order Book</h1>

      <Table
        classes={{ thead: 'text-sm', row: 'hover:bg-content-hover' }}
        columns={columns}
        data={[...asks, ...bids]}
        summary={{
          rows: 8,
          content: 'Summary',
        }}
      />
    </div>
  );
}
