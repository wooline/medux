import { NextFunction, Request, Response } from 'express';
export default function middleware(htmlTpl: string, mainModule: {
    default: (path: string) => Promise<{
        ssrInitStoreKey: string;
        data: any;
        html: string;
    }>;
}, proxyMap?: {
    [key: string]: any;
} | {
    context: string[] | string;
}[] | Function, replaceTpl?: (req: Request, htmlTpl: string) => string): (req: Request, res: Response, next: NextFunction) => void;
