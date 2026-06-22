"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.importFactory = void 0;
const client_1 = require("@prisma/client");
const sales_import_service_js_1 = require("./sales-import.service.js");
const arrival_import_service_js_1 = require("./arrival-import.service.js");
const inventory_import_service_js_1 = require("./inventory-import.service.js");
const gross_profit_import_service_js_1 = require("./gross-profit-import.service.js");
/**
 * ImportFactory — фабрика для получения нужного ImportService по типу источника
 *
 * Расширяемая архитектура: для добавления нового типа импорта
 * нужно создать новый класс, реализующий IImportService,
 * и зарегистрировать его здесь.
 */
class ImportFactory {
    handlers = new Map();
    constructor() {
        // Register built-in handlers
        this.register(client_1.ImportSource.ftp_beksar_sales, sales_import_service_js_1.salesImportService);
        this.register(client_1.ImportSource.ftp_beksar_arrival, arrival_import_service_js_1.arrivalImportService);
        this.register(client_1.ImportSource.ftp_beksar_inventory, inventory_import_service_js_1.inventoryImportService);
        this.register(client_1.ImportSource.ftp_beksar_gross_profit, gross_profit_import_service_js_1.grossProfitImportService);
    }
    register(source, service) {
        this.handlers.set(source, service);
    }
    get(source) {
        return this.handlers.get(source);
    }
    has(source) {
        return this.handlers.has(source);
    }
    getSupportedSources() {
        return Array.from(this.handlers.keys());
    }
}
exports.importFactory = new ImportFactory();
//# sourceMappingURL=import-factory.js.map