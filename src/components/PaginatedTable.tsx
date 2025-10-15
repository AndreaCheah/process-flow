import { AgGridReact } from 'ag-grid-react';
import type { ColDef, CellValueChangedEvent, GridReadyEvent } from 'ag-grid-community';
import { themeQuartz } from 'ag-grid-community';
import { useTheme } from '../contexts/ThemeContext';

interface PaginatedTableProps<T = any> {
  columnDefs: ColDef<T>[];
  rowData: T[];
  onCellValueChanged?: (event: CellValueChangedEvent<T>) => void;
  rowSelection?: 'single' | 'multiple';
  onGridReady?: (event: GridReadyEvent<T>) => void;
}

const darkTheme = themeQuartz.withParams({
  backgroundColor: '#141414',
  foregroundColor: 'rgba(255, 255, 255, 0.85)',
  headerBackgroundColor: '#1f1f1f',
  headerTextColor: 'rgba(255, 255, 255, 0.85)',
  oddRowBackgroundColor: '#141414',
  rowHoverColor: 'rgba(24, 144, 255, 0.08)',
  selectedRowBackgroundColor: 'rgba(24, 144, 255, 0.15)',
  borderColor: '#434343',
  wrapperBorderRadius: '8px',
  spacing: '8px',
});

const lightTheme = themeQuartz.withParams({
  backgroundColor: '#ffffff',
  foregroundColor: 'rgba(0, 0, 0, 0.85)',
  headerBackgroundColor: '#fafafa',
  headerTextColor: 'rgba(0, 0, 0, 0.85)',
  oddRowBackgroundColor: '#ffffff',
  rowHoverColor: 'rgba(24, 144, 255, 0.04)',
  selectedRowBackgroundColor: 'rgba(24, 144, 255, 0.08)',
  borderColor: '#d9d9d9',
  wrapperBorderRadius: '8px',
  spacing: '8px',
});

export default function PaginatedTable<T = any>({
  columnDefs,
  rowData,
  onCellValueChanged,
  rowSelection,
  onGridReady,
}: PaginatedTableProps<T>) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <AgGridReact<T>
      theme={isDark ? darkTheme : lightTheme}
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
