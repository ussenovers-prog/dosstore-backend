export declare const ROLES: {
    OWNER: "owner";
    EMPLOYEE: "employee";
};
export declare const EXPENSE_CATEGORIES: {
    SALARY: "salary";
    RENT: "rent";
    UTILITIES: "utilities";
    TARGET_ADS: "target_ads";
    OTHER: "other";
};
export declare const RECURRING_CATEGORIES: readonly ["rent", "utilities"];
export declare const IMPORT_SOURCES: {
    FTP_BEKSAR_SALES: "ftp_beksar_sales";
    FTP_BEKSAR_ARRIVAL: "ftp_beksar_arrival";
    FTP_BEKSAR_INVENTORY: "ftp_beksar_inventory";
    FTP_BEKSAR_GROSS_PROFIT: "ftp_beksar_gross_profit";
    GOOGLE_SHEETS: "google_sheets";
    EXCEL: "excel";
    MANUAL: "manual";
};
export declare const IMPORT_STATUS: {
    SUCCESS: "success";
    ERROR: "error";
    PARTIAL: "partial";
};
export declare const PAGINATION: {
    DEFAULT_PAGE: number;
    DEFAULT_LIMIT: number;
    MAX_LIMIT: number;
};
export declare const LOW_STOCK_THRESHOLD = 5;
export declare const NO_MOVEMENT_DAYS = 30;
//# sourceMappingURL=constants.d.ts.map