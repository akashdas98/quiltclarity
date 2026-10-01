export interface CalculatorField {
  name: string;
  label: string;
  value: string | number | boolean;
  kind?: 'number' | 'select' | 'checkbox';
  unit?: 'length' | 'purchase' | 'percent' | 'count';
  hint?: string;
  options?: Array<{ value: string; label: string }>;
  advanced?: boolean;
  optional?: boolean;
}
