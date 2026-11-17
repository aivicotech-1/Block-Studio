/* The Python workspace extends the existing studio without replacing block projects. */
(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const KEY = 'block-studio.python.v1';
  const initial = {'Stage.py':'# Stage script — runs first with Run All\nimport time\n', 'Sprite1.py':"sprite = Sprite('Sprite1')\n\n# Make something wonderful.\nsprite.say('Hello, world!')\nprint('Welcome to Block Studio Python!')\n"};
  let files = {...initial}, active = 'Sprite1.py', worker, busy = false, initialized = false, repl = false, fontSize = 15;
  let history = {}, histories = {}, saveTimer, watchdog;
  let configuration=StudioCatalog.normalizeConfig(), notebook=StudioCatalog.normalizeNotebook();
  let requestSequence=0, inputToken=null;
  const pendingRequests=new Map();
  const deletedFiles = [];
  try {
    const saved = JSON.parse(localStorage.getItem(KEY));
    if (saved) { validate(saved); files = saved.files; active = saved.active in files ? saved.active : Object.keys(files)[0]; configuration=StudioCatalog.normalizeConfig(saved.configuration); notebook=StudioCatalog.normalizeNotebook(saved.notebook); }
  } catch (_) { /* Keep the starter if browser recovery is unavailable or corrupt. */ }
  const panel = document.createElement('section');
  panel.id = 'python-workspace'; panel.hidden = true; panel.setAttribute('aria-label', 'Python workspace');
  panel.innerHTML = `
    <aside class="pf"><div class="pf-heading">Project Files <button id="pf-add" title="New Python file" aria-label="New Python file">＋</button><button id="pf-import" title="Import Python file" aria-label="Import Python file">↥</button></div><div id="pf-list"></div>
    <div class="pf-bottom"><span class="python-round">Py</span><div class="pf-heading">Modules / Libraries</div><button class="module" id="pf-api">▧ &nbsp; Sprite</button><div id="pf-enabled-extensions"></div><button class="module" id="pf-packages">↓ &nbsp; Install Packages</button><button class="module" id="pf-extensions">＋ &nbsp; Add Extension</button><button class="module" id="pf-notebook">▤ &nbsp; Py Notebook</button><button class="module" id="pf-example">✧ &nbsp; Example programs</button><p>Python in your browser<br><span id="pf-runtime">Ready to initialize</span></p><button class="library-round" id="pf-help" aria-label="Python help">?</button></div></aside>
    <div class="pe"><div class="pe-toolbar"><span id="pe-filename"></span><span class="pe-tools"><button id="pe-find" title="Find (Ctrl+F)">⌕</button><button id="pe-comment" title="Toggle comment (Ctrl+/)">#</button><button id="pe-smaller" title="Decrease font size">A−</button><button id="pe-larger" title="Increase font size">A+</button><button id="pe-export" title="Download active Python file">↓</button><button id="pe-more" title="File actions">⋯</button></span></div>
    <div id="pe-search" hidden><input id="pe-query" placeholder="Find in file" aria-label="Find in file"><button id="pe-next">Find next</button><button id="pe-close-find" aria-label="Close find">×</button><span id="pe-matches"></span></div>
    <div class="pe-code"><pre id="pe-lines" aria-hidden="true">1</pre><div class="pe-source"><pre id="pe-highlight" aria-hidden="true"></pre><textarea id="pe-input" aria-label="Python source code" spellcheck="false" autocapitalize="off" autocomplete="off" autocorrect="off" wrap="off"></textarea></div></div>
    <div class="pe-status"><span id="pe-position">Ln 1, Col 1</span><span>Spaces: 4</span><span>UTF-8</span><span id="pe-save">Saved locally</span><span>Python</span></div></div>
    <section class="pt"><div class="pt-toolbar"><div class="pt-tabs"><button id="pt-terminal" class="selected">❯❯ Terminal</button><button id="pt-log">▤ Log</button></div><div class="pt-actions"><button id="pt-run">▶ Run</button><button id="pt-all">▷ Run All</button><button id="pt-stop" disabled>■ Stop</button><button id="pt-repl">⌘ REPL</button><button id="pt-clear" title="Clear output">⌫</button><button id="pt-save" title="Export Python project">↓ Project</button></div></div>
    <pre id="pt-output" role="log" aria-label="Python terminal output"></pre><pre id="pt-events" hidden role="log" aria-label="Execution log"></pre><form id="pt-stdin-form" hidden><label id="pt-stdin-prompt" for="pt-stdin">Input</label><input id="pt-stdin" autocomplete="off" aria-label="Python input"><button>Send input</button></form><form id="pt-repl-form" hidden><label for="pt-command">❯❯❯</label><input id="pt-command" autocomplete="off" placeholder="Enter a Python expression…"><button>Enter</button></form></section>`;
  document.querySelector('main').prepend(panel);
  const input = $('pe-input');
  const importer = document.createElement('input'); importer.type = 'file'; importer.accept = '.py,.json'; importer.hidden = true; panel.append(importer);
  function validate(project) {
    if (project.format !== 'block-studio-python' || project.version !== 1 || !project.files || typeof project.files !== 'object' || Array.isArray(project.files)) throw Error('Invalid Python project.');
    const names = Object.keys(project.files);
    if (!names.length || names.length > 100 || names.some(n => !/^[A-Za-z_]\w*\.py$/.test(n) || typeof project.files[n] !== 'string' || project.files[n].length > 1000000)) throw Error('Invalid Python files or project exceeds limits.');
    if(project.scene!==undefined)StudioSceneModel.normalize(project.scene);
    StudioCatalog.normalizeConfig(project.configuration);
    StudioCatalog.normalizeNotebook(project.notebook);
  }
  function project(includeScene=true) { const result={format:'block-studio-python',version:1,name:$('pname').value,active,files,configuration,notebook,savedAt:Date.now()};if(includeScene&&window.StudioScene)result.scene=StudioScene.capture();return result; }
  function ask(title, message, value, choices = ['Continue']) {
    return new Promise(resolve => {
      const dialog=document.createElement('dialog'); dialog.className='studio-dialog';
      const heading=document.createElement('h2');heading.textContent=title;dialog.append(heading);
      const p=document.createElement('p');p.textContent=message;dialog.append(p);
      let field;
      if(value!==undefined){field=document.createElement('input');field.setAttribute('aria-label',title);field.value=value;dialog.append(field);}
      const actions=document.createElement('div');actions.className='studio-dialog-actions';dialog.append(actions);
      let settled=false;
      function finish(result){if(settled)return;settled=true;dialog.close();dialog.remove();resolve(result);}
      const cancel=document.createElement('button');cancel.textContent='Cancel';cancel.onclick=()=>finish(null);actions.append(cancel);
      choices.forEach(choice=>{const b=document.createElement('button');b.textContent=choice;b.className='primary';b.onclick=()=>finish(field?field.value:choice);actions.append(b);});
      dialog.addEventListener('cancel',e=>{e.preventDefault();finish(null);});
      if(field)field.onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();finish(field.value);}};
      document.body.append(dialog);dialog.showModal();if(field){field.focus();field.select();}
    });
  }
  function persist() { try { localStorage.setItem(KEY, JSON.stringify(project())); $('pe-save').textContent = 'Saved locally'; } catch (_) { $('pe-save').textContent = 'Storage unavailable — export project'; } }
  function download(name, text, type='text/plain') { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([text],{type})); a.download = name; a.click(); setTimeout(() => URL.revokeObjectURL(a.href),1000); }
  function output(message, type='stdout') { const pre = $('pt-output'); const line = document.createElement('span'); line.className = 'output-' + type; line.textContent = message + '\n'; pre.append(line); while (pre.childNodes.length > 1500) pre.firstChild.remove(); pre.scrollTop = pre.scrollHeight; }
  function log(text) { $('pt-events').textContent += new Date().toLocaleTimeString() + '  ' + text + '\n'; }
  function position() { const before = input.value.slice(0,input.selectionStart).split('\n'); $('pe-position').textContent = `Ln ${before.length}, Col ${before.at(-1).length+1}`; }
  function escape(text) { return text.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
  function highlight() {
    const token = /("""[\s\S]*?(?:"""|$)|'''[\s\S]*?(?:'''|$)|"(?:\\.|[^"\\\n])*"|'(?:\\.|[^'\\\n])*'|#[^\n]*|\b(?:False|None|True|and|as|assert|async|await|break|class|continue|def|del|elif|else|except|finally|for|from|global|if|import|in|is|lambda|nonlocal|not|or|pass|raise|return|try|while|with|yield)\b|\b\d+(?:\.\d+)?\b|\b(?:print|range|len|str|int|float|list|dict|Sprite)\b)/g;
    let html='', end=0;
    for (const m of input.value.matchAll(token)) { html += escape(input.value.slice(end,m.index)); const t=m[0], cls=t[0]==='#'?'comment': /^["']/.test(t)?'string': /^\d/.test(t)?'number': /^(print|range|len|str|int|float|list|dict|Sprite)$/.test(t)?'builtin':'keyword'; html += `<span class="syn-${cls}">${escape(t)}</span>`; end=m.index+t.length; }
    $('pe-highlight').innerHTML = html + escape(input.value.slice(end)) + '\n';
    $('pe-lines').textContent = input.value.split('\n').map((_,i)=>i+1).join('\n'); position(); syncScroll();
  }
  function syncScroll() { $('pe-highlight').scrollTop = input.scrollTop; $('pe-highlight').scrollLeft = input.scrollLeft; $('pe-lines').scrollTop = input.scrollTop; }
  function list() {
    $('pf-list').replaceChildren();
    Object.keys(files).forEach(name => { const b=document.createElement('button'); b.className='pf-file'+(name===active?' selected':''); b.textContent='▧  '+name; b.onclick=()=>open(name); $('pf-list').append(b); });
    $('pe-filename').textContent='▧  '+active;
  }
  function open(name) { active=name; input.value=files[name]; histories[name] ||= [files[name]]; input.setSelectionRange(0,0); list(); highlight(); persist(); }
  function edited() { files[active]=input.value; const h=histories[active] ||= [files[active]]; h.push(input.value); if(h.length>100)h.shift(); history[active]=[]; highlight(); $('pe-save').textContent='Saving…'; clearTimeout(saveTimer); saveTimer=setTimeout(persist,300); }
  function replace(start,end,text) { input.setRangeText(text,start,end,'end'); edited(); }
  function setBusy(value) { busy=value; ['pt-run','pt-all'].forEach(id=>$(id).disabled=value); $('pt-stop').disabled=!value; $('pt-command').disabled=value; }
  function runtimeData() {
    SP[spi].x=x;SP[spi].y=y;SP[spi].dir=dir;
    const enabled=[...StudioCatalog.extensions,...configuration.customExtensions].filter(e=>configuration.extensions.includes(e.id));
    const requirements=[...new Map([...enabled.flatMap(e=>e.requirements),...configuration.packages].map(r=>[StudioCatalog.packageName(r),r])).values()];
    const extensionFiles=Object.assign({},...configuration.customExtensions.filter(e=>configuration.extensions.includes(e.id)).map(e=>e.modules));
    return {files,requirements,extensions:configuration.extensions,extensionFiles,inputState:window.StudioInput?.snapshot(),sprites:SP.map(s=>({n:s.n,x:s.x,y:s.y,dir:s.dir}))};
  }
  function request(type, payload={}) {
    if(busy)return Promise.reject(Error('Python is busy. Stop the current task before starting another.'));
    spawn();setBusy(true);
    const requestId='request-'+(++requestSequence);
    return new Promise((resolve,reject)=>{pendingRequests.set(requestId,{resolve,reject});worker.postMessage({...runtimeData(),...payload,type,requestId});});
  }
  function spawn() {
    if(worker)return;
    worker=new Worker('python-worker.js', {type:'module'});
    worker.onmessage=({data:d})=>{
      document.dispatchEvent(new CustomEvent('studio:python-event',{detail:d}));
      if(d.type==='input-request'){$('pt-stdin-form').hidden=false;$('pt-stdin-prompt').textContent=d.prompt||'Input';inputToken=d.token;$('pt-stdin').focus();return;}
      if(d.type==='bridge-request'){const sourceWorker=worker;Promise.resolve().then(()=>window.StudioPythonBridge(d.action,d.args)).then(value=>sourceWorker?.postMessage({type:'bridge-response',token:d.token,value}),error=>sourceWorker?.postMessage({type:'bridge-response',token:d.token,error:error.message}));return;}
      if(d.type==='result'){setBusy(false);$('pf-runtime').textContent='Python runtime ready';const pending=pendingRequests.get(d.requestId);pendingRequests.delete(d.requestId);pending?.resolve(d.value);return;}
      if(d.type==='sprite') { bridge(d); return; }
      if(d.type==='stdout'||d.type==='stderr') output(d.text,d.type);
      if(d.type==='status') { $('pf-runtime').textContent=d.text; log(d.text); }
      if(d.type==='ready') { initialized=true; $('pf-runtime').textContent='Python ready'; }
      if(d.type==='done'||d.type==='error') { clearTimeout(watchdog); setBusy(false); initialized=d.type==='done'; $('pf-runtime').textContent=d.type==='done'?'Python ready':'Execution failed'; log(d.text); if(d.type==='error')output(d.text,'error'); else output('Process finished.','system'); }
      if(d.type==='done'||d.type==='error'){const pending=pendingRequests.get(d.requestId);pendingRequests.delete(d.requestId);d.type==='error'?pending?.reject(Error(d.text)):pending?.resolve(d.text);$('pt-stdin-form').hidden=true;inputToken=null;}
    };
    worker.onerror=e=>{ output('Python could not start: '+e.message+'. Check your internet connection and retry.','error'); terminate(); };
  }
  function bridge(d) {
    if(window.StudioExtensionEvent?.(d))return;
    const i=SP.findIndex(s=>s.n===d.name); if(i<0)return;
    const selected=spi; if(i!==spi)selSprite(i);
    const a=d.args;
    if(d.action==='goto'){x=a[0];y=a[1];}
    if(d.action==='turn')dir=a[0];
    if(d.action==='say')say(a[0]);
    if(d.action==='show')sp.style.visibility='visible';
    if(d.action==='hide')sp.style.visibility='hidden';
    if(d.action==='size'){size=a[0];showCos();}
    if(d.action==='costume'){cosI=(cosI+1)%COS.length;showCos();}
    upd(); if(selected!==spi)selSprite(selected);
  }
  function run(all=false,code=null) {
    if(busy)return;
    if(code!==null&&!initialized){output('Run a Python file once before using the REPL.','system');return;}
    spawn(); setBusy(true); log('Executing '+(code!==null?'console':all?'all project files':active));
    output(code!==null?'>>> '+code:'Running '+(all?'project':active)+'…','system');
    worker.postMessage({...runtimeData(),type:'run',entries:code!==null?['<console>']:all?Object.keys(files).sort((a,b)=>a==='Stage.py'?-1:b==='Stage.py'?1:0):[active],repl:code!==null,code});
    watchdog=setTimeout(()=>{if(busy)output('Still running. Use Stop to end execution, including infinite loops.','system');},30000);
  }
  function terminate() { clearTimeout(watchdog); if(worker)worker.terminate();worker=null; initialized=false;setBusy(false);$('pt-stdin-form').hidden=true;inputToken=null;pendingRequests.forEach(p=>p.reject(Error('Python task cancelled.')));pendingRequests.clear();document.dispatchEvent(new CustomEvent('studio:python-reset'));$('pf-runtime').textContent='Stopped · runtime will restart'; }
  const oldTab=window.tab;
  window.tab=function(n) { oldTab(n); const on=n==='tP'; document.body.classList.toggle('python-mode',on); panel.hidden=!on; if(on){cats.hidden=pal.hidden=wsEl.hidden=true;open(active);} };
  $('go').onclick=()=>document.body.classList.contains('python-mode')?run(true):go();
  const oldStop=$('stop').onclick; $('stop').onclick=()=>{terminate();oldStop();};
  $('pt-run').onclick=()=>run(); $('pt-all').onclick=()=>run(true); $('pt-stop').onclick=()=>{terminate();output('Execution stopped.','system');};
  input.oninput=edited; input.onscroll=syncScroll; input.onclick=input.onkeyup=position;
  input.addEventListener('keydown',e=>{
    if(e.key==='Tab'){e.preventDefault();const start=input.value.lastIndexOf('\n',input.selectionStart-1)+1;if(e.shiftKey){if(input.value.slice(start,start+4)==='    ')replace(start,start+4,'');}else replace(input.selectionStart,input.selectionEnd,'    ');}
    if(e.key==='Enter'&&!e.ctrlKey&&!e.metaKey){e.preventDefault();const line=input.value.slice(0,input.selectionStart).split('\n').at(-1);replace(input.selectionStart,input.selectionEnd,'\n'+(line.match(/^\s*/)||[''])[0]+(line.trimEnd().endsWith(':')?'    ':''));}
    if((e.ctrlKey||e.metaKey)&&e.key==='/'){e.preventDefault();comment();}
    if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='z'){e.preventDefault();const h=histories[active]||[],r=history[active]||=[];if(e.shiftKey){if(r.length){h.push(r.pop());input.value=h.at(-1);}}else if(h.length>1){r.push(h.pop());input.value=h.at(-1);}files[active]=input.value;highlight();persist();}
  });
  function comment(){const start=input.value.lastIndexOf('\n',input.selectionStart-1)+1;let end=input.value.indexOf('\n',input.selectionEnd);if(end<0)end=input.value.length;const lines=input.value.slice(start,end).split('\n'),remove=lines.every(l=>/^\s*#/.test(l));replace(start,end,lines.map(l=>remove?l.replace(/^(\s*)# ?/,'$1'):'# '+l).join('\n'));}
  $('pe-comment').onclick=comment;
  $('pe-find').onclick=()=>{$('pe-search').hidden=false;$('pe-query').focus();}; $('pe-close-find').onclick=()=>{$('pe-search').hidden=true;input.focus();};
  $('pe-next').onclick=()=>{const query=$('pe-query').value;if(!query)return;let at=input.value.indexOf(query,input.selectionEnd);if(at<0)at=input.value.indexOf(query);$('pe-matches').textContent=at<0?'No matches':'';if(at>=0){input.focus();input.setSelectionRange(at,at+query.length);input.scrollTop=Math.max(0,(input.value.slice(0,at).split('\n').length-4)*fontSize*1.6);syncScroll();}};
  $('pe-query').onkeydown=e=>{if(e.key==='Enter')$('pe-next').click();};
  function font(delta){fontSize=Math.max(11,Math.min(26,fontSize+delta));panel.style.setProperty('--code-size',fontSize+'px');}
  $('pe-larger').onclick=()=>font(1);$('pe-smaller').onclick=()=>font(-1);
  $('pe-export').onclick=()=>download(active,input.value);$('pt-save').onclick=()=>download(($('pname').value||'project')+'.python.json',JSON.stringify(project(),null,2),'application/json');
  $('pf-add').onclick=async()=>{const name=await ask('New Python file','Use a unique name ending in .py.','script.py',['Create']);if(!name)return;if(!/^[A-Za-z_]\w*\.py$/.test(name)||Object.hasOwn(files,name)||Object.keys(files).length>=100){output('Use a unique Python filename, up to 100 files.','error');return;}files[name]='';open(name);input.focus();};
  $('pe-more').onclick=async()=>{
    const target=active;
    const action=await ask('File actions',target,undefined,['Rename','Delete']);
    if(action==='Delete'){
      if(Object.keys(files).length===1){output('Keep at least one Python file.','system');return;}
      if(await ask('Delete file','Delete '+target+'?',undefined,['Delete file'])){deletedFiles.push({name:target,source:files[target]});delete files[target];delete histories[target];delete history[target];open(Object.keys(files)[0]);}
    }else if(action==='Rename'){
      const name=await ask('Rename file','Choose a new Python filename.',target,['Rename file']);
      if(name===target)return;
      if(name&&/^[A-Za-z_]\w*\.py$/.test(name)&&!Object.hasOwn(files,name)){
        files[name]=files[target];histories[name]=histories[target];history[name]=history[target];delete files[target];delete histories[target];delete history[target];open(name);
      }else if(name)output('Use a unique valid Python filename.','error');
    }
  };
  $('pf-import').onclick=()=>importer.click();importer.onchange=async()=>{const file=importer.files[0];if(!file)return;try{if(file.size>32000000)throw Error('Project file exceeds 32 MB.');const text=await file.text();if(file.name.endsWith('.json')){const p=JSON.parse(text);validate(p);if(!await ask('Import project','Replace current Python files with this project?',undefined,['Replace project']))return;terminate();if(p.scene)StudioScene.restore(p.scene);files=p.files;configuration=StudioCatalog.normalizeConfig(p.configuration);notebook=StudioCatalog.normalizeNotebook(p.notebook);document.dispatchEvent(new CustomEvent('studio:configuration'));deletedFiles.length=0;histories={};history={};if(typeof p.name==='string')$('pname').value=p.name.slice(0,120);open(p.active in files?p.active:Object.keys(files)[0]);}else{if(!/^[A-Za-z_]\w*\.py$/.test(file.name))throw Error('Use a Python filename such as helpers.py.');if(Object.hasOwn(files,file.name)&&!await ask('Replace file','Replace '+file.name+'?',undefined,['Replace file']))return;files[file.name]=text;open(file.name);}}catch(e){output(e.message,'error');}finally{importer.value='';}};
  $('pt-clear').onclick=()=>{$('pt-output').replaceChildren();$('pt-events').textContent='';};
  $('pt-terminal').onclick=()=>{ $('pt-output').hidden=false;$('pt-events').hidden=true;$('pt-terminal').classList.add('selected');$('pt-log').classList.remove('selected');};
  $('pt-log').onclick=()=>{$('pt-output').hidden=true;$('pt-events').hidden=false;$('pt-log').classList.add('selected');$('pt-terminal').classList.remove('selected');};
  $('pt-repl').onclick=()=>{repl=!repl;$('pt-repl-form').hidden=!repl;$('pt-repl').classList.toggle('selected',repl);if(repl)$('pt-command').focus();};
  $('pt-repl-form').onsubmit=e=>{e.preventDefault();const command=$('pt-command').value;if(command.trim()){run(false,command);$('pt-command').value='';}};
  function help(){dlg('Python · Sprite API','<p>Run executes the active file. Run All executes Stage.py first, then the other files in file order. Each run starts a fresh Python namespace. REPL keeps the last run’s variables.</p><pre>sprite = Sprite("Sprite1")\nsprite.move(50)\nsprite.turn(15)\nsprite.goto(0, 0)\nsprite.changex(10)\nsprite.changey(10)\nsprite.say("Hello!", 2)\nsprite.show()\nsprite.hide()\nsprite.set_size(100)\nsprite.next_costume()\nsprite.bounce_on_edge()</pre><p>Use the exact sprite name from the stage panel. Standard Python libraries are available. Files can import each other. Use Install Packages for compatible PyPI packages. Use Add Extension to enable Pen, Music, speech, camera, sensing, models, virtual hardware and charts. Standard input() prompts are supported in project scripts. Native hardware drivers and proprietary PictoBlox APIs are not included.</p><p>Shortcuts: Ctrl+Enter Run · Ctrl+Shift+Enter Run All · Ctrl+S Export project · Ctrl+F Find · Ctrl+/ Comment · Tab Indent · Shift+Tab Unindent</p>');}
  $('pf-help').onclick=$('pf-api').onclick=help;
  $('pf-example').onclick=async()=>{const name=SP[spi].n;const code=`import time\n\nsprite = Sprite(${JSON.stringify(name)})\nsprite.goto(-120, 0)\nfor step in range(12):\n    sprite.move(20)\n    time.sleep(0.1)\nsprite.say('I did it!')\nprint('Final position:', sprite.x, sprite.y)\n`;if(await ask('Example program','Add a walking sprite example?',undefined,['Add example'])){let name='walking.py',i=2;while(Object.hasOwn(files,name))name='walking'+i+++'.py';files[name]=code;open(name);}};
  document.addEventListener('keydown',e=>{if(!document.body.classList.contains('python-mode')||document.body.classList.contains('notebook-mode'))return;const ctrl=e.ctrlKey||e.metaKey;if(ctrl&&e.key==='Enter'){e.preventDefault();run(e.shiftKey);}if(ctrl&&e.key.toLowerCase()==='s'){e.preventDefault();$('pt-save').click();}if(ctrl&&e.key.toLowerCase()==='f'){e.preventDefault();$('pe-find').click();}},true);
  // In Python mode, the shared File menu operates on Python projects.
  document.addEventListener('click',async e=>{const b=e.target.closest('[data-a]');if(!b||!document.body.classList.contains('python-mode'))return;const action=b.dataset.a;if(!['save','load','new','undo','redo','restore'].includes(action))return;e.preventDefault();e.stopImmediatePropagation();if(action==='restore'){const file=deletedFiles.at(-1);if(!file)output('No deleted Python files to restore.','system');else if(Object.hasOwn(files,file.name))output('Rename the existing '+file.name+' before restoring the deleted file.','error');else{deletedFiles.pop();files[file.name]=file.source;open(file.name);}}if(action==='save')$('pt-save').click();if(action==='load')importer.click();if(action==='new'&&await ask('New Python project','Create a new Python project? Export first to keep this one.',undefined,['Create project'])){terminate();window.StudioScene?.reset();files={...initial};configuration=StudioCatalog.normalizeConfig();notebook=StudioCatalog.normalizeNotebook();document.dispatchEvent(new CustomEvent('studio:configuration'));deletedFiles.length=0;history={};histories={};$('pname').value='My Project';open('Sprite1.py');}if(action==='undo'||action==='redo'){input.dispatchEvent(new KeyboardEvent('keydown',{key:'z',ctrlKey:true,shiftKey:action==='redo',bubbles:true}));}},true);
  $('pname').addEventListener('input',persist);
  window.addEventListener('beforeunload',persist);
  document.body.append($('pt-stdin-form'));
  $('pt-stdin-form').onsubmit=event=>{
    event.preventDefault();if(inputToken===null||!worker)return;
    worker.postMessage({type:'input-response',token:inputToken,value:$('pt-stdin').value});
    output(($('pt-stdin-prompt').textContent||'')+$('pt-stdin').value,'system');
    $('pt-stdin').value='';$('pt-stdin-form').hidden=true;inputToken=null;
  };
  window.StudioPython={
    getProject:()=>JSON.parse(JSON.stringify(project())),
    getMetadata:()=>JSON.parse(JSON.stringify(project(false))),
    loadMetadata:p=>{validate(p);terminate();files={...p.files};configuration=StudioCatalog.normalizeConfig(p.configuration);notebook=StudioCatalog.normalizeNotebook(p.notebook);history={};histories={};active=p.active in files?p.active:Object.keys(files)[0];open(active);document.dispatchEvent(new CustomEvent('studio:configuration'));},
    getConfiguration:()=>JSON.parse(JSON.stringify(configuration)),
    configure:(value,{restart=true}={})=>{if(busy)throw Error('Stop Python before changing extensions or packages.');configuration=StudioCatalog.normalizeConfig(value);if(restart)terminate();persist();document.dispatchEvent(new CustomEvent('studio:configuration'));},
    getNotebook:()=>JSON.parse(JSON.stringify(notebook)),
    setNotebook:value=>{notebook=StudioCatalog.normalizeNotebook(value);persist();},
    getActive:()=>active,
    writeFile:(name,source)=>{if(!/^[A-Za-z_]\w*\.py$/.test(name)||typeof source!=='string'||source.length>1000000)throw Error('Invalid Python file.');if(!(name in files)&&Object.keys(files).length>=100)throw Error('Project file limit reached.');files[name]=source;open(name);},
    request,
    runCell:code=>request('cell',{entries:['<notebook>'],repl:true,code}),
    requirements:()=>runtimeData().requirements,
    restart:terminate,
    isBusy:()=>busy,
    sendInputState:value=>worker?.postMessage({type:'input-state',value}),
    notify:output,
    ask,
    download
  };
  for(const name of Object.keys(files))histories[name]=[files[name]];
  open(active);output('Python terminal · Run your code to get started.','system');
  // Open the editor directly with ?editor=python; the original landing page is preserved.
  if(new URLSearchParams(location.search).get('editor')==='python'){$('land').hidden=true;window.tab('tP');}
})();
