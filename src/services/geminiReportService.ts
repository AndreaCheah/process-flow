import { GoogleGenAI } from '@google/genai';
import type { ExperimentData } from '../types/reportTypes';

export interface GeneratedInsights {
  executiveSummary: string;
  variableAnalysis: string;
  scenarioComparison: string;
  performanceDriversInsights: string;
}

export class ReportService {
  private ai: GoogleGenAI;

  constructor(apiKey: string) {
    this.ai = new GoogleGenAI({ apiKey });
  }

  async generateInsights(data: ExperimentData): Promise<GeneratedInsights> {
    try {
      const prompt = this.buildPrompt(data);

      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      if (!response.text || response.text.trim() === '') {
        throw new Error('Gemini API returned empty response');
      }

      return this.parseResponse(response.text);
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to generate insights: ${error.message}`);
      }
      throw new Error('Failed to generate insights: Unknown error');
    }
  }

  private buildPrompt(data: ExperimentData): string {
    return `You are an expert process optimization engineer. Analyze the following experiment results and provide actionable insights.

      # EXPERIMENT DATA (JSON)

      \`\`\`json
      ${JSON.stringify(data, null, 2)}
      \`\`\`

      # YOUR TASK

      Based on the complete data above, provide insights for a technical PDF report in 4 sections:

      1. **Executive Summary** - Strategic overview of the optimization results and key takeaways
      2. **Variable Analysis** - Combined insights on top variables, their impacts, and tuning recommendations
      3. **Scenario Comparison** - Analysis of what differentiates best vs worst performing scenarios
      4. **Performance Drivers** - Analyze variable configurations in top vs bottom scenarios and explain what drives performance differences

      # INSTRUCTIONS

      - Explain key findings and their implications for process optimization
      - Provide actionable insights based on the data
      - Keep each section concise (1 paragraph, 3-5 sentences)
      - Use professional engineering language
      - Do not use bullet points in the paragraphs

      # OUTPUT FORMAT

      Use these exact section markers:

      [EXECUTIVE_SUMMARY]
      Your executive summary paragraph here.
      [/EXECUTIVE_SUMMARY]

      [VARIABLE_ANALYSIS]
      Your variable analysis paragraph here covering both top variables and their impact insights.
      [/VARIABLE_ANALYSIS]

      [SCENARIO_COMPARISON]
      Your scenario comparison paragraph here.
      [/SCENARIO_COMPARISON]

      [PERFORMANCE_DRIVERS]
      Your analysis of what variable configurations drive top vs bottom performance.
      [/PERFORMANCE_DRIVERS]

      Begin your analysis now:`;
  }

  private parseResponse(responseText: string): GeneratedInsights {
    try {
      const executiveSummary = this.extractSection(responseText, 'EXECUTIVE_SUMMARY');
      const variableAnalysis = this.extractSection(responseText, 'VARIABLE_ANALYSIS');
      const scenarioComparison = this.extractSection(responseText, 'SCENARIO_COMPARISON');
      const performanceDriversInsights = this.extractSection(responseText, 'PERFORMANCE_DRIVERS');

      if (!executiveSummary || !variableAnalysis || !scenarioComparison || !performanceDriversInsights) {
        throw new Error('Failed to parse one or more sections from Gemini response');
      }

      return {
        executiveSummary: executiveSummary.trim(),
        variableAnalysis: variableAnalysis.trim(),
        scenarioComparison: scenarioComparison.trim(),
        performanceDriversInsights: performanceDriversInsights.trim(),
      };
    } catch (error) {
      throw new Error(`Failed to parse Gemini response: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private extractSection(text: string, sectionName: string): string {
    const startMarker = `[${sectionName}]`;
    const endMarker = `[/${sectionName}]`;

    const startIndex = text.indexOf(startMarker);
    const endIndex = text.indexOf(endMarker);

    if (startIndex === -1 || endIndex === -1) {
      throw new Error(`Section ${sectionName} not found in response`);
    }

    return text.substring(startIndex + startMarker.length, endIndex).trim();
  }
}
