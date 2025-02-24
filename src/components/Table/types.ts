import type { JsonObject, Paths } from 'type-fest';
import type { ReactNode } from 'react';

export interface ColumnConfig<T extends JsonObject> {
  fieldName?: Paths<T>;
  key: string;
  label?: string;
  render?: (data: T, rowIndex: number, allData: T[]) => ReactNode;

  classes?: Classes<
    'header' | 'cell',
    {
      header: string;
      cell: (data: T, rowIndex: number, allData: T[]) => string;
    }
  >;
}

export interface TableProps<T extends JsonObject> {
  classes?: Classes<'root' | 'row' | 'tbody' | 'thead'>;
  columns: ColumnConfig<T>[];
  data?: T[];
  loading?: boolean;
  skeletonRows?: number;

  summary?: {
    rows?: number;
    content: ReactNode;
  };
}
