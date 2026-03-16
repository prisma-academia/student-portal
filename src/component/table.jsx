import * as React from "react";
import Table from "@mui/joy/Table";
import Sheet from "@mui/joy/Sheet";

export default function CustomTable({ columns, rows }) {
    return (
      <React.Fragment>
        <Sheet
          variant="outlined"
          sx={{
            width: "100%",
            borderRadius: "sm",
            height: "auto",
            maxHeight: "500px",
            overflow: "auto",
          }}
        >
          <Table aria-labelledby="tableTitle" stickyHeader hoverRow>
            <thead>
              <tr>
                {columns.map((column) => (
                  <th
                    key={column.accessorKey}
                    style={{ 
                      width: column.width, 
                      padding: "12px 6px",
                      position: "sticky",
                      top: 0,
                      backgroundColor: "var(--joy-palette-background-surface)",
                      zIndex: 2
                    }}
                  >
                    {column.columnLabel}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr key={row.id || index}>
                  {columns.map((column) => (
                    <td key={column.accessorKey} style={{ padding: "8px 6px" }}>
                      {column.renderCell(row)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </Table>
        </Sheet>
      </React.Fragment>
    );
  }