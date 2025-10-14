import PaginatedTable from "./components/PaginatedTable";
import type { ColDef } from 'ag-grid-community';

type CarData = {
  make: string;
  model: string;
  price: number;
  electric: boolean;
};

function App() {
  const rowData: CarData[] = [
    { make: "Tesla", model: "Model Y", price: 64950, electric: true },
    { make: "Ford", model: "F-Series", price: 33850, electric: false },
    { make: "Toyota", model: "Corolla", price: 29600, electric: false },
    { make: "Mercedes", model: "EQE", price: 74900, electric: true },
    { make: "BMW", model: "3 Series", price: 41250, electric: false },
    { make: "Audi", model: "e-tron", price: 65900, electric: true },
    { make: "Honda", model: "Accord", price: 26520, electric: false },
    { make: "Nissan", model: "Leaf", price: 28140, electric: true },
    { make: "Chevrolet", model: "Silverado", price: 34600, electric: false },
    { make: "Rivian", model: "R1T", price: 73000, electric: true },
    { make: "Volkswagen", model: "ID.4", price: 38995, electric: true },
    { make: "Hyundai", model: "Ioniq 5", price: 41450, electric: true },
  ];

  const columnDefs: ColDef<CarData>[] = [
    { field: "make", headerName: "Make" },
    { field: "model", headerName: "Model" },
    {
      field: "price",
      headerName: "Price",
      valueFormatter: (params) => `$${params.value.toLocaleString()}`
    },
    { field: "electric", headerName: "Electric" }
  ];

  return (
    <div style={{ padding: '20px' }}>
      <h1>Process First LLC - Paginated Table Demo</h1>
      <PaginatedTable
        columnDefs={columnDefs}
        rowData={rowData}
      />
    </div>
  );
}

export default App;
