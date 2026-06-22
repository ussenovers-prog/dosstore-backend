"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NO_MOVEMENT_DAYS = exports.LOW_STOCK_THRESHOLD = exports.PAGINATION = exports.IMPORT_STATUS = exports.IMPORT_SOURCES = exports.RECURRING_CATEGORIES = exports.EXPENSE_CATEGORIES = exports.ROLES = void 0;
exports.ROLES = {
    OWNER: 'owner',
    EMPLOYEE: 'employee',
};
exports.EXPENSE_CATEGORIES = {
    SALARY: 'salary',
    RENT: 'rent',
    UTILITIES: 'utilities',
    TARGET_ADS: 'target_ads',
    OTHER: 'other',
};
exports.RECURRING_CATEGORIES = ['rent', 'utilities'];
exports.IMPORT_SOURCES = {
    FTP_BEKSAR_SALES: 'ftp_beksar_sales',
    FTP_BEKSAR_ARRIVAL: 'ftp_beksar_arrival',
    FTP_BEKSAR_INVENTORY: 'ftp_beksar_inventory',
    FTP_BEKSAR_GROSS_PROFIT: 'ftp_beksar_gross_profit',
    GOOGLE_SHEETS: 'google_sheets',
    EXCEL: 'excel',
    MANUAL: 'manual',
};
exports.IMPORT_STATUS = {
    SUCCESS: 'success',
    ERROR: 'error',
    PARTIAL: 'partial',
};
exports.PAGINATION = {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 50,
    MAX_LIMIT: 500,
};
exports.LOW_STOCK_THRESHOLD = 5;
exports.NO_MOVEMENT_DAYS = 30;
//# sourceMappingURL=constants.js.map