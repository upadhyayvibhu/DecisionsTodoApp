
import { useMemo, useState } from "react";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table";

import type { Todo } from "../types/todo";
import "./TodoTable.css";

type TodoTableProps = {
  todos: Todo[];
  onToggleComplete: (todo: Todo) => void;
  onEdit: (todo: Todo) => void;
  onDelete: (id: string) => void;
};

export default function TodoTable({
  todos,
  onToggleComplete,
  onEdit,
  onDelete,
}: TodoTableProps) {
  const [globalFilter, setGlobalFilter] = useState("");
  const [category, setCategory] = useState("");
  const [priority, setPriority] = useState("");
  const [status, setStatus] = useState("");

  const columns = useMemo<ColumnDef<Todo>[]>(
    () => [
      {
        id: "select",
        header: ({ table }) => (
          <input
            type="checkbox"
            aria-label="Select all todos on this page"
            checked={table.getIsAllPageRowsSelected()}
            ref={(el) => {
              if (el) {
                el.indeterminate =
                  table.getIsSomePageRowsSelected();
              }
            }}
            onChange={table.getToggleAllPageRowsSelectedHandler()}
          />
        ),
        cell: ({ row }) => (
          <input
            type="checkbox"
            aria-label={`Select ${row.original.title}`}
            checked={row.getIsSelected()}
            onChange={row.getToggleSelectedHandler()}
          />
        ),
        enableSorting: false,
      },
      {
        id: "title",
        accessorFn: (todo) =>
          `${todo.title} ${todo.description}`,
        header: "Title",
        cell: ({ row }) => (
          <div className="todo-title">
            <span>{row.original.title}</span>
            <small>{row.original.description}</small>
          </div>
        ),
      },
      {
        accessorKey: "category",
        header: "Category",
        cell: ({ getValue }) => (
          <span className={`badge ${String(getValue()).toLowerCase()}`}>
            {String(getValue())}
          </span>
        ),
      },
      {
        accessorKey: "priority",
        header: "Priority",
        cell: ({ getValue }) => (
          <span className={`badge ${String(getValue()).toLowerCase()}`}>
            {String(getValue())}
          </span>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => (
          <button
            type="button"
            className={`badge ${
              row.original.status === "Completed"
                ? "completed"
                : "pending"
            }`}
            onClick={() => onToggleComplete(row.original)}
          >
            {row.original.status}
          </button>
        ),
      },
      {
        accessorKey: "createdAt",
        header: "Created At",
        cell: ({ getValue }) =>
          new Date(String(getValue())).toLocaleDateString(
            "en-US",
            {
              month: "short",
              day: "2-digit",
              year: "numeric",
              timeZone: "UTC",
            }
          ),
      },
      {
        id: "actions",
        header: "Actions",
        enableSorting: false,
        cell: ({ row }) => (
          <div className="todo-actions">
            <button
              type="button"
              aria-label={`Edit ${row.original.title}`}
              onClick={() => onEdit(row.original)}
            >
              ✎
            </button>
            <button
              type="button"
              aria-label={`Delete ${row.original.title}`}
              onClick={() => onDelete(row.original.id)}
            >
              🗑
            </button>
          </div>
        ),
      },
    ],
    [onToggleComplete, onEdit, onDelete]
  );

  const table = useReactTable({
    data: todos,
    columns,
    getRowId: (todo) => todo.id,
    state: {
      globalFilter,
      columnFilters: [
        ...(category ? [{ id: "category", value: category }] : []),
        ...(priority ? [{ id: "priority", value: priority }] : []),
        ...(status ? [{ id: "status", value: status }] : []),
      ],
    },
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: "includesString",
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 9,
      },
    },
  });

  return (
    <section className="todo-table-card">
      <div className="todo-toolbar">
        <input
          type="search"
          placeholder="Search todos..."
          aria-label="Search todos"
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
        />

        <select
          aria-label="Filter by category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="">All Categories</option>
          <option value="Work">Work</option>
          <option value="Personal">Personal</option>
        </select>

        <select
          aria-label="Filter by priority"
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
        >
          <option value="">All Priorities</option>
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
        </select>

        <select
          aria-label="Filter by status"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="">All Status</option>
          <option value="Completed">Completed</option>
          <option value="Pending">Pending</option>
        </select>

        <button
          type="button"
          onClick={() => {
            setGlobalFilter("");
            setCategory("");
            setPriority("");
            setStatus("");
            table.resetPageIndex();
          }}
        >
          Clear
        </button>
      </div>

      <div className="todo-table-scroll">
        <table className="todo-table">
          <thead>
            {table.getHeaderGroups().map((group) => (
              <tr key={group.id}>
                {group.headers.map((header) => (
                  <th key={header.id}>
                    {header.isPlaceholder ? null : (
                      <div
                        className={
                          header.column.getCanSort()
                            ? "sortable-header"
                            : ""
                        }
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                        {{
                          asc: " ↑",
                          desc: " ↓",
                        }[header.column.getIsSorted() as string] ?? ""}
                      </div>
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>

          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                className={
                  row.original.status === "Completed"
                    ? "completed-row"
                    : ""
                }
              >
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id}>
                    {flexRender(
                      cell.column.columnDef.cell,
                      cell.getContext()
                    )}
                  </td>
                ))}
              </tr>
            ))}

            {table.getRowModel().rows.length === 0 && (
              <tr>
                <td colSpan={columns.length} className="empty-state">
                  No todos found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="todo-pagination">
        <span>
          Showing {table.getRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} filtered todos
        </span>

        <div>
          <button
            type="button"
            disabled={!table.getCanPreviousPage()}
            onClick={() => table.previousPage()}
          >
            ‹
          </button>

          <span>
            Page {table.getState().pagination.pageIndex + 1} of{" "}
            {Math.max(table.getPageCount(), 1)}
          </span>

          <button
            type="button"
            disabled={!table.getCanNextPage()}
            onClick={() => table.nextPage()}
          >
            ›
          </button>
        </div>
      </div>
    </section>
  );
}
