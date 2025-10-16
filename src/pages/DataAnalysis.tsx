import {
  FileTextOutlined,
  LineChartOutlined,
  PieChartOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import {
  Alert,
  Button,
  Card,
  Col,
  Divider,
  Form,
  Input,
  Row,
  Space,
  Typography,
} from "antd";
import { useState } from "react";
import ImpactBarChart from "../components/charts/ImpactBarChart";
import KPILineChart from "../components/charts/KPILineChart";
import VariableKPIScatter from "../components/charts/VariableKPIScatter";
import { useTheme } from "../contexts/ThemeContext";
import { ReportService } from "../services/geminiReportService";
import { PDFGenerator } from "../services/pdfGenerator";
import { ChartImageGenerator } from "../services/chartImageGenerator";
import type { ExperimentResults } from "../types/reportTypes";

const { Title, Paragraph } = Typography;

export default function ReportGenerator() {
  const { theme } = useTheme();
  const [apiKey, setApiKey] = useState("");
  const [jsonData, setJsonData] = useState<ExperimentResults | null>(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  const isDark = theme === "dark";

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target?.result as string);
        setJsonData(json);
        setStatus("JSON file loaded successfully");
        setError("");
      } catch (err) {
        setError("Invalid JSON file");
        setJsonData(null);
      }
    };
    reader.readAsText(file);
  };

  const generateReport = async () => {
    if (!apiKey.trim()) {
      setError("Please enter your Gemini API key");
      return;
    }

    if (!jsonData) {
      setError("Please load JSON data first");
      return;
    }

    setLoading(true);
    setError("");
    setStatus("Generating report...");

    try {
      setStatus("Analyzing data with Gemini AI...");
      const reportService = new ReportService(apiKey);
      const insights = await reportService.generateInsights(jsonData.data);

      setStatus("Generating charts...");
      const chartGen = new ChartImageGenerator();
      const [barChart, lineChart, comparisonChart] = await Promise.all([
        chartGen.generateImpactBarChart(jsonData.data),
        chartGen.generateKPILineChart(jsonData.data),
        chartGen.generateScenarioComparisonChart(jsonData.data),
      ]);

      // Clean up chart generator
      chartGen.destroy();

      setStatus("Creating PDF report...");
      const pdfGenerator = new PDFGenerator();
      pdfGenerator.generateReport(jsonData.data, insights, {
        barChart,
        lineChart,
        comparisonChart,
      });

      setStatus("Report generated successfully! Check your downloads folder.");
      setError("");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to generate report"
      );
      setStatus("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Title
        level={2}
        style={{
          color: isDark ? "rgba(255, 255, 255, 0.85)" : "rgba(0, 0, 0, 0.85)",
        }}
      >
        Data Analysis
      </Title>
      <Paragraph type="secondary">
        Upload your JSON results to generate a PDF report and data
        visualisation.
      </Paragraph>

      <Card style={{ marginBottom: "24px" }}>
        <Form layout="vertical">
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                label="Gemini API Key"
                required
                tooltip="Your Google Gemini API key"
              >
                <Input.Password
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Enter your Gemini API key"
                  size="large"
                />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                label="Upload JSON File"
                required
                tooltip="Upload your experiment results in JSON format"
              >
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileUpload}
                  style={{ display: "none" }}
                  id="file-upload"
                />
                <Button
                  icon={<UploadOutlined />}
                  onClick={() =>
                    document.getElementById("file-upload")?.click()
                  }
                  block
                  size="large"
                >
                  Choose JSON File
                </Button>
              </Form.Item>
            </Col>
          </Row>

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
              {loading ? "Generating Report..." : "Generate PDF Report"}
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
            style={{ marginTop: "16px" }}
          />
        )}

        {error && (
          <Alert
            message="Error"
            description={error}
            type="error"
            showIcon
            closable
            style={{ marginTop: "16px" }}
          />
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
              <Card
                hoverable
                title={
                  <Space>
                    <PieChartOutlined /> Variable Impact Ranking
                  </Space>
                }
              >
                <ImpactBarChart data={jsonData.data} />
              </Card>
            </Col>

            <Col xs={24} lg={12}>
              <Card
                hoverable
                title={
                  <Space>
                    <LineChartOutlined /> Variable-KPI Correlation
                  </Space>
                }
              >
                <VariableKPIScatter data={jsonData.data} />
              </Card>
            </Col>
          </Row>

          <Row gutter={[16, 16]} style={{ marginTop: "16px" }}>
            <Col xs={24}>
              <Card
                hoverable
                title={
                  <Space>
                    <LineChartOutlined /> KPI Trend Analysis
                  </Space>
                }
              >
                <KPILineChart data={jsonData.data} />
              </Card>
            </Col>
          </Row>
        </div>
      )}
    </div>
  );
}
