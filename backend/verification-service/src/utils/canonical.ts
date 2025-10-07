export function canonicalStringify(value: unknown): string {
  const sorter = (a: [string, unknown], b: [string, unknown]) => a[0].localeCompare(b[0]);
  const seen = new WeakSet<object>();
  const stringify = (val: any): any => {
    if (val === null || typeof val !== 'object') return val;
    if (seen.has(val)) throw new Error('Circular refs not supported');
    seen.add(val);
    if (Array.isArray(val)) return val.map(stringify);
    return Object.fromEntries(Object.entries(val).sort(sorter).map(([k, v]) => [k, stringify(v)]));
  };
  return JSON.stringify(stringify(value));
}
