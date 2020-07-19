import { MeduxLocation } from './index';
export declare function checkPathname(pathname: string, curPathname: string): string;
export declare function checkLocation(location: Partial<MeduxLocation>, curPathname: string): MeduxLocation;
export declare function safelocationToUrl(safeLocation: MeduxLocation): string;
export declare function checkUrl(url: string, curPathname?: string): string;
export declare function safeurlToLocation(safeurl: string): MeduxLocation;
