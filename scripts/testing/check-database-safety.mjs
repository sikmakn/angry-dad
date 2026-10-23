import { readdir, readFile } from 'node:fs/promises';
import { resolve, relative } from 'node:path';
import ts from 'typescript';

// This gate checks executable calls, including bracket access; comments and documentation remain readable.
const forbidden = new Set(['dropDatabase', 'dropCollection', 'dropAppDatabase']);
const roots = ['apps/api/src', 'apps/api/test', 'apps/web/src', 'apps/web/test', 'scripts'];
const violations = [];

async function scan(directory) {
  let entries;
  try {
    entries = await readdir(directory, { withFileTypes: true });
  } catch (error) {
    if (error.code === 'ENOENT') {
      return;
    }
    throw error;
  }
  for (const entry of entries) {
    const path = resolve(directory, entry.name);
    if (entry.isDirectory() && !['node_modules', 'dist', 'coverage', '.git', 'test-results', 'playwright-report'].includes(entry.name)) {
      await scan(path);
    } else if (entry.isFile() && /\.(?:[cm]?[jt]s|tsx)$/.test(entry.name)) {
      const source = ts.createSourceFile(path, await readFile(path, 'utf8'), ts.ScriptTarget.Latest, true);
      function nameOf(node) {
        if (ts.isIdentifier(node) || ts.isStringLiteral(node)) {
          return node.text;
        }
        return undefined;
      }
      function inspect(node) {
        if (ts.isCallExpression(node)) {
          const callee = node.expression;
          const name = ts.isPropertyAccessExpression(callee)
            ? callee.name.text
            : ts.isElementAccessExpression(callee)
              ? nameOf(callee.argumentExpression)
              : nameOf(callee);
          let reason = forbidden.has(name) ? name : undefined;
          if (name === 'drop') {
            reason = 'collection removal';
          }
          if (['command', 'runCommand', 'adminCommand'].includes(name) && node.arguments[0] && ts.isObjectLiteralExpression(node.arguments[0])) {
            if (node.arguments[0].properties.some(property => ['drop', 'dropDatabase'].includes(nameOf(property.name)))) {
              reason = 'database/collection removal command';
            }
          }
          if (reason) {
            const { line } = source.getLineAndCharacterOfPosition(node.getStart(source));
            violations.push(`${relative(process.cwd(), path)}:${line + 1}: ${reason}`);
          }
        }
        ts.forEachChild(node, inspect);
      }
      inspect(source);
    }
  }
}

for (const root of roots) {
  await scan(resolve(root));
}
if (violations.length) {
  console.error('Database/collection removal is forbidden. Clean up only the owned test container.');
  console.error(violations.join('\n'));
  process.exitCode = 1;
} else {
  console.log('Database safety: no database/collection removal calls.');
}
