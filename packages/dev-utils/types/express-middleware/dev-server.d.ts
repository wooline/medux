import { Request, Response, NextFunction } from 'express';
export default function middleware(enable: boolean, proxyMap?: {
    [key: string]: any;
} | {
    context: string[] | string;
}[] | Function): (req: Request, res: Response, next: NextFunction) => void;
