import { Compiler } from 'webpack';
interface Options {
    entryFileName?: string;
}
export declare class SsrInject {
    entryFileName: string;
    entryFilePath: string;
    htmlKey: string;
    html: string;
    constructor(options?: Options);
    apply(compiler: Compiler): void;
}
export declare function getPlugin(entryFileName?: string): SsrInject;
export {};
