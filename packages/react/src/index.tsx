/// <reference path="../env/global.d.ts" />
import * as core from '@medux/core';
import {RootModuleFacade, ExportModule, ModuleGetter, StoreOptions, env, getView, isPromise, ModuleStore} from '@medux/core';
import React, {ComponentType, FC, useEffect, useState} from 'react';
import {renderToString} from 'react-dom/server';
import ReactDOM from 'react-dom';

export function renderApp(
  moduleGetter: ModuleGetter,
  appModuleName: string,
  appViewName: string,
  storeOptions: StoreOptions,
  container: string | Element = 'root',
  beforeRender: (store: ModuleStore) => string[]
) {
  return core.renderApp<ComponentType<any>>(
    (store, appModel, AppView, ssrInitStoreKey) => {
      const reRender = (View: ComponentType<any>) => {
        const panel: any = typeof container === 'string' ? env.document.getElementById(container) : container;
        ReactDOM.unmountComponentAtNode(panel!);
        const render = env[ssrInitStoreKey] ? ReactDOM.hydrate : ReactDOM.render;
        render(<View store={store} />, panel);
      };
      reRender(AppView);
      return reRender;
    },
    moduleGetter,
    appModuleName,
    appViewName,
    storeOptions,
    beforeRender
  );
}
