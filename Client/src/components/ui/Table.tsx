import { flexRender, getCoreRowModel, useReactTable, type ColumnDef } from '@tanstack/react-table';
import './Table.css';

interface TableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  getRowId: (row: T) => string;
  isLoading?: boolean;
  emptyMessage?: string;
  rowClassName?: (row: T) => string;
}

/** Generic, presentational table built on TanStack Table. */
export default function Table<T>({
  data,
  columns,
  getRowId,
  isLoading = false,
  emptyMessage = 'No results found.',
  rowClassName,
}: TableProps<T>) {
  const table = useReactTable({ data, columns, getRowId, getCoreRowModel: getCoreRowModel() });
  const columnCount = columns.length;

  return (
    <div className="table-wrap">
      <table className="table">
        <thead>
          {table.getHeaderGroups().map((group) => (
            <tr key={group.id}>
              {group.headers.map((header) => (
                <th key={header.id}>
                  {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {isLoading &&
            Array.from({ length: 5 }, (_, i) => (
              <tr key={i}>
                <td colSpan={columnCount}>
                  <div className="skeleton" />
                </td>
              </tr>
            ))}

          {!isLoading && data.length === 0 && (
            <tr>
              <td colSpan={columnCount} className="table__empty">
                {emptyMessage}
              </td>
            </tr>
          )}

          {!isLoading &&
            table.getRowModel().rows.map((row) => (
              <tr key={row.id} className={rowClassName?.(row.original)}>
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                ))}
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}
