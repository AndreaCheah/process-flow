import { AgGridReact } from 'ag-grid-react';
import type { ColDef } from 'ag-grid-community';
import { themeQuartz } from 'ag-grid-community';

interface PaginatedTableProps<T = any> {
  columnDefs: ColDef<T>[];
  rowData: T[];
}

export default function PaginatedTable<T = any>({
  columnDefs,
  rowData,
}: PaginatedTableProps<T>) {
  return (
    <AgGridReact<T>
      theme={themeQuartz}
      columnDefs={columnDefs}
      rowData={rowData}
      domLayout='autoHeight'
      pagination={true}
      paginationPageSize={10}
      paginationPageSizeSelector={[10, 25, 50, 100]}
      defaultColDef={{
        sortable: true,
        filter: true,
        resizable: true,
        flex: 1,
      }}
      animateRows={true}
    />
  );
}
