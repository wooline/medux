import {checkUrl, safelocationToUrl, safeurlToLocation} from '../utils';

describe('绝对路径', () => {
  const curPathname = '/aa/bb/cc/';
  test('http://www.baidu.com', () => {
    const url = 'http://www.baidu.com';
    expect(checkUrl(url, curPathname)).toBe('/');
  });
  test('aa/bb/cc?dd=1&ee=2#ff=3&gg=4', () => {
    const url = 'aa/bb/cc?dd=1&ee=2#ff=3&gg=4';
    expect(checkUrl(url, curPathname)).toBe('/aa/bb/cc?dd=1&ee=2#ff=3&gg=4');
  });
  test('/aa/bb/cc?dd=1&ee=2#ff=3&gg=4', () => {
    const url = '/aa/bb/cc?dd=1&ee=2#ff=3&gg=4';
    expect(checkUrl(url, curPathname)).toBe('/aa/bb/cc?dd=1&ee=2#ff=3&gg=4');
  });
  test('/aa/bb/cc/?dd=1&ee=2#ff=3&gg=4', () => {
    const url = '/aa/bb/cc/?dd=1&ee=2#ff=3&gg=4';
    expect(checkUrl(url, curPathname)).toBe('/aa/bb/cc?dd=1&ee=2#ff=3&gg=4');
  });
  test('/aa/bb/cc/#ff=3&gg=4', () => {
    const url = 'aa/bb/cc/#ff=3&gg=4';
    expect(checkUrl(url, curPathname)).toBe('/aa/bb/cc#ff=3&gg=4');
  });
  test('/aa/bb/cc/', () => {
    const url = '/aa/bb/cc/';
    expect(checkUrl(url, curPathname)).toBe('/aa/bb/cc');
  });
});
describe('相对路径./', () => {
  const curPathname1 = '/aa/bb/cc/';
  const curPathname2 = 'aa/bb/cc';
  const curPathname3 = '/aa/bb/cc';
  const curPathname4 = 'aa/bb/cc/';
  test('./aa/bb/cc?dd=1&ee=2#ff=3&gg=4', () => {
    const url = './aa/bb/cc?dd=1&ee=2#ff=3&gg=4';
    expect(checkUrl(url, curPathname1)).toBe('/aa/bb/cc/aa/bb/cc?dd=1&ee=2#ff=3&gg=4');
  });
  test('./aa/bb/cc?dd=1&ee=2#ff=3&gg=4', () => {
    const url = './aa/bb/cc?dd=1&ee=2#ff=3&gg=4';
    expect(checkUrl(url, curPathname2)).toBe('/aa/bb/cc/aa/bb/cc?dd=1&ee=2#ff=3&gg=4');
  });
  test('./aa/bb/cc?dd=1&ee=2#ff=3&gg=4', () => {
    const url = './aa/bb/cc?dd=1&ee=2#ff=3&gg=4';
    expect(checkUrl(url, curPathname3)).toBe('/aa/bb/cc/aa/bb/cc?dd=1&ee=2#ff=3&gg=4');
  });
  test('./aa/bb/cc?dd=1&ee=2#ff=3&gg=4', () => {
    const url = './aa/bb/cc?dd=1&ee=2#ff=3&gg=4';
    expect(checkUrl(url, curPathname4)).toBe('/aa/bb/cc/aa/bb/cc?dd=1&ee=2#ff=3&gg=4');
  });
});
describe('相对路径../', () => {
  const curPathname1 = '/aa/bb/cc/';
  const curPathname2 = 'aa/bb/cc';
  const curPathname3 = '/aa/bb/cc';
  const curPathname4 = 'aa/bb/cc/';
  test('../aa/bb/cc?dd=1&ee=2#ff=3&gg=4', () => {
    const url = '../aa/bb/cc?dd=1&ee=2#ff=3&gg=4';
    expect(checkUrl(url, curPathname1)).toBe('/aa/bb/aa/bb/cc?dd=1&ee=2#ff=3&gg=4');
  });
  test('../aa/bb/cc?dd=1&ee=2#ff=3&gg=4', () => {
    const url = '../aa/bb/cc?dd=1&ee=2#ff=3&gg=4';
    expect(checkUrl(url, curPathname2)).toBe('/aa/bb/aa/bb/cc?dd=1&ee=2#ff=3&gg=4');
  });
  test('../aa/bb/cc?dd=1&ee=2#ff=3&gg=4', () => {
    const url = '../aa/bb/cc?dd=1&ee=2#ff=3&gg=4';
    expect(checkUrl(url, curPathname3)).toBe('/aa/bb/aa/bb/cc?dd=1&ee=2#ff=3&gg=4');
  });
  test('../aa/bb/cc?dd=1&ee=2#ff=3&gg=4', () => {
    const url = '../aa/bb/cc?dd=1&ee=2#ff=3&gg=4';
    expect(checkUrl(url, curPathname4)).toBe('/aa/bb/aa/bb/cc?dd=1&ee=2#ff=3&gg=4');
  });

  test('../../aa/bb/cc?dd=1&ee=2#ff=3&gg=4', () => {
    const url = '../../aa/bb/cc?dd=1&ee=2#ff=3&gg=4';
    expect(checkUrl(url, curPathname1)).toBe('/aa/aa/bb/cc?dd=1&ee=2#ff=3&gg=4');
  });
  test('../../aa/bb/cc?dd=1&ee=2#ff=3&gg=4', () => {
    const url = '../../aa/bb/cc?dd=1&ee=2#ff=3&gg=4';
    expect(checkUrl(url, curPathname2)).toBe('/aa/aa/bb/cc?dd=1&ee=2#ff=3&gg=4');
  });
  test('../../aa/bb/cc?dd=1&ee=2#ff=3&gg=4', () => {
    const url = '../../aa/bb/cc?dd=1&ee=2#ff=3&gg=4';
    expect(checkUrl(url, curPathname3)).toBe('/aa/aa/bb/cc?dd=1&ee=2#ff=3&gg=4');
  });
  test('../../aa/bb/cc?dd=1&ee=2#ff=3&gg=4', () => {
    const url = '../../aa/bb/cc?dd=1&ee=2#ff=3&gg=4';
    expect(checkUrl(url, curPathname4)).toBe('/aa/aa/bb/cc?dd=1&ee=2#ff=3&gg=4');
  });

  test('../../../aa/bb/cc?dd=1&ee=2#ff=3&gg=4', () => {
    const url = '../../../aa/bb/cc?dd=1&ee=2#ff=3&gg=4';
    expect(checkUrl(url, curPathname1)).toBe('/aa/bb/cc?dd=1&ee=2#ff=3&gg=4');
  });
  test('../../../aa/bb/cc?dd=1&ee=2#ff=3&gg=4', () => {
    const url = '../../../aa/bb/cc?dd=1&ee=2#ff=3&gg=4';
    expect(checkUrl(url, curPathname2)).toBe('/aa/bb/cc?dd=1&ee=2#ff=3&gg=4');
  });
  test('../../../aa/bb/cc?dd=1&ee=2#ff=3&gg=4', () => {
    const url = '../../../aa/bb/cc?dd=1&ee=2#ff=3&gg=4';
    expect(checkUrl(url, curPathname3)).toBe('/aa/bb/cc?dd=1&ee=2#ff=3&gg=4');
  });
  test('../../../aa/bb/cc?dd=1&ee=2#ff=3&gg=4', () => {
    const url = '../../../aa/bb/cc?dd=1&ee=2#ff=3&gg=4';
    expect(checkUrl(url, curPathname4)).toBe('/aa/bb/cc?dd=1&ee=2#ff=3&gg=4');
  });

  test('../../../../aa/bb/cc?dd=1&ee=2#ff=3&gg=4', () => {
    const url = '../../../../aa/bb/cc?dd=1&ee=2#ff=3&gg=4';
    expect(checkUrl(url, curPathname1)).toBe('/aa/bb/cc?dd=1&ee=2#ff=3&gg=4');
  });
  test('../../../../aa/bb/cc?dd=1&ee=2#ff=3&gg=4', () => {
    const url = '../../../../aa/bb/cc?dd=1&ee=2#ff=3&gg=4';
    expect(checkUrl(url, curPathname2)).toBe('/aa/bb/cc?dd=1&ee=2#ff=3&gg=4');
  });
  test('../../../../aa/bb/cc?dd=1&ee=2#ff=3&gg=4', () => {
    const url = '../../../../aa/bb/cc?dd=1&ee=2#ff=3&gg=4';
    expect(checkUrl(url, curPathname3)).toBe('/aa/bb/cc?dd=1&ee=2#ff=3&gg=4');
  });
  test('../../../../aa/bb/cc?dd=1&ee=2#ff=3&gg=4', () => {
    const url = '../../../../aa/bb/cc?dd=1&ee=2#ff=3&gg=4';
    expect(checkUrl(url, curPathname4)).toBe('/aa/bb/cc?dd=1&ee=2#ff=3&gg=4');
  });
});
describe('urlToLocation', () => {
  test('/aa/bb/cc?dd=1&ee=2#ff=3&gg=4', () => {
    const url = '/aa/bb/cc?dd=1&ee=2#ff=3&gg=4';
    expect(safeurlToLocation(url)).toEqual({
      pathname: '/aa/bb/cc',
      search: '?dd=1&ee=2',
      hash: '#ff=3&gg=4',
    });
  });
  test('/aa/bb/cc?dd=1&ee=2#', () => {
    const url = '/aa/bb/cc?dd=1&ee=2#';
    expect(safeurlToLocation(url)).toEqual({
      pathname: '/aa/bb/cc',
      search: '?dd=1&ee=2',
      hash: '',
    });
  });
  test('/aa/bb/cc?dd=1&ee=2', () => {
    const url = '/aa/bb/cc?dd=1&ee=2';
    expect(safeurlToLocation(url)).toEqual({
      pathname: '/aa/bb/cc',
      search: '?dd=1&ee=2',
      hash: '',
    });
  });
  test('/aa/bb/cc?', () => {
    const url = '/aa/bb/cc?';
    expect(safeurlToLocation(url)).toEqual({
      pathname: '/aa/bb/cc',
      search: '',
      hash: '',
    });
  });
  test('/aa/bb/cc', () => {
    const url = '/aa/bb/cc';
    expect(safeurlToLocation(url)).toEqual({
      pathname: '/aa/bb/cc',
      search: '',
      hash: '',
    });
  });
  test('/aa/bb/cc?#ff=3&gg=4', () => {
    const url = '/aa/bb/cc?#ff=3&gg=4';
    expect(safeurlToLocation(url)).toEqual({
      pathname: '/aa/bb/cc',
      search: '',
      hash: '#ff=3&gg=4',
    });
  });
  test('/aa/bb/cc#ff=3&gg=4', () => {
    const url = '/aa/bb/cc#ff=3&gg=4';
    expect(safeurlToLocation(url)).toEqual({
      pathname: '/aa/bb/cc',
      search: '',
      hash: '#ff=3&gg=4',
    });
  });
});
describe('locationToUrl', () => {
  test('/aa/bb/cc?dd=1&ee=2#ff=3&gg=4', () => {
    const location = {
      pathname: '/aa/bb/cc',
      search: '?dd=1&ee=2',
      hash: '#ff=3&gg=4',
    };
    expect(safelocationToUrl(location)).toBe('/aa/bb/cc?dd=1&ee=2#ff=3&gg=4');
  });
  test('/aa/bb/cc?dd=1&ee=2', () => {
    const location = {
      pathname: '/aa/bb/cc',
      search: '?dd=1&ee=2',
      hash: '',
    };
    expect(safelocationToUrl(location)).toBe('/aa/bb/cc?dd=1&ee=2');
  });
  test('/aa/bb/cc?dd=1&ee=2', () => {
    const location = {
      pathname: '/aa/bb/cc',
      search: '',
      hash: '',
    };
    expect(safelocationToUrl(location)).toBe('/aa/bb/cc');
  });
});
