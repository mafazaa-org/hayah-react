// Phase 16: Custom Field type definitions

export type CustomFieldType = 'text' | 'number' | 'date' | 'select' | 'checkbox';

export interface CustomFieldOption {
  id: string;
  value: string;
  color?: string;
}

export interface CustomField {
  id: string;
  listId: string;
  name: string;
  type: CustomFieldType;
  options?: CustomFieldOption[]; // For 'select' type
  defaultValue?: string | number | boolean;
  showOnCard: boolean;
  order: number;
}
