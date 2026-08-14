import React from "react";

export interface Column<T> {
  header: string;
  accessor?: keyof T | ((row: T) => React.ReactNode);
  cell?: (row: T, index: number) => React.ReactNode;
  align?: "left" | "center" | "right";
  width?: string;
}

export interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (row: T, index: number) => string | number;
  emptyText?: string;
  loading?: boolean;
}

export function Table<T>({
  columns,
  data,
  keyExtractor,
  emptyText = "No records found.",
  loading = false,
}: TableProps<T>) {
  if (loading) {
    return (
      <div className="table-container">
        <div className="loading-container">
          <div className="spinner spinner-lg" />
          <p className="text-muted text-sm">Loading records...</p>
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="table-container">
        <div className="empty-state">
          <p className="text-muted">{emptyText}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="table-container">
      <table className="data-table">
        <thead>
          <tr>
            {columns.map((col, idx) => (
              <th
                key={idx}
                style={{
                  textAlign: col.align || "left",
                  width: col.width,
                }}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIdx) => (
            <tr key={keyExtractor(row, rowIdx)}>
              {columns.map((col, colIdx) => {
                let content: React.ReactNode = null;
                if (col.cell) {
                  content = col.cell(row, rowIdx);
                } else if (typeof col.accessor === "function") {
                  content = col.accessor(row);
                } else if (col.accessor) {
                  content = (row[col.accessor] as unknown) as React.ReactNode;
                }

                return (
                  <td
                    key={colIdx}
                    style={{ textAlign: col.align || "left" }}
                  >
                    {content}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
