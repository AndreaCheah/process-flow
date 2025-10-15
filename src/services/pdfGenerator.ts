import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { ExperimentData } from '../types/reportTypes';
import type { GeneratedInsights } from './reportService';

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

  generateReport(data: ExperimentData, insights: GeneratedInsights): void {
    this.addTitlePage(data);
    this.addExecutiveSummary(insights.executiveSummary);
    this.addTopVariablesSection(data, insights.topVariablesAnalysis);
    this.addVariableImpactSection(data, insights.variableImpactInsights);
    this.addScenarioComparisonSection(data, insights.scenarioComparison);

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
    this.doc.save(`experiment-report-${timestamp}.pdf`);
  }

  private addTitlePage(data: ExperimentData): void {
    this.doc.setFontSize(24);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Process Optimization Report', this.pageWidth / 2, 60, { align: 'center' });

    this.doc.setFontSize(14);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text('Experimental Analysis & KPI Optimization', this.pageWidth / 2, 75, { align: 'center' });

    this.doc.setFontSize(12);
    const kpiName = data.simulated_summary.simulated_data[0]?.kpi || 'N/A';
    this.doc.text(`KPI: ${kpiName}`, this.pageWidth / 2, 90, { align: 'center' });

    this.doc.setFontSize(10);
    const date = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    this.doc.text(`Report Generated: ${date}`, this.pageWidth / 2, 105, { align: 'center' });

    this.doc.setFontSize(11);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Report Summary', this.pageWidth / 2, 130, { align: 'center' });

    this.doc.setFont('helvetica', 'normal');
    this.doc.setFontSize(10);
    const totalScenarios = data.simulated_summary.simulated_data.length;
    const kpiValues = data.simulated_summary.simulated_data.map(s => s.kpi_value);
    const maxKPI = Math.max(...kpiValues);
    const minKPI = Math.min(...kpiValues);
    const avgKPI = kpiValues.reduce((a, b) => a + b, 0) / kpiValues.length;

    const summaryLines = [
      `Total Scenarios Tested: ${totalScenarios}`,
      `KPI Range: ${minKPI.toFixed(2)} - ${maxKPI.toFixed(2)}`,
      `Average KPI: ${avgKPI.toFixed(2)}`,
      `Top Variables Analyzed: ${data.top_variables.length}`,
    ];

    let yPos = 145;
    summaryLines.forEach(line => {
      this.doc.text(line, this.pageWidth / 2, yPos, { align: 'center' });
      yPos += 7;
    });

    this.doc.addPage();
    this.currentY = this.margin;
  }

  private addExecutiveSummary(summary: string): void {
    this.addSectionTitle('Executive Summary');
    this.addParagraph(summary);
    this.addSpace(10);
  }

  private addTopVariablesSection(data: ExperimentData, analysis: string): void {
    this.addSectionTitle('Top Variables Analysis');

    this.addParagraph(data.top_summary_text);
    this.addSpace(5);

    this.addSubsectionTitle('Variable Impact Distribution');

    const impactData = Object.entries(data.top_impact).map(([key, value]) => [
      key,
      `${value.toFixed(2)}%`
    ]);

    autoTable(this.doc, {
      head: [['Variable', 'Impact (%)']],
      body: impactData,
      startY: this.currentY,
      theme: 'striped',
      headStyles: { fillColor: [41, 128, 185] },
      margin: { left: this.margin, right: this.margin },
    });

    this.currentY = (this.doc as any).lastAutoTable.finalY + 10;
    this.checkPageBreak();

    this.addSubsectionTitle('Top Variables Details');

    const topVarsData = data.top_variables.map(v => [
      v.equipment,
      v.name,
      v.type,
      v.value.toFixed(3),
      v.unit
    ]);

    autoTable(this.doc, {
      head: [['Equipment', 'Variable', 'Type', 'Value', 'Unit']],
      body: topVarsData,
      startY: this.currentY,
      theme: 'striped',
      headStyles: { fillColor: [41, 128, 185] },
      margin: { left: this.margin, right: this.margin },
    });

    this.currentY = (this.doc as any).lastAutoTable.finalY + 10;
    this.checkPageBreak();

    this.addSubsectionTitle('Analysis');
    this.addParagraph(analysis);
    this.addSpace(10);
  }

  private addVariableImpactSection(data: ExperimentData, insights: string): void {
    this.addSectionTitle('Variable Impact Breakdown');

    this.addParagraph(data.impact_summary_text);
    this.addSpace(5);

    if (data.setpoint_impact_summary.length > 0) {
      this.addSubsectionTitle('Setpoint Variables Impact');

      const setpointData = data.setpoint_impact_summary.map(s => [
        s.equipment,
        s.setpoint,
        s.weightage.toFixed(2),
        s.unit
      ]);

      autoTable(this.doc, {
        head: [['Equipment', 'Setpoint', 'Weightage (%)', 'Unit']],
        body: setpointData,
        startY: this.currentY,
        theme: 'striped',
        headStyles: { fillColor: [46, 204, 113] },
        margin: { left: this.margin, right: this.margin },
      });

      this.currentY = (this.doc as any).lastAutoTable.finalY + 10;
      this.checkPageBreak();
    }

    if (data.condition_impact_summary.length > 0) {
      this.addSubsectionTitle('Condition Variables Impact');

      const conditionData = data.condition_impact_summary.map(c => [
        c.equipment,
        c.condition,
        c.weightage.toFixed(2),
        c.unit
      ]);

      autoTable(this.doc, {
        head: [['Equipment', 'Condition', 'Weightage (%)', 'Unit']],
        body: conditionData,
        startY: this.currentY,
        theme: 'striped',
        headStyles: { fillColor: [241, 196, 15] },
        margin: { left: this.margin, right: this.margin },
      });

      this.currentY = (this.doc as any).lastAutoTable.finalY + 10;
      this.checkPageBreak();
    }

    this.addSubsectionTitle('Insights');
    this.addParagraph(insights);
    this.addSpace(10);
  }

  private addScenarioComparisonSection(data: ExperimentData, insights: string): void {
    this.addSectionTitle('Scenario Comparison');

    // Sort scenarios by KPI value
    const sortedScenarios = [...data.simulated_summary.simulated_data].sort(
      (a, b) => b.kpi_value - a.kpi_value
    );

    // Show top 10 and bottom 10
    const topScenarios = sortedScenarios.slice(0, 10);
    const bottomScenarios = sortedScenarios.slice(-10).reverse();

    this.addSubsectionTitle('Top 10 Performing Scenarios');

    const topData = topScenarios.map((s, idx) => [
      (idx + 1).toString(),
      s.scenario,
      s.kpi_value.toFixed(3),
    ]);

    autoTable(this.doc, {
      head: [['Rank', 'Scenario', 'KPI Value']],
      body: topData,
      startY: this.currentY,
      theme: 'striped',
      headStyles: { fillColor: [39, 174, 96] },
      margin: { left: this.margin, right: this.margin },
    });

    this.currentY = (this.doc as any).lastAutoTable.finalY + 10;
    this.checkPageBreak();

    this.addSubsectionTitle('Bottom 10 Performing Scenarios');

    const bottomData = bottomScenarios.map((s, idx) => [
      (idx + 1).toString(),
      s.scenario,
      s.kpi_value.toFixed(3),
    ]);

    autoTable(this.doc, {
      head: [['Rank', 'Scenario', 'KPI Value']],
      body: bottomData,
      startY: this.currentY,
      theme: 'striped',
      headStyles: { fillColor: [231, 76, 60] },
      margin: { left: this.margin, right: this.margin },
    });

    this.currentY = (this.doc as any).lastAutoTable.finalY + 10;
    this.checkPageBreak();

    this.addSubsectionTitle('Analysis');
    this.addParagraph(insights);
  }

  private addSectionTitle(title: string): void {
    this.checkPageBreak(30);
    this.doc.setFontSize(16);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(title, this.margin, this.currentY);
    this.currentY += 10;
    this.doc.setFont('helvetica', 'normal');
  }

  private addSubsectionTitle(title: string): void {
    this.checkPageBreak(20);
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(title, this.margin, this.currentY);
    this.currentY += 7;
    this.doc.setFont('helvetica', 'normal');
  }

  private addParagraph(text: string): void {
    this.doc.setFontSize(10);
    const lines = this.doc.splitTextToSize(text, this.pageWidth - 2 * this.margin);

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
