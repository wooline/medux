import type { Location, NativeLocation } from './basic';
export declare type LocationTransform<P extends {
    [key: string]: any;
}> = {
    in: (nativeLocation: NativeLocation) => Location<P>;
    out: (meduxLocation: Location<P>) => NativeLocation;
};
export declare type PathnameTransform<P extends {
    [key: string]: any;
}> = {
    in(pathname: string): {
        pagename: string;
        pathParams: P;
    };
    out(pagename: string, params: P): {
        pathname: string;
        pathParams: P;
    };
};
export declare type PagenameMap<P extends {
    [key: string]: any;
}> = {
    [pagename: string]: {
        in(pathParams: Array<string | undefined>): P;
        out(params: P): Array<any>;
    };
};
export declare function createPathnameTransform<P extends {
    [key: string]: any;
}>(pathnameIn: (pathname: string) => string, pagenameMap: PagenameMap<P>, pathnameOut?: (pathname: string) => string): PathnameTransform<P>;
export declare function createLocationTransform<P extends {
    [key: string]: any;
}>(pathnameTransform: PathnameTransform<P>, defaultData: P, base64?: boolean, serialization?: {
    parse(str: string): any;
    stringify(data: any): string;
}, paramsKey?: string): LocationTransform<P>;
