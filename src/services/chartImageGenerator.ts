import { Chart as ChartJS, type ChartConfiguration } from "chart.js/auto";
import type { ExperimentData } from "../types/reportTypes";

export class ChartImageGenerator {
  private canvas: HTMLCanvasElement;

  constructor() {
    this.canvas = document.createElement("canvas");
    this.canvas.width = 800;
    this.canvas.height = 400;
  }

  async generateImpactPieChart(data: ExperimentData): Promise<string> {
    const labels = Object.keys(data.top_impact);
    const values = Object.values(data.top_impact);

    const config: ChartConfiguration = {
      type: "pie",
      data: {
        labels: labels,
        datasets: [
          {
            label: "Impact %",
            data: values,
            backgroundColor: [
              "#FF6384",
              "#36A2EB",
              "#FFCE56",
              "#4BC0C0",
              "#9966FF",
              "#FF9F40",
            ],
            borderColor: "#fff",
            borderWidth: 2,
          },
        ],
      },
      options: {
        responsive: false,
        animation: false, 
        plugins: {
          legend: {
            position: "right",
            labels: {
              font: {
                size: 12,
              },
            },
          },
          title: {
            display: true,
            text: "Variable Impact Distribution (%)",
            font: {
              size: 16,
              weight: "bold",
            },
          },
          tooltip: {
            enabled: false,
          },
        },
      },
    };

    return this.renderChartToImage(config);
  }

  async generateKPILineChart(data: ExperimentData): Promise<string> {
    const scenarios = data.simulated_summary.simulated_data;

    const sortedScenarios = [...scenarios].sort((a, b) => {
      const numA = parseInt(a.scenario.replace("Scenario ", ""));
      const numB = parseInt(b.scenario.replace("Scenario ", ""));
      return numA - numB;
    });

    const labels = sortedScenarios.map((s) =>
      s.scenario.replace("Scenario ", "")
    );
    const kpiValues = sortedScenarios.map((s) => s.kpi_value);

    const config: ChartConfiguration = {
      type: "line",
      data: {
        labels: labels,
        datasets: [
          {
            label: "KPI Value",
            data: kpiValues,
            borderColor: "#4BC0C0",
            backgroundColor: "rgba(75, 192, 192, 0.2)",
            borderWidth: 2,
            tension: 0.1,
            pointRadius: 3,
            pointBackgroundColor: "#4BC0C0",
          },
        ],
      },
      options: {
        responsive: false,
        animation: false,
        plugins: {
          legend: {
            display: true,
            labels: {
              font: {
                size: 12,
              },
            },
          },
          title: {
            display: true,
            text: "KPI Values Across All Scenarios",
            font: {
              size: 16,
              weight: "bold",
            },
          },
          tooltip: {
            enabled: false,
          },
        },
        scales: {
          x: {
            title: {
              display: true,
              text: "Scenario Number",
              font: {
                size: 12,
              },
            },
            ticks: {
              font: {
                size: 10,
              },
            },
          },
          y: {
            title: {
              display: true,
              text:
                data.simulated_summary.simulated_data[0]?.kpi || "KPI Value",
              font: {
                size: 12,
              },
            },
            ticks: {
              font: {
                size: 10,
              },
            },
          },
        },
      },
    };

    return this.renderChartToImage(config);
  }

  async generateScenarioComparisonChart(
    data: ExperimentData
  ): Promise<string> {
    const scenarios = data.simulated_summary.simulated_data;
    const sortedByKPI = [...scenarios].sort(
      (a, b) => b.kpi_value - a.kpi_value
    );

    const top10 = sortedByKPI.slice(0, 10);
    const bottom10 = sortedByKPI.slice(-10).reverse();

    const labels = [
      ...top10.map((s) => s.scenario.replace("Scenario ", "")),
      "---",
      ...bottom10.map((s) => s.scenario.replace("Scenario ", "")),
    ];

    const values: (number | null)[] = [
      ...top10.map((s) => s.kpi_value),
      null,
      ...bottom10.map((s) => s.kpi_value),
    ];

    const backgroundColors = [
      ...Array(10).fill("#52c41a"),
      "transparent",
      ...Array(10).fill("#ff4d4f"),
    ];

    const config: ChartConfiguration = {
      type: "bar",
      data: {
        labels: labels,
        datasets: [
          {
            label: "KPI Value",
            data: values,
            backgroundColor: backgroundColors,
            borderColor: backgroundColors,
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: false,
        animation: false,
        indexAxis: "y",
        plugins: {
          legend: {
            display: false,
          },
          title: {
            display: true,
            text: "Top 10 vs Bottom 10 Scenarios",
            font: {
              size: 16,
              weight: "bold",
            },
          },
          tooltip: {
            enabled: false,
          },
        },
        scales: {
          x: {
            title: {
              display: true,
              text:
                data.simulated_summary.simulated_data[0]?.kpi || "KPI Value",
              font: {
                size: 12,
              },
            },
            ticks: {
              font: {
                size: 10,
              },
            },
          },
          y: {
            title: {
              display: true,
              text: "Scenario",
              font: {
                size: 12,
              },
            },
            ticks: {
              font: {
                size: 9,
              },
            },
          },
        },
      },
    };

    this.canvas.height = 600;
    const imageData = await this.renderChartToImage(config);
    this.canvas.height = 400;

    return imageData;
  }

  private async renderChartToImage(
    config: ChartConfiguration
  ): Promise<string> {
    return new Promise((resolve) => {
      // Create a fresh canvas for each chart to avoid ID conflicts
      const tempCanvas = document.createElement("canvas");
      tempCanvas.width = this.canvas.width;
      tempCanvas.height = this.canvas.height;
      const tempCtx = tempCanvas.getContext("2d")!;

      const chart = new ChartJS(tempCtx, config);

      setTimeout(() => {
        const imageData = tempCanvas.toDataURL("image/png");
        chart.destroy();
        tempCanvas.remove(); // Clean up the temporary canvas
        resolve(imageData);
      }, 100);
    });
  }

  // Clean up resources
  destroy(): void {
    this.canvas.remove();
  }
}
