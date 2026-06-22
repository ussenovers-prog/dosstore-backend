import { Request, Response, NextFunction } from 'express';
declare class StoresController {
    list(req: Request, res: Response, next: NextFunction): Promise<void>;
    getById(req: Request, res: Response, next: NextFunction): Promise<void>;
    create(req: Request, res: Response, next: NextFunction): Promise<void>;
    update(req: Request, res: Response, next: NextFunction): Promise<void>;
    deactivate(req: Request, res: Response, next: NextFunction): Promise<void>;
}
export declare const storesController: StoresController;
export {};
//# sourceMappingURL=stores.controller.d.ts.map