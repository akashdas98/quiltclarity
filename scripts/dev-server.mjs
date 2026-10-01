import { spawn } from 'node:child_process';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const DEFAULT_PORT = 4322;

function parseArguments(cliArguments) {
  let port = DEFAULT_PORT;
  const astroArguments = [];

  for (let index = 0; index < cliArguments.length; index += 1) {
    const argument = cliArguments[index];

    if (argument === '--port' || argument === '-p') {
      port = cliArguments[index + 1];
      index += 1;
      continue;
    }

    if (argument.startsWith('--port=')) {
      port = argument.slice('--port='.length);
      continue;
    }

    if (/^\d+$/.test(argument)) {
      port = argument;
      continue;
    }

    astroArguments.push(argument);
  }

  const parsedPort = Number(port);
  if (!Number.isInteger(parsedPort) || parsedPort < 1 || parsedPort > 65_535) {
    throw new Error(
      `Invalid port "${String(port)}". Use an integer from 1 to 65535.`,
    );
  }

  return { astroArguments, port: parsedPort };
}

try {
  const { astroArguments, port } = parseArguments(process.argv.slice(2));
  const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
  const astroCli = path.resolve(
    scriptDirectory,
    '../node_modules/astro/bin/astro.mjs',
  );
  const child = spawn(
    process.execPath,
    [astroCli, 'dev', '--port', String(port), ...astroArguments],
    {
      env: { ...process.env, ASTRO_TELEMETRY_DISABLED: '1' },
      stdio: 'inherit',
    },
  );

  child.on('error', (error) => {
    process.stderr.write(
      `Could not start the Astro development server: ${error.message}\n`,
    );
    process.exitCode = 1;
  });

  child.on('exit', (code, signal) => {
    if (signal) {
      process.kill(process.pid, signal);
      return;
    }

    process.exitCode = code ?? 1;
  });
} catch (error) {
  process.stderr.write(
    `${error instanceof Error ? error.message : String(error)}\n`,
  );
  process.exitCode = 1;
}
