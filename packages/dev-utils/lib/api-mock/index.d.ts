import { NextFunction, Request, Response } from 'express';
export declare function createMiddleware(mockFile: string, globalFile?: string): (req: Request, res: Response, next: NextFunction) => any;
