export interface Variable {
  name: string;
  type: "Setpoint" | "Condition";
  value: number;
  unit: string;
}

export interface TopVariable extends Variable {
  equipment: string;
}

export interface SetpointImpact {
  equipment: string;
  setpoint: string;
  weightage: number;
  unit: string;
}

export interface ConditionImpact {
  equipment: string;
  condition: string;
  weightage: number;
  unit: string;
}

export interface EquipmentSpecification {
  equipment: string;
  variables: Variable[];
}

export interface ScenarioData {
  scenario: string;
  equipment_specification: EquipmentSpecification[];
  kpi: string;
  kpi_value: number;
}

export interface SimulatedSummary {
  simulated_data: ScenarioData[];
}

export interface ExperimentData {
  main_summary_text: string;
  top_summary_text: string;
  top_impact: Record<string, number>; // e.g., { "HEX-100.cold_fluid_temperature": 24.244 }
  top_variables: TopVariable[];
  impact_summary_text: string;
  setpoint_impact_summary: SetpointImpact[];
  condition_impact_summary: ConditionImpact[];
  simulated_summary: SimulatedSummary;
}

export interface ExperimentResults {
  data: ExperimentData;
}
