import { readFile } from 'node:fs/promises';
import { describe, expect, it } from 'vitest';

describe('package manifest', () => {
  it('builds on prepare, so installing from a git ref ships the dist binary', async () => {
    const pkg = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8'));

    expect(pkg.files).toContain('dist');
    expect(pkg.bin.granola).toMatch(/^dist\//);
    expect(pkg.scripts.prepare).toBe(pkg.scripts.build);
  });
});
