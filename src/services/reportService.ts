import { GoogleGenAI } from '@google/genai';
import type { ExperimentData } from '../types/reportTypes';

export interface GeneratedInsights {
  executiveSummary: string;
  topVariablesAnalysis: string;
  variableImpactInsights: string;
  scenarioComparison: string;
}

export class ReportService {
  private ai: GoogleGenAI;

  constructor(apiKey: string) {
    this.ai = new GoogleGenAI({ apiKey });
  }

  /**
   * Generate all insights using Gemini LLM
   */
  async generateInsights(data: ExperimentData): Promise<GeneratedInsights> {
    const [executiveSummary, topVariablesAnalysis, variableImpactInsights, scenarioComparison] =
      await Promise.all([
        this.generateExecutiveSummary(data),
        this.generateTopVariablesAnalysis(data),
        this.generateVariableImpactInsights(data),
        this.generateScenarioComparison(data),
      ]);

    return {
      executiveSummary,
      topVariablesAnalysis,
      variableImpactInsights,
      scenarioComparison,
    };
  }

  /**
   * Generate executive summary section
   */
  private async generateExecutiveSummary(data: ExperimentData): Promise<string> {
    const prompt = `
You are an expert process engineer analyzing experimental results. Based on the following data, write a concise executive summary (2-3 paragraphs) for a technical report.

Main Summary: ${data.main_summary_text}
Top Summary: ${data.top_summary_text}

Top Impact Variables:
${Object.entries(data.top_impact).map(([key, value]) => `- ${key}: ${value.toFixed(2)}%`).join('\n')}

KPI: ${data.simulated_summary.simulated_data[0]?.kpi || 'N/A'}
Best KPI Value: ${Math.max(...data.simulated_summary.simulated_data.map(s => s.kpi_value)).toFixed(2)}
Worst KPI Value: ${Math.min(...data.simulated_summary.simulated_data.map(s => s.kpi_value)).toFixed(2)}
Total Scenarios Tested: ${data.simulated_summary.simulated_data.length}

Write a professional executive summary that highlights:
1. The purpose of the experiments
2. Key findings about which variables have the most impact
3. The range of KPI values achieved

Keep it concise and technical. Do not use bullet points.
    `;

    const response = await this.ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text ? response.text : "Something went wrong";
  }

  /**
   * Generate top variables analysis section
   */
  private async generateTopVariablesAnalysis(data: ExperimentData): Promise<string> {
    const topVarsInfo = data.top_variables.map(v =>
      `${v.equipment} - ${v.name}: ${v.value} ${v.unit} (Type: ${v.type})`
    ).join('\n');

    const prompt = `
You are an expert process engineer. Analyze the following top variables that have the highest impact on KPI.

Top Variables:
${topVarsInfo}

Impact Distribution:
${Object.entries(data.top_impact).map(([key, value]) => `- ${key}: ${value.toFixed(2)}%`).join('\n')}

Summary Context: ${data.top_summary_text}

Write a detailed analysis (2 paragraphs) that:
1. Explains why these specific variables are critical for KPI optimization
2. Discusses the significance of their impact weightages
3. Provides actionable recommendations for operators

Be technical and specific. Do not use bullet points.
    `;

    const response = await this.ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text ? response.text : "Something went wrong";
  }

  /**
   * Generate variable impact insights
   */
  private async generateVariableImpactInsights(data: ExperimentData): Promise<string> {
    const setpointsInfo = data.setpoint_impact_summary.map(s =>
      `${s.equipment} - ${s.setpoint}: ${s.weightage.toFixed(2)}% (${s.unit})`
    ).join('\n');

    const conditionsInfo = data.condition_impact_summary.length > 0
      ? data.condition_impact_summary.map(c =>
          `${c.equipment} - ${c.condition}: ${c.weightage.toFixed(2)}% (${c.unit})`
        ).join('\n')
      : 'No condition variables in this analysis';

    const prompt = `
You are an expert process engineer. Analyze the impact distribution of setpoint and condition variables.

Setpoint Variables:
${setpointsInfo}

Condition Variables:
${conditionsInfo}

Context: ${data.impact_summary_text}

Write a technical analysis (2 paragraphs) that:
1. Compares the relative importance of setpoint vs condition variables
2. Identifies patterns in the impact distribution
3. Suggests which variables should be prioritized for tuning

Be concise and actionable. Do not use bullet points.
    `;

    const response = await this.ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text ? response.text : "Something went wrong";
  }

  /**
   * Generate scenario comparison insights
   */
  private async generateScenarioComparison(data: ExperimentData): Promise<string> {
    const scenarios = data.simulated_summary.simulated_data;
    const sortedByKPI = [...scenarios].sort((a, b) => b.kpi_value - a.kpi_value);
    const best = sortedByKPI[0];
    const worst = sortedByKPI[sortedByKPI.length - 1];

    const bestVars = best.equipment_specification.flatMap(eq =>
      eq.variables.map(v => `${eq.equipment}.${v.name}: ${v.value} ${v.unit}`)
    ).join(', ');

    const worstVars = worst.equipment_specification.flatMap(eq =>
      eq.variables.map(v => `${eq.equipment}.${v.name}: ${v.value} ${v.unit}`)
    ).join(', ');

    const prompt = `
You are an expert process engineer analyzing experimental scenarios.

Total Scenarios: ${scenarios.length}
KPI: ${scenarios[0].kpi}

Best Performing Scenario: ${best.scenario}
- KPI Value: ${best.kpi_value.toFixed(2)}
- Variables: ${bestVars}

Worst Performing Scenario: ${worst.scenario}
- KPI Value: ${worst.kpi_value.toFixed(2)}
- Variables: ${worstVars}

KPI Range: ${worst.kpi_value.toFixed(2)} to ${best.kpi_value.toFixed(2)}

Write a technical analysis (2 paragraphs) that:
1. Compares the best and worst scenarios
2. Identifies key differences in variable settings
3. Provides insights on optimal operating conditions

Be specific and technical. Do not use bullet points.
    `;

    const response = await this.ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text ? response.text : "Something went wrong";
  }
}
