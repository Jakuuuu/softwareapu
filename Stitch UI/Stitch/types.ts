export enum Screen {
  NEW_PROJECT = 'NEW_PROJECT',
  BUDGET_ITEMS = 'BUDGET_ITEMS',
  UNIT_PRICE_EDITOR = 'UNIT_PRICE_EDITOR',
  RESOURCE_DATABASE = 'RESOURCE_DATABASE',
  BUDGET_REPORT = 'BUDGET_REPORT',
}

export interface NavItem {
  id: Screen;
  label: string;
  icon: string;
}