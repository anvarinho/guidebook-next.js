// Run on the server with Node 24+, after SIGUSR1 enables its loopback inspector.
// Records allocation stacks and aggregate memory counts, never a heap snapshot.
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const [directory, duration = '180', port = '9229'] = process.argv.slice(2);
if (!directory || !Number.isInteger(Number(duration)) || Number(duration) < 30 || Number(duration) > 1800 || !/^\d+$/.test(port)) {
  throw new Error('Usage: node scripts/heap-sample.mjs PRIVATE_OUTPUT_DIRECTORY [SECONDS=180] [LOOPBACK_PORT=9229]');
}
const output = resolve(directory);
await mkdir(output, { recursive: true, mode: 0o700 });
const targets = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
const address = new URL(targets[0].webSocketDebuggerUrl);
if (!['127.0.0.1', 'localhost', '[::1]'].includes(address.hostname)) throw new Error('Inspector must use loopback');
const socket = new WebSocket(address);
const pending = new Map();
let sequence = 0;
socket.onmessage = ({ data }) => {
  const message = JSON.parse(String(data));
  const entry = pending.get(message.id);
  if (!entry) return;
  pending.delete(message.id);
  clearTimeout(entry.timer);
  if (message.error) entry.reject(new Error(JSON.stringify(message.error)));
  else entry.resolve(message.result);
};
function send(method, params = {}) {
  return new Promise((resolve, reject) => {
    const id = ++sequence;
    const timer = setTimeout(() => { pending.delete(id); reject(new Error(`Inspector timeout: ${method}`)); }, 10000);
    pending.set(id, { resolve, reject, timer });
    socket.send(JSON.stringify({ id, method, params }));
  });
}
await new Promise((resolve, reject) => { socket.onopen = resolve; socket.onerror = reject; });
try {
  await send('HeapProfiler.startSampling', { samplingInterval: 65536 });
  const end = Date.now() + Number(duration) * 1000;
  do {
    await new Promise(resolve => setTimeout(resolve, Math.min(30000, Math.max(1, end - Date.now()))));
    const memory = await send('Runtime.evaluate', {
      expression: 'JSON.stringify({pid:process.pid,memory:process.memoryUsage(),heap:process.getBuiltinModule("node:v8").getHeapStatistics(),spaces:process.getBuiltinModule("node:v8").getHeapSpaceStatistics()})',
      returnByValue: true,
    });
    const { profile } = await send('HeapProfiler.getSamplingProfile');
    const allocations = [];
    function visit(node, parents = []) {
      const frame = node.callFrame;
      const current = `${frame.functionName || '(anonymous)'} ${frame.url || '(native)'}:${frame.lineNumber + 1}`;
      if (node.selfSize) allocations.push({ bytes: node.selfSize, stack: [...parents.slice(-5), current] });
      for (const child of node.children || []) visit(child, [...parents.slice(-5), current]);
    }
    visit(profile.head);
    allocations.sort((a, b) => b.bytes - a.bytes);
    const report = { at: new Date().toISOString(), ...JSON.parse(memory.result.value), allocations: allocations.slice(0, 25) };
    await writeFile(resolve(output, 'latest.json'), JSON.stringify(report, null, 2), { mode: 0o600 });
    console.log(JSON.stringify(report));
  } while (Date.now() < end);
  await send('HeapProfiler.stopSampling');
} finally {
  // The inspection session is temporary; leave no listening debug port behind.
  try {
    await send('Runtime.evaluate', { expression: 'setTimeout(()=>process.getBuiltinModule("node:inspector").close(),100); undefined' });
  } catch { /* A crashed process or closed inspector is already disconnected. */ }
  socket.close();
  for (const entry of pending.values()) { clearTimeout(entry.timer); entry.reject(new Error('Inspector disconnected')); }
}
