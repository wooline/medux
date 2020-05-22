import {env as coreEnv} from '@medux/core';

export interface Env {
  document: {getElementById: (id: string) => object | null};
}

export const env: Env = coreEnv as any;
