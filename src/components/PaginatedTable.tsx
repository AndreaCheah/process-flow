import { AgGridReact } from 'ag-grid-react';
import type { ColDef, CellValueChangedEvent, GridReadyEvent } from 'ag-grid-community';
import { themeQuartz } from 'ag-grid-community';

interface PaginatedTableProps<T = any> {
  columnDefs: ColDef<T>[];
  rowData: T[];
  onCellValueChanged?: (event: CellValueChangedEvent<T>) => void;
  rowSelection?: 'single' | 'multiple';
  onGridReady?: (event: GridReadyEvent<T>) => void;
}

export default function PaginatedTable<T = any>({
  columnDefs,
  rowData,
  onCellValueChanged,
  rowSelection,
  onGridReady,
}: PaginatedTableProps<T>) {
  return (
    <AgGridReact<T>
      theme={themeQuartz}
      columnDefs={columnDefs}
      rowData={rowData}
      domLayout='autoHeight'
      pagination
      paginationPageSize={10}
      paginationPageSizeSelector={[10, 25, 50, 100]}
      defaultColDef={{
        sortable: true,
        filter: true,
        resizable: true,
        flex: 1,
      }}
      animateRows
      onCellValueChanged={onCellValueChanged}
      rowSelection={rowSelection}
      onGridReady={onGridReady}
    />
  );
}
