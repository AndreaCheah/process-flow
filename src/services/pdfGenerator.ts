import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { ExperimentData } from "../types/reportTypes";
import type { GeneratedInsights } from "./geminiReportService";

export interface ChartImages {
  barChart: string;
  lineChart: string;
  comparisonChart: string;
}

export class PDFGenerator {
  private doc: jsPDF;
  private pageWidth: number;
  private pageHeight: number;
  private margin: number = 20;
  private currentY: number = 20;

  constructor() {
    this.doc = new jsPDF();
    this.pageWidth = this.doc.internal.pageSize.getWidth();
    this.pageHeight = this.doc.internal.pageSize.getHeight();
  }

  generateReport(
    data: ExperimentData,
    insights: GeneratedInsights,
    charts: ChartImages
  ): void {
    this.addTitlePage(data);
    this.addExecutiveSummary(insights.executiveSummary);
    this.addVariableAnalysisSection(insights.variableAnalysis, charts.barChart);
    this.addScenarioComparisonSection(
      insights.scenarioComparison,
      charts.lineChart,
      charts.comparisonChart
    );
    this.addPerformanceDriversSection(data, insights.performanceDriversInsights);

    const timestamp = new Date()
      .toISOString()
      .replace(/[:.]/g, "-")
      .split("T")[0];
    this.doc.save(`experiment-report-${timestamp}.pdf`);
  }

  private addTitlePage(data: ExperimentData): void {
    this.doc.setFontSize(24);
    this.doc.setFont("helvetica", "bold");
    this.doc.text("Process Optimization Report", this.pageWidth / 2, 60, {
      align: "center",
    });

    this.doc.setFontSize(14);
    this.doc.setFont("helvetica", "normal");
    this.doc.text(
      "Experimental Analysis & KPI Optimization",
      this.pageWidth / 2,
      75,
      { align: "center" }
    );

    this.doc.setFontSize(12);
    const kpiName = data.simulated_summary.simulated_data[0]?.kpi || "N/A";
    this.doc.text(`KPI: ${kpiName}`, this.pageWidth / 2, 90, {
      align: "center",
    });

    this.doc.setFontSize(10);
    const date = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    this.doc.text(`Report Generated: ${date}`, this.pageWidth / 2, 105, {
      align: "center",
    });

    this.doc.setFontSize(11);
    this.doc.setFont("helvetica", "bold");
    this.doc.text("Report Summary", this.pageWidth / 2, 130, {
      align: "center",
    });

    this.doc.setFont("helvetica", "normal");
    this.doc.setFontSize(10);
    const totalScenarios = data.simulated_summary.simulated_data.length;
    const kpiValues = data.simulated_summary.simulated_data.map(
      (s) => s.kpi_value
    );
    const maxKPI = Math.max(...kpiValues);
    const minKPI = Math.min(...kpiValues);

    const summaryLines = [
      `Total Scenarios Tested: ${totalScenarios}`,
      `KPI Range: ${minKPI.toFixed(2)} - ${maxKPI.toFixed(2)}`,
      `Top Variables Analyzed: ${data.top_variables.length}`,
    ];

    let yPos = 145;
    summaryLines.forEach((line) => {
      this.doc.text(line, this.pageWidth / 2, yPos, { align: "center" });
      yPos += 7;
    });

    this.doc.addPage();
    this.currentY = this.margin;
  }

  private addExecutiveSummary(summary: string): void {
    this.addSectionTitle("Executive Summary");
    this.addParagraph(summary);
    this.addSpace(10);
  }

  private addVariableAnalysisSection(
    analysis: string,
    barChartImage: string
  ): void {
    this.addSectionTitle("Variable Analysis");

    this.addChartImage(barChartImage, 140, 85);

    this.addSubsectionTitle("Insights");
    this.addParagraph(analysis);
    this.addSpace(10);
  }

  private addScenarioComparisonSection(
    insights: string,
    lineChartImage: string,
    comparisonChartImage: string
  ): void {
    this.addSectionTitle("Scenario Comparison");

    this.addChartImage(lineChartImage, 160, 90);
    this.addChartImage(comparisonChartImage, 140, 105);

    this.addSubsectionTitle("Insights");
    this.addParagraph(insights);
    this.addSpace(10);
  }

