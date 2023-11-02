#!/usr/bin/env node
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

function findPatchPath(): string {
  let eslintrcPath;
  if (fs.existsSync(path.join(process.cwd(), '.eslintrc.js'))) {
    eslintrcPath = '.eslintrc.js';
  } else if (fs.existsSync(path.join(process.cwd(), '.eslintrc.cjs'))) {
    eslintrcPath = '.eslintrc.cjs';
  } else {
    console.error(
      '@rushstack/eslint-bulk: Please run this command from the directory that contains .eslintrc.js or .eslintrc.cjs'
    );
    process.exit(1);
  }

  const env = { ...process.env, ESLINT_BULK_FIND: 'true' };

  let stdout: Buffer;
  try {
    stdout = execSync(`echo "" | eslint --stdin --config ${eslintrcPath}`, { env, stdio: 'pipe' });
  } catch (e) {
    console.error('@rushstack/eslint-bulk: Error finding patch path: ' + (e as Error).message);
    process.exit(1);
  }

  const startDelimiter = 'ESLINT_BULK_STDOUT_START';
  const endDelimiter = 'ESLINT_BULK_STDOUT_END';

  const regex = new RegExp(`${startDelimiter}(.*?)${endDelimiter}`);
  const match = stdout.toString().match(regex);

  if (match) {
    const filePath = match[1].trim();
    return filePath;
  }

  console.error(
    '@rushstack/eslint-bulk: Error finding patch path. Are you sure the package you are in has @rushstack/eslint-patch as a direct or indirect dependency?'
  );
  process.exit(1);
}

const patchPath = findPatchPath();
try {
  const args = process.argv.slice(2).join(' ');
  const command = `node ${patchPath} ${args}`;
  execSync(command, { stdio: 'inherit' });
} catch (e) {
  console.error(`@rushstack/eslint-bulk: Error running patch at ${patchPath}:\n` + (e as Error).message);
  process.exit(1);
}
