export const ROLES = {
  OWNER: 'owner' as const,
  EMPLOYEE: 'employee' as const,
};

export const EXPENSE_CATEGORIES = {
  SALARY: 'salary' as const,
  RENT: 'rent' as const,
  UTILITIES: 'utilities' as const,
  TARGET_ADS: 'target_ads' as const,
  OTHER: 'other' as const,
};

export const RECURRING_CATEGORIES = ['rent', 'utilities'] as const;

export const IMPORT_SOURCES = {
  FTP_BEKSAR_SALES: 'ftp_beksar_sales' as const,
  FTP_BEKSAR_ARRIVAL: 'ftp_beksar_arrival' as const,
  FTP_BEKSAR_INVENTORY: 'ftp_beksar_inventory' as const,
  FTP_BEKSAR_GROSS_PROFIT: 'ftp_beksar_gross_profit' as const,
  GOOGLE_SHEETS: 'google_sheets' as const,
  EXCEL: 'excel' as const,
  MANUAL: 'manual' as const,
};

export const IMPORT_STATUS = {
  SUCCESS: 'success' as const,
  ERROR: 'error' as const,
  PARTIAL: 'partial' as const,
};

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 50,
  MAX_LIMIT: 500,
};

export const LOW_STOCK_THRESHOLD = 5;
export const NO_MOVEMENT_DAYS = 30;
