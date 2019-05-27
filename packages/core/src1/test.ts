const ddd: number[] = [1, 2, 3];
const eee = {};
export function bbb(...args: any[]) {
  return {...args, ccc: [...ddd], ...eee};
}
export default class A {
  public x = () => 1;
}
