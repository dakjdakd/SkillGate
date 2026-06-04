import { spawn } from 'node:child_process';

const isWindows = process.platform === 'win32';
const npmCommand = isWindows ? 'npm.cmd' : 'npm';

const processes = [
  start('api', ['run', 'server']),
  start('web', ['run', 'dev:frontend'])
];

function start(label, args) {
  const command = isWindows ? 'cmd.exe' : npmCommand;
  const commandArgs = isWindows ? ['/d', '/s', '/c', [npmCommand, ...args].join(' ')] : args;
  const child = spawn(command, commandArgs, {
    stdio: ['ignore', 'pipe', 'pipe'],
    shell: false
  });

  child.stdout.on('data', chunk => writeLines(label, chunk));
  child.stderr.on('data', chunk => writeLines(label, chunk));
  child.on('exit', code => {
    if (code && !shuttingDown) {
      console.error(`[${label}] exited with code ${code}`);
      shutdown(code);
    }
  });

  return child;
}

let shuttingDown = false;

function writeLines(label, chunk) {
  const text = chunk.toString();
  for (const line of text.split(/\r?\n/)) {
    if (line.trim()) console.log(`[${label}] ${line}`);
  }
}

function shutdown(code = 0) {
  shuttingDown = true;
  for (const child of processes) {
    if (!child.killed) child.kill();
  }
  process.exit(code);
}

process.on('SIGINT', () => shutdown(0));
process.on('SIGTERM', () => shutdown(0));
