import { useState } from 'react';
import type { ExperimentResults } from '../types/reportTypes';
import { ReportService } from '../services/reportService';
import { PDFGenerator } from '../services/pdfGenerator';
import ImpactPieChart from './charts/ImpactPieChart';
import KPILineChart from './charts/KPILineChart';

export default function ReportGenerator() {
  const [apiKey, setApiKey] = useState('');
  const [jsonData, setJsonData] = useState<ExperimentResults | null>(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target?.result as string);
        setJsonData(json);
        setStatus('JSON file loaded successfully');
        setError('');
      } catch (err) {
        setError('Invalid JSON file');
        setJsonData(null);
      }
    };
    reader.readAsText(file);
  };

  const generateReport = async () => {
    if (!apiKey.trim()) {
      setError('Please enter your Gemini API key');
      return;
    }

    if (!jsonData) {
      setError('Please load JSON data first');
      return;
    }

    setLoading(true);
    setError('');
    setStatus('Generating report...');

    try {
      setStatus('Analyzing data with Gemini AI...');
      const reportService = new ReportService(apiKey);
      const insights = await reportService.generateInsights(jsonData.data);

      setStatus('Creating PDF report...');
      const pdfGenerator = new PDFGenerator();
      pdfGenerator.generateReport(jsonData.data, insights);

      setStatus('Report generated successfully! Check your downloads folder.');
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate report');
      setStatus('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h2>Experiment Report Generator</h2>
      <p style={{ color: '#666', fontSize: '14px' }}>
        Upload your experiment JSON results or use mock data to generate a comprehensive PDF report
        with AI-powered insights.
      </p>

      <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <div>
          <label htmlFor="apiKey" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Gemini API Key:
          </label>
          <input
            id="apiKey"
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="Enter your Gemini API key"
            style={{
              width: '100%',
              padding: '8px',
              fontSize: '14px',
              border: '1px solid #ccc',
              borderRadius: '4px',
            }}
          />
        </div>

        <div>
          <label htmlFor="fileUpload" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Upload JSON File:
          </label>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <input
              id="fileUpload"
              type="file"
              accept=".json"
              onChange={handleFileUpload}
              style={{
                flex: 1,
                padding: '8px',
                fontSize: '14px',
                border: '1px solid #ccc',
                borderRadius: '4px',
              }}
            />
          </div>
        </div>

        <button
          onClick={generateReport}
          disabled={loading || !jsonData || !apiKey}
          style={{
            padding: '12px 24px',
            fontSize: '16px',
            fontWeight: 'bold',
            color: 'white',
            backgroundColor: loading || !jsonData || !apiKey ? '#ccc' : '#007bff',
            border: 'none',
            borderRadius: '4px',
            cursor: loading || !jsonData || !apiKey ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? 'Generating Report...' : 'Generate PDF Report'}
        </button>

        {status && (
          <div
            style={{
              padding: '10px',
              backgroundColor: '#d4edda',
              color: '#155724',
              border: '1px solid #c3e6cb',
              borderRadius: '4px',
            }}
          >
            {status}
          </div>
        )}

        {error && (
          <div
            style={{
              padding: '10px',
              backgroundColor: '#f8d7da',
              color: '#721c24',
              border: '1px solid #f5c6cb',
              borderRadius: '4px',
            }}
          >
            <strong>Error:</strong> {error}
          </div>
        )}

        {jsonData && (
          <div
            style={{
              marginTop: '10px',
              padding: '15px',
              backgroundColor: '#f8f9fa',
              border: '1px solid #dee2e6',
              borderRadius: '4px',
            }}
          >
            <h4 style={{ margin: '0 0 10px 0' }}>Loaded Data Summary:</h4>
            <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '14px' }}>
              <li>Total Scenarios: {jsonData.data.simulated_summary.simulated_data.length}</li>
              <li>Top Variables: {jsonData.data.top_variables.length}</li>
              <li>KPI: {jsonData.data.simulated_summary.simulated_data[0]?.kpi || 'N/A'}</li>
              <li>
                KPI Range:{' '}
                {Math.min(...jsonData.data.simulated_summary.simulated_data.map((s) => s.kpi_value)).toFixed(2)} -{' '}
                {Math.max(...jsonData.data.simulated_summary.simulated_data.map((s) => s.kpi_value)).toFixed(2)}
              </li>
            </ul>
          </div>
        )}
      </div>

      {jsonData && (
        <div style={{ marginTop: '40px' }}>
          <h2 style={{ marginBottom: '20px', color: '#2c3e50' }}>Analytics Dashboard</h2>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))',
              gap: '20px',
            }}
          >
            <div style={chartCardStyle}>
              <ImpactPieChart data={jsonData.data} />
            </div>

            <div style={chartCardStyle}>
              <KPILineChart data={jsonData.data} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const chartCardStyle = {
  backgroundColor: 'white',
  padding: '20px',
  borderRadius: '8px',
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
};
