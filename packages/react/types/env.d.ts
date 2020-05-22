export interface Env {
    document: {
        getElementById: (id: string) => object | null;
    };
}
export declare const env: Env;