  private addPerformanceDriversSection(
    data: ExperimentData,
    insights: string
  ): void {
    this.addSectionTitle("Performance Drivers");

    // Get top 20% and bottom 20% scenarios
    const scenarios = data.simulated_summary.simulated_data;
    const sortedByKPI = [...scenarios].sort(
      (a, b) => b.kpi_value - a.kpi_value
    );

    const topCount = Math.ceil(scenarios.length * 0.2);
    const topScenarios = sortedByKPI.slice(0, topCount);
    const bottomScenarios = sortedByKPI.slice(-topCount);

    // Get all variables from setpoint and condition impacts
    const allVariables: { name: string; weightage: number }[] = [];

    data.setpoint_impact_summary.forEach((item) => {
      allVariables.push({
        name: `${item.equipment}.${item.setpoint}`,
        weightage: item.weightage,
      });
    });

    data.condition_impact_summary.forEach((item) => {
      allVariables.push({
        name: `${item.equipment}.${item.condition}`,
        weightage: item.weightage,
      });
    });

    // Sort by impact and take top variables
    const topVariables = allVariables
      .sort((a, b) => b.weightage - a.weightage)
      .slice(0, 8);

    this.addSubsectionTitle("Variable Configuration Comparison");

    // Add explanation
    this.doc.setFontSize(9);
    this.doc.setTextColor(80, 80, 80);
    const explanation = `Comparison of average variable values between top ${topCount} and bottom ${topCount} performing scenarios.`;
    const explainLines = this.doc.splitTextToSize(
      explanation,
      this.pageWidth - 2 * this.margin
    );
    explainLines.forEach((line: string) => {
      this.doc.text(line, this.margin, this.currentY);
      this.currentY += 4;
    });
    this.doc.setTextColor(0, 0, 0);
    this.doc.setFontSize(10);
    this.currentY += 5;

    // Calculate average values for top and bottom scenarios
    const comparisonData = topVariables.map((variable) => {
      const [equipment, varName] = variable.name.split(".");

      // Calculate averages from top scenarios
      let topSum = 0;
      let topCountVar = 0;
      topScenarios.forEach((scenario) => {
        // Search through ALL equipment entries (there may be multiple with same name)
        const equipEntries = scenario.equipment_specification.filter(
          (e) => e.equipment === equipment
        );

        for (const equip of equipEntries) {
          // Try to find variable by exact name match or by partial match
          const foundVar = equip.variables.find(
            (v) =>
              v.name === varName ||
              v.name === `${equipment} - ${varName}` ||
              v.name.endsWith(varName)
          );
          if (foundVar) {
            topSum += foundVar.value;
            topCountVar++;
            break; // Found the variable, no need to check other equipment entries
          }
        }
      });

      // Calculate averages from bottom scenarios
      let bottomSum = 0;
      let bottomCountVar = 0;
      bottomScenarios.forEach((scenario) => {
        // Search through ALL equipment entries (there may be multiple with same name)
        const equipEntries = scenario.equipment_specification.filter(
          (e) => e.equipment === equipment
        );

        for (const equip of equipEntries) {
          // Try to find variable by exact name match or by partial match
          const foundVar = equip.variables.find(
            (v) =>
              v.name === varName ||
              v.name === `${equipment} - ${varName}` ||
              v.name.endsWith(varName)
          );
          if (foundVar) {
            bottomSum += foundVar.value;
            bottomCountVar++;
            break; // Found the variable, no need to check other equipment entries
          }
        }
      });

      const topAvg = topCountVar > 0 ? topSum / topCountVar : 0;
      const bottomAvg = bottomCountVar > 0 ? bottomSum / bottomCountVar : 0;

      return [
        variable.name,
        topAvg.toFixed(2),
        bottomAvg.toFixed(2),
        `${variable.weightage.toFixed(1)}%`,
      ];
    });

    autoTable(this.doc, {
      head: [
        [
          "Variable",
          `Top ${topCount} Avg`,
          `Bottom ${topCount} Avg`,
          "Impact %",
        ],
      ],
      body: comparisonData,
      startY: this.currentY,
      theme: "striped",
      headStyles: { fillColor: [52, 152, 219] },
      margin: { left: this.margin, right: this.margin },
    });

    this.currentY = (this.doc as any).lastAutoTable.finalY + 10;
    this.checkPageBreak();

    this.addSubsectionTitle("Insights");
    this.addParagraph(insights);
    this.addSpace(10);
  }

  private addChartImage(
    imageData: string,
    width: number,
    height: number
  ): void {
    this.checkPageBreak(height + 15);

    const x = (this.pageWidth - width) / 2; // Center the image
    this.doc.addImage(imageData, "PNG", x, this.currentY, width, height);
    this.currentY += height + 10;
  }

  private addSectionTitle(title: string): void {
    this.checkPageBreak(30);
    this.doc.setFontSize(16);
    this.doc.setFont("helvetica", "bold");
    this.doc.text(title, this.margin, this.currentY);
    this.currentY += 10;
    this.doc.setFont("helvetica", "normal");
  }

  private addSubsectionTitle(title: string): void {
    this.checkPageBreak(20);
    this.doc.setFontSize(12);
    this.doc.setFont("helvetica", "bold");
    this.doc.text(title, this.margin, this.currentY);
    this.currentY += 7;
    this.doc.setFont("helvetica", "normal");
  }

  private addParagraph(text: string): void {
    this.doc.setFontSize(10);
    const lines = this.doc.splitTextToSize(
      text,
      this.pageWidth - 2 * this.margin
    );

    lines.forEach((line: string) => {
      this.checkPageBreak();
      this.doc.text(line, this.margin, this.currentY);
      this.currentY += 5;
    });
  }

  private addSpace(space: number): void {
    this.currentY += space;
  }

  private checkPageBreak(requiredSpace: number = 20): void {
    if (this.currentY + requiredSpace > this.pageHeight - this.margin) {
      this.doc.addPage();
      this.currentY = this.margin;
    }
  }
}
