import {extractPathParams, PathnameRules} from 'src/matchPath';

describe('matchPath', () => {
  test('extractPathParams /admin/user/list', () => {
    const rules: PathnameRules<any> = {
      '/': () => {
        return '/admin/home/list';
      },
      '/admin': () => {
        return '/admin/home/list';
      },
      '/admin/:module/:listView': ({module, listView}: {module: string; listView: string}, params: any) => {
        params.module = module;
        params.listView = listView;
      },
    };
    const params = {} as any;
    const pathame = extractPathParams(rules, '/admin/user/list', params);
    expect(pathame).toBe('/admin/home/list');
    expect(params).toEqual({module: 'home', listView: 'list'});
  });
  test('extractPathParams /admin/user/list', () => {
    const rules: PathnameRules<any> = {
      '/$': () => {
        return '/admin/home/list';
      },
      '/admin$': () => {
        return '/admin/home/list';
      },
      '/admin/:module/:listView': ({module, listView}: {module: string; listView: string}, params: any) => {
        params.module = module;
        params.listView = listView;
      },
    };
    const params = {} as any;
    const pathame = extractPathParams(rules, '/admin/user/list', params);
    expect(pathame).toBe('/admin/user/list');
    expect(params).toEqual({module: 'user', listView: 'list'});
  });
  test('extractPathParams /admin/user/list/all/', () => {
    const rules: PathnameRules<any> = {
      '/$': () => {
        return '/admin/home/list';
      },
      '/admin$': () => {
        return '/admin/home/list';
      },
      '/admin/:module': ({module}: {module: string}, params: any) => {
        params.module = module;
        return {
          '/:listView': ({listView}: {listView: string}) => {
            params.listView = listView;
          },
        };
      },
    };
    const params = {} as any;
    const pathame = extractPathParams(rules, '/admin/user/list/all/', params);
    expect(pathame).toBe('/admin/user/list/all/');
    expect(params).toEqual({module: 'user', listView: 'list'});
  });
  test('extractPathParams /admin/user/list/all', () => {
    const rules: PathnameRules<any> = {
      '/$': () => {
        return '/admin/home/list';
      },
      '/admin$': () => {
        return '/admin/home/list';
      },
      '/admin/:module': ({module}: {module: string}, params: any) => {
        params.module = module;
        return {
          '/:listView': ({listView}: {listView: string}) => {
            params.listView = listView;
            return {
              '/:listType': ({listType}: {listType: string}) => {
                params.listType = listType;
              },
            };
          },
        };
      },
    };
    const params = {} as any;
    const pathame = extractPathParams(rules, '/admin/user/list/all', params);
    expect(pathame).toBe('/admin/user/list/all');
    expect(params).toEqual({module: 'user', listView: 'list', listType: 'all'});
  });
  test('extractPathParams /admin/user/list/all', () => {
    const rules: PathnameRules<any> = {
      '/$': () => {
        return '/admin/home/list';
      },
      '/admin$': () => {
        return '/admin/home/list';
      },
      '/admin/:module': ({module}: {module: string}, params: any) => {
        params.module = module;
        return {
          '/:listView': () => {
            return '/detail/3';
          },
        };
      },
    };
    const params = {} as any;
    const pathame = extractPathParams(rules, '/admin/user/list/all', params);
    expect(pathame).toBe('/admin/user/detail/3');
    expect(params).toEqual({module: 'user'});
  });
  test('extractPathParams /admin/user/list/all', () => {
    const rules: PathnameRules<any> = {
      '/$': () => {
        return '/admin/home/list';
      },
      '/admin$': () => {
        return '/admin/home/list';
      },
      '/admin/:module': ({module}: {module: string}, params: any) => {
        params.module = module;
        return {
          '/:listView': () => {
            return '/detail/3';
          },
          '/:detailView/:id': ({detailView, id}: {detailView: string; id: string}) => {
            params.detailView = detailView;
            params.id = id;
          },
        };
      },
    };
    const params = {} as any;
    const pathame = extractPathParams(rules, '/admin/user/list/all', params);
    expect(pathame).toBe('/admin/user/detail/3');
    expect(params).toEqual({module: 'user', detailView: 'detail', id: '3'});
  });
  test('extractPathParams /admin/user/list/all', () => {
    const rules: PathnameRules<any> = {
      '/$': () => {
        return '/admin/home/list';
      },
      '/admin$': () => {
        return '/admin/home/list';
      },
      '/admin/:module': ({module}: {module: string}, params: any) => {
        params.module = module;
        return {
          '/:listView': ({listView}: {listView: string}) => {
            params.listView = listView;
            return {
              '/:listType': ({listType}: {listType: string}) => {
                return '/detail/3';
              },
            };
          },
        };
      },
    };
    const params = {} as any;
    const pathame = extractPathParams(rules, '/admin/user/list/all', params);
    expect(pathame).toBe('/admin/user/list/detail/3');
    expect(params).toEqual({module: 'user', listView: 'list'});
  });
});
