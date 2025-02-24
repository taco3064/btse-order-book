import _get from 'lodash/get';
import cx from 'clsx';
import type { JsonObject } from 'type-fest';
import type { TableProps } from './types';

export default function Table<T extends JsonObject>({
  classes,
  columns,
  data,
  loading = false,
  skeletonRows = 3,
  summary,
}: TableProps<T>) {
  const rows = loading
    ? Array.from({ length: skeletonRows }).map((_, i) => (
        <tr key={i} className={classes?.row}>
          {columns.map(({ key }) => (
            <td key={key} className={key}>
              <div className="skeleton" />
            </td>
          ))}
        </tr>
      ))
    : data?.map((rowData, i) => (
        <tr key={i} className={classes?.row}>
          {columns.map(({ key, classes, fieldName, render }) => (
            <td key={key} className={cx(key, classes?.cell?.(rowData, i, data))}>
              {render?.(rowData, i, data) || _get(rowData, fieldName || [])}
            </td>
          ))}
        </tr>
      ));

  if (summary) {
    rows?.splice(
      summary.rows == null ? rows.length : summary.rows,
      0,
      <tr key="summary" className="summary-row">
        <td colSpan={columns.length}>{summary?.content}</td>
      </tr>,
    );
  }

  return (
    <table className={cx(classes?.root, { 'animate-pulse': loading })}>
      <thead className={classes?.thead}>
        <tr>
          {columns.map(({ key, label, classes }) => (
            <th key={key} className={cx(key, classes?.header)}>
              {label || <>&nbsp;</>}
            </th>
          ))}
        </tr>
      </thead>

      <tbody className={classes?.tbody}>{rows}</tbody>
    </table>
  );
}
