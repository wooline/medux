export default function loader(source: string) {
  return source.replace(/import\s*\(/gm, 'require(');
}
