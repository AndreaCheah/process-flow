import ProcessFlow from "./ProcessFlow/ProcessFlow";
import ReportGenerator from "./components/ReportGenerator";

function App() {
  return (
    <div>
      <h1 style={{ padding: '20px', margin: 0, background: '#f8f9fa', borderBottom: '2px solid #dee2e6' }}>
        Process First LLC
      </h1>
      <ProcessFlow />
      <ReportGenerator />
    </div>
  );
}

export default App;
