export function mapObject(o: Record<string, any>, transformFn: (el: any) => any): Record<string, any> {
  const new_o = {};
  const keys = Object.keys(o);
  for (let i = 0, c = keys.length; i < c; i++) {
    const k = keys[i];
    new_o[k] = transformFn(o[k]);
  }

  return new_o;
}
