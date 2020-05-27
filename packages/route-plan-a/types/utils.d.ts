import { MeduxLocation } from './index';
export declare function checkUrl(url: string, curPathname?: string): string;
export declare function urlToLocation(url: string): MeduxLocation;
export declare function locationToUrl(location: MeduxLocation): string;
