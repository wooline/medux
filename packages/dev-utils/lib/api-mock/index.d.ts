import { NextFunction, Request, Response } from 'express';
export declare function createMiddleware(mockFile: string): (req: Request, res: Response, next: NextFunction) => any;
