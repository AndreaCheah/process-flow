import { useState } from 'react';
import { Card, Form, Input, Button, Alert, Typography, Space, Row, Col, Divider } from 'antd';
import { UploadOutlined, FileTextOutlined, PieChartOutlined, LineChartOutlined } from '@ant-design/icons';
import type { ExperimentResults } from '../types/reportTypes';
import { ReportService } from '../services/reportService';
import { PDFGenerator } from '../services/pdfGenerator';
import ImpactPieChart from './charts/ImpactPieChart';
import KPILineChart from './charts/KPILineChart';
import { useTheme } from '../contexts/ThemeContext';

const { Title, Paragraph } = Typography;

export default function ReportGenerator() {
  const { theme } = useTheme();
  const [apiKey, setApiKey] = useState('');
  const [jsonData, setJsonData] = useState<ExperimentResults | null>(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');

  const isDark = theme === 'dark';

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
    <div>
      <Title
        level={2}
        style={{ color: isDark ? 'rgba(255, 255, 255, 0.85)' : 'rgba(0, 0, 0, 0.85)' }}
      >
        Experiment Report
      </Title>
      <Paragraph type="secondary">
        Upload your experiment JSON results to generate a PDF report
        with AI-powered insights.
      </Paragraph>

      <Card style={{ marginBottom: '24px' }}>
        <Form layout="vertical">
          <Form.Item
            label="Gemini API Key"
            required
            tooltip="Your Google Gemini API key for AI-powered insights"
          >
            <Input.Password
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter your Gemini API key"
              size="large"
            />
          </Form.Item>

          <Form.Item
            label="Upload JSON File"
            required
            tooltip="Upload your experiment results in JSON format"
          >
            <input
              type="file"
              accept=".json"
              onChange={handleFileUpload}
              style={{ display: 'none' }}
              id="file-upload"
            />
            <Button
              icon={<UploadOutlined />}
              onClick={() => document.getElementById('file-upload')?.click()}
              block
              size="large"
            >
              Choose JSON File
            </Button>
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              icon={<FileTextOutlined />}
              onClick={generateReport}
              disabled={loading || !jsonData || !apiKey}
              loading={loading}
              size="large"
              block
            >
              {loading ? 'Generating Report...' : 'Generate PDF Report'}
            </Button>
          </Form.Item>
        </Form>

        {status && (
          <Alert
            message="Success"
            description={status}
            type="success"
            showIcon
            closable
            style={{ marginTop: '16px' }}
          />
        )}

        {error && (
          <Alert
            message="Error"
            description={error}
            type="error"
            showIcon
            closable
            style={{ marginTop: '16px' }}
          />
        )}

        {jsonData && (
          <Card type="inner" title="Loaded Data Summary" style={{ marginTop: '16px' }}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <div><strong>Total Scenarios:</strong> {jsonData.data.simulated_summary.simulated_data.length}</div>
              <div><strong>Top Variables:</strong> {jsonData.data.top_variables.length}</div>
              <div><strong>KPI:</strong> {jsonData.data.simulated_summary.simulated_data[0]?.kpi || 'N/A'}</div>
              <div>
                <strong>KPI Range:</strong>{' '}
                {Math.min(...jsonData.data.simulated_summary.simulated_data.map((s) => s.kpi_value)).toFixed(2)} -{' '}
                {Math.max(...jsonData.data.simulated_summary.simulated_data.map((s) => s.kpi_value)).toFixed(2)}
              </div>
            </Space>
          </Card>
        )}
      </Card>

      {jsonData && (
        <div>
          <Divider orientation="left">
            <Space>
              <PieChartOutlined />
              <span>Analytics Dashboard</span>
            </Space>
          </Divider>

          <Row gutter={[16, 16]}>
            <Col xs={24} lg={12}>
              <Card hoverable title={<Space><PieChartOutlined /> Variable Impact Distribution</Space>}>
                <ImpactPieChart data={jsonData.data} />
              </Card>
            </Col>

            <Col xs={24} lg={12}>
              <Card hoverable title={<Space><LineChartOutlined /> KPI Trend Analysis</Space>}>
                <KPILineChart data={jsonData.data} />
              </Card>
            </Col>
          </Row>
        </div>
      )}
    </div>
  );
}
