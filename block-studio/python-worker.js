/* Python runs off the UI thread. Terminating this worker also stops infinite loops. */
import './studio-catalog.js';
let runtime, executionHelpers, extensionHelpers, hasScope = false, activeRequest = null;
let sequence = 0;
let packageNames = new Set();
const waiting = new Map(), installed = new Set();
const send = (type, text) => postMessage({type, text, requestId: activeRequest});
globalThis.studioInputState = '{}';
globalThis.studioInput = prompt => new Promise((resolve, reject) => {
  const token = ++sequence; waiting.set(token, {resolve, reject});
  postMessage({type:'input-request', token, prompt, requestId:activeRequest});
});
globalThis.studioBridge = (action, args) => new Promise((resolve, reject) => {
  const token = ++sequence; waiting.set(token, {resolve, reject});
  postMessage({type:'bridge-request', token, action, args:JSON.parse(args), requestId:activeRequest});
});
async function ensurePackages(py, requirements=[]) {
  for (const raw of requirements) {
    const spec = StudioCatalog.normalizeRequirement(raw);
    if (installed.has(spec)) continue;
    send('status', 'Installing ' + spec + '…');
    const name = StudioCatalog.packageName(spec);
    if (name === spec && packageNames.has(name)) {
      await py.loadPackage(name, {messageCallback:message=>send('status',message)});
    } else {
      await py.loadPackage('micropip');
      py.globals.set('_studio_requirement', spec);
      await py.runPythonAsync('import micropip\nawait micropip.install(_studio_requirement)');
    }
    installed.add(spec);
  }
}
async function packageInventory(py) {
  return JSON.parse(await py.runPythonAsync("import importlib.metadata as _md, json as _json\n_json.dumps(sorted([{'name': d.metadata['Name'], 'version': d.version} for d in _md.distributions() if d.metadata['Name']], key=lambda d: d['name'].lower()))"));
}
async function boot() {
  if (!runtime || !executionHelpers || !extensionHelpers) {
    send('status', 'Loading Python runtime…');
    const lockResponse=await fetch(new URL('vendor/pyodide/pyodide-lock.json', import.meta.url));
    if(!lockResponse.ok)throw Error('Could not load the Python package index.');
    packageNames=new Set(Object.keys((await lockResponse.json()).packages));
    const { loadPyodide } = await import('./vendor/pyodide/pyodide.mjs');
    runtime = await loadPyodide({
      indexURL: new URL('vendor/pyodide/', import.meta.url).href,
      packageBaseUrl: new URL('vendor/pyodide/', import.meta.url).href,
      stdout: text => send('stdout', text),
      stderr: text => send('stderr', text)
    });
    [executionHelpers, extensionHelpers] = await Promise.all(['python-execution.py','python-extensions.py'].map(async name=>{const response=await fetch(new URL(name,import.meta.url));if(!response.ok)throw Error('Could not load '+name);return response.text();}));
    await runtime.runPythonAsync(executionHelpers);
  }
  return runtime;
}
async function handle(data) {
  activeRequest = data.requestId || null;
  try {
    const py = await boot();
    if(data.inputState)globalThis.studioInputState=JSON.stringify(data.inputState);
    if (data.type === 'install' || data.type === 'inspect') {
      if(data.type === 'install') await ensurePackages(py, data.requirements);
      postMessage({type:'result', requestId:activeRequest, value:await packageInventory(py)});
      return;
    }
    await ensurePackages(py, data.requirements);
    if (data.type === 'init') { send('ready', 'Python ready'); return; }
    py.FS.mkdirTree('/studio');
    if (!data.repl) for (const name of py.FS.readdir('/studio')) {
      if (name.endsWith('.py')) py.FS.unlink('/studio/' + name);
    }
    if(Object.keys(data.extensionFiles||{}).some(name=>Object.hasOwn(data.files,name)))throw Error('An extension module conflicts with a project file. Rename the project file.');
    for (const [name, source] of Object.entries({...data.extensionFiles,...data.files})) py.FS.writeFile('/studio/' + name, source);
    py.globals.set('_studio_sprites', JSON.stringify(data.sprites));
    if (!data.repl || !hasScope) {
      await py.runPythonAsync(`
import sys, os, json, math, time, builtins
sys.dont_write_bytecode = True
from js import postMessage
from pyodide.ffi import to_js
os.chdir('/studio')
if '/studio' not in sys.path: sys.path.insert(0, '/studio')
for _name in list(sys.modules):
    if (getattr(sys.modules[_name], '__file__', '') or '').startswith('/studio/'):
        del sys.modules[_name]
_sprites = {s['n']: s for s in json.loads(_studio_sprites)}
def _emit(name, action, *args):
    postMessage(to_js({'type':'sprite', 'name':name, 'action':action, 'args':list(args)}, dict_converter=__import__('js').Object.fromEntries))
class Sprite:
    def __init__(self, name):
        if name not in _sprites: raise ValueError('Unknown sprite: ' + name)
        self.name = name
        self._state = _sprites[name]
    @property
    def x(self): return self._state['x']
    @x.setter
    def x(self, value): self.goto(value, self.y)
    @property
    def y(self): return self._state['y']
    @y.setter
    def y(self, value): self.goto(self.x, value)
    @property
    def direction(self): return self._state['dir']
    @direction.setter
    def direction(self, value):
        self._state['dir'] = float(value) % 360
        _emit(self.name, 'turn', self.direction)
    def goto(self, x, y):
        self._state['x'], self._state['y'] = float(x), float(y)
        _emit(self.name, 'goto', self.x, self.y)
    def move(self, steps):
        a = math.radians(self.direction - 90)
        self.goto(self.x + float(steps)*math.cos(a), self.y - float(steps)*math.sin(a))
    def turn(self, degrees):
        self.direction = (self.direction + float(degrees)) % 360
    def changex(self, amount): self.goto(self.x + amount, self.y)
    def changey(self, amount): self.goto(self.x, self.y + amount)
    def say(self, text, seconds=None):
        _emit(self.name, 'say', str(text))
        if seconds is not None: time.sleep(max(0, float(seconds)))
    think = say
    def show(self): _emit(self.name, 'show')
    def hide(self): _emit(self.name, 'hide')
    def set_size(self, size): _emit(self.name, 'size', float(size))
    def next_costume(self): _emit(self.name, 'costume')
    def touching_edge(self): return abs(self.x) >= 230 or abs(self.y) >= 170
    def bounce_on_edge(self):
        if self.touching_edge(): self.turn(180)
def _input(prompt=''):
    print(prompt)
    raise RuntimeError('Interactive input() is unavailable. Use the REPL to assign a value instead.')
builtins.input = _input
_studio_scope = {'__name__':'__main__', 'Sprite':Sprite}
`);
      py.globals.set('_studio_extensions_json',JSON.stringify(data.extensions||['sprite']));
      await py.runPythonAsync('_studio_extension_ids = json.loads(_studio_extensions_json)');
      await py.runPythonAsync(extensionHelpers);
      hasScope = true;
    }
    send('status', data.repl ? 'REPL' : 'Running…');
    for (const name of data.entries) {
      const code = data.repl ? data.code : data.files[name];
      py.globals.set('_studio_code', code);
      py.globals.set('_studio_filename', name);
      // Interactive evaluation returns expression results and preserves variables.
      const result = await py.runPythonAsync("_studio_value = await _studio_execute(_studio_code, _studio_filename, _studio_scope, capture_last=" + (data.repl ? 'True' : 'False') + ")\nNone if _studio_value is None else repr(_studio_value)");
      if (result !== undefined && result !== null) send('stdout', String(result));
      if (result && result.destroy) result.destroy();
    }
    send('done', 'Finished');
  } catch (error) { send('error', String(error.message || error)); } finally { activeRequest = null; }
}
let queue = Promise.resolve();
self.onmessage = ({data}) => {
  if(data.type==='input-response'||data.type==='bridge-response'){const pending=waiting.get(data.token);if(pending){waiting.delete(data.token);data.error?pending.reject(Error(data.error)):pending.resolve(data.type==='bridge-response'?JSON.stringify(data.value):data.value);}return;}
  if(data.type==='input-state'){globalThis.studioInputState=JSON.stringify(data.value);return;}
  queue=queue.then(()=>handle(data)).catch(error=>send('error',String(error)));
};
