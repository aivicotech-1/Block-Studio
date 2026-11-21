/* Package management, extension catalogue, browser bridges and a cell notebook. */
(() => {
  'use strict';
  const api=window.StudioPython, catalog=window.StudioCatalog, $=id=>document.getElementById(id);
  let installed=[], operation=false, managerTab='extensions', generation=0;
  const dialog=document.createElement('dialog');dialog.id='studio-manager';dialog.className='studio-manager';
  dialog.innerHTML=`<header><div><strong>Workspace tools</strong><small>Build your Python environment</small></div><button id="tools-close" aria-label="Close workspace tools">×</button></header>
    <nav class="tools-tabs"><button id="tools-tab-extensions">＋ Add Extension</button><button id="tools-tab-packages">↓ Install Packages</button></nav>
    <div class="tools-filters"><input id="tools-search" aria-label="Search workspace tools" placeholder="Search extensions…"><select id="tools-category" aria-label="Extension category"><option>All</option><option>Creative</option><option>Interaction</option><option>AI &amp; Language</option><option>Hardware</option><option>Data &amp; Science</option><option>Custom</option></select><button id="tools-import">Import extension</button><button id="tools-template">Get template</button><button id="tools-refresh" hidden>Refresh installed</button></div>
    <form id="tools-install-form" hidden><label for="tools-package-name">Package name or version</label><input id="tools-package-name" placeholder="e.g. numpy or emoji==2.15.0" autocomplete="off"><button id="tools-install">Install package</button></form>
    <p id="tools-note"></p><div id="tools-installed"></div><div class="tools-grid" id="tools-grid"></div><p id="tools-status" role="status">Choose an extension to get started.</p>`;
  document.body.append(dialog);
  const extensionInput=document.createElement('input');extensionInput.type='file';extensionInput.accept='.json';extensionInput.hidden=true;dialog.append(extensionInput);
  const setStatus=(text,error=false)=>{$('tools-status').textContent=text;$('tools-status').classList.toggle('error',error);};
  function button(text,action,disabled=false){const b=document.createElement('button');b.textContent=text;b.disabled=disabled;b.onclick=action;return b;}
  function heading(text){const h=document.createElement('h3');h.textContent=text;return h;}
  function text(text,tag='p'){const p=document.createElement(tag);p.textContent=text;return p;}
  function enabledCatalog(config=api.getConfiguration()){return [...catalog.extensions,...config.customExtensions];}
  async function operate(task){if(operation||api.isBusy()){setStatus('Python is busy. Stop the current task before changing your environment.',true);return;}operation=true;render();try{await task();}catch(error){setStatus(error.message||String(error),true);}finally{operation=false;render();}}
  function requiredPackages(config){return enabledCatalog(config).filter(e=>config.extensions.includes(e.id)).flatMap(e=>e.requirements).map(catalog.packageName);}
  async function install(spec){
    spec=catalog.normalizeRequirement(spec);
    await operate(async()=>{
      setStatus('Installing '+spec+'…');
      const requirements=[...new Map([...api.requirements(),spec].map(r=>[catalog.packageName(r),r])).values()];
      installed=await api.request('install',{requirements});
      const config=api.getConfiguration();config.packages=[...new Map([...config.packages,spec].map(r=>[catalog.packageName(r),r])).values()];
      api.configure(config,{restart:false});setStatus(spec+' installed. You can import it in Python now.');
    });
  }
  async function toggleExtension(extension){
    await operate(async()=>{
      const config=api.getConfiguration(), on=config.extensions.includes(extension.id);
      if(on){config.extensions=config.extensions.filter(id=>id!==extension.id);api.configure(config);setStatus(extension.name+' removed. The kernel will restart for the next run.');}
      else{
        if(extension.requirements.length){setStatus('Installing extension dependencies…');installed=await api.request('install',{requirements:[...api.requirements(),...extension.requirements]});}
        config.extensions.push(extension.id);api.configure(config);setStatus(extension.name+' added. Its modules are available on your next Run.');
      }
    });
  }
  function insertExample(extension){
    const project=api.getProject(), name=api.getActive();
    api.writeFile(name,project.files[name].replace(/\s*$/,'')+'\n\n# '+extension.name+' example\n'+extension.example);
    dialog.close();window.tab('tP');
  }
  function render(){
    const config=api.getConfiguration(), query=$('tools-search').value.toLowerCase().trim();
    $('tools-tab-extensions').classList.toggle('selected',managerTab==='extensions');$('tools-tab-packages').classList.toggle('selected',managerTab==='packages');
    for(const id of ['tools-category','tools-import','tools-template'])$(id).hidden=managerTab!=='extensions';
    for(const id of ['tools-install-form','tools-refresh'])$(id).hidden=managerTab!=='packages';
    $('tools-search').placeholder=managerTab==='extensions'?'Search extensions…':'Search recommended packages…';
    $('tools-note').textContent=managerTab==='extensions'?'Add Python modules to this project. Extension choices are saved with your project.':'Install pure-Python wheels and Pyodide-compatible scientific packages. Downloads need internet access. Native desktop libraries are not supported in this browser kernel.';
    const grid=$('tools-grid');grid.replaceChildren();$('tools-installed').replaceChildren();
    if(managerTab==='extensions'){
      const entries=enabledCatalog(config).filter(e=>(e.name+' '+e.description+' '+e.category).toLowerCase().includes(query)&&($('tools-category').value==='All'||$('tools-category').value===e.category));
      for(const extension of entries){
        const on=config.extensions.includes(extension.id),card=document.createElement('article');card.className='tools-card'+(on?' added':'');
        card.append(text(extension.icon,'i'),text(extension.category,'small'),heading(extension.name),text(extension.description));
        card.append(text('Modules: '+(Array.isArray(extension.modules)?extension.modules:Object.keys(extension.modules).map(n=>n.replace(/\.py$/,''))).join(', '),'code'));
        if(extension.requirements.length)card.append(text('Packages: '+extension.requirements.join(', '),'small'));
        const actions=document.createElement('div');actions.className='tools-card-actions';
        actions.append(button(extension.id==='sprite'?'Built in':on?'Remove':'Add extension',()=>toggleExtension(extension),operation||extension.id==='sprite'));
        if(extension.example)actions.append(button('Insert example',()=>insertExample(extension),!on||operation));
        card.append(actions);grid.append(card);
      }
      if(!entries.length)grid.append(text('No extensions match your search.'));
    }else{
      const section=$('tools-installed');section.append(heading('Project packages'));
      const dependencies=requiredPackages(config), declared=config.packages;
      const names=[...new Set([...declared.map(catalog.packageName),...dependencies])];
      if(!names.length)section.append(text('No third-party packages declared yet. Standard Python libraries are included.'));
      for(const name of names){
        const row=document.createElement('div');row.className='tools-package-row';
        const item=installed.find(p=>catalog.packageName(p.name)===name);
        row.append(text(name,'strong'),text(item?item.version:'Restore on next Run','span'));
        if(dependencies.includes(name))row.append(text('Required by extension','small'));
        else row.append(button('Remove',()=>operate(async()=>{const next=api.getConfiguration();next.packages=next.packages.filter(r=>catalog.packageName(r)!==name);api.configure(next);setStatus(name+' removed from this project. Kernel reset.');}),operation));
        section.append(row);
      }
      for(const entry of catalog.packages.filter(p=>(p.name+' '+p.description).toLowerCase().includes(query))){
        const card=document.createElement('article');card.className='tools-card';card.append(text('↓','i'),heading(entry.name),text(entry.description));
        card.append(button(names.includes(entry.name)?'Reinstall / restore':'Install',()=>install(entry.name),operation));grid.append(card);
      }
      if(installed.length)section.append(text(installed.length+' distributions currently loaded, including runtime dependencies.','small'));
    }
    $('tools-install').disabled=operation;$('tools-refresh').disabled=operation;
  }
  function sidebar(){
    const config=api.getConfiguration();$('pf-enabled-extensions').replaceChildren();
    for(const extension of enabledCatalog(config).filter(e=>e.id!=='sprite'&&config.extensions.includes(e.id))){const b=button(extension.icon+'  '+extension.name,()=>showManager('extensions'));b.className='module';$('pf-enabled-extensions').append(b);}
  }
  function showManager(tab='extensions'){managerTab=tab;$('tools-search').value='';if(!operation)setStatus(tab==='packages'?'Choose a recommended package or enter a package name.':'Choose an extension to add to this project.');render();if(!dialog.open)dialog.showModal();}
  $('pf-packages').onclick=()=>showManager('packages');$('pf-extensions').onclick=()=>showManager('extensions');
  $('tools-close').onclick=()=>dialog.close();$('tools-tab-extensions').onclick=()=>{managerTab='extensions';render();};$('tools-tab-packages').onclick=()=>{managerTab='packages';render();};
  $('tools-search').oninput=render;$('tools-category').onchange=render;
  $('tools-install-form').onsubmit=e=>{e.preventDefault();install($('tools-package-name').value).catch(error=>setStatus(error.message,true));};
  $('tools-refresh').onclick=()=>operate(async()=>{installed=await api.request('inspect');setStatus('Installed-package list refreshed.');});
  $('tools-import').onclick=()=>extensionInput.click();
  extensionInput.onchange=async()=>{try{const file=extensionInput.files[0];if(!file)return;if(file.size>2000000)throw Error('Extension manifest exceeds 2 MB.');const extension=catalog.validateExtension(JSON.parse(await file.text()));const config=api.getConfiguration();if(config.customExtensions.some(e=>e.id===extension.id))throw Error('An extension with this id already exists.');config.customExtensions.push(extension);api.configure(config);setStatus('Imported '+extension.name+'. Choose Add extension to enable it.');render();}catch(error){setStatus(error.message,true);}finally{extensionInput.value='';}};
  $('tools-template').onclick=()=>api.download('greeting.extension.json',JSON.stringify({format:'block-studio-extension',version:1,id:'custom:greeting',name:'Greeting',description:'A simple custom Python extension.',modules:{'ext_greeting.py':"def greet(name):\n    return 'Hello, ' + str(name)\n"},requirements:[],example:"from ext_greeting import greet\nprint(greet('Ada'))\n"},null,2),'application/json');
  document.addEventListener('studio:configuration',()=>{sidebar();if(dialog.open)render();});
  document.addEventListener('studio:python-event',({detail:d})=>{if(operation&&d.type==='status')setStatus(d.text);});

  // Browser-side implementations of Python extension messages.
  const penCanvas=$('stage-pen')||document.createElement('canvas');if(!penCanvas.id){penCanvas.id='stage-pen';penCanvas.width=480;penCanvas.height=360;$('stage').prepend(penCanvas);}const penContext=penCanvas.getContext('2d');
  const tones=new Set();let audio;
  function stopTones(){for(const oscillator of tones){try{oscillator.stop();}catch(_){} }tones.clear();}
  window.StudioExtensionEvent=d=>{
    const a=d.args||[];
    switch(d.action){
      case 'pen_line': if(a.slice(0,4).every(Number.isFinite)){penContext.beginPath();penContext.moveTo(240+a[0],180-a[1]);penContext.lineTo(240+a[2],180-a[3]);penContext.strokeStyle=CSS.supports('color',a[4])?a[4]:'#652080';penContext.lineWidth=Math.max(.5,Math.min(100,a[5]));penContext.lineCap='round';penContext.stroke();}return true;
      case 'pen_clear':penContext.clearRect(0,0,480,360);return true;
      case 'stage_next':bki=(bki+1)%BK.length;$('stage').style.background=BK[bki].c;listBk();return true;
      case 'stage_backdrop':{const index=BK.findIndex(b=>b.n===a[0]);if(index<0){api.notify('Unknown backdrop: '+a[0],'error');return true;}bki=index;$('stage').style.background=BK[bki].c;listBk();return true;}
      case 'stage_color':if(CSS.supports('color',a[0]))$('stage').style.background=a[0];return true;
      case 'board_led':HW.led=a[0]?1:0;hwUI();return true;
      case 'board_motor':HW.mot=a[0];hwUI();return true;
      case 'board_servo':HW.srv=a[0];hwUI();return true;
      case 'music_stop':stopTones();return true;
      case 'speech_stop':window.speechSynthesis?.cancel();return true;
      case 'figure':if(typeof a[0]==='string'&&a[0].startsWith('data:image/png;base64,')){const image=new Image();image.alt='Python chart';image.src=a[0];image.className='python-figure';$('pt-output').append(image);}return true;
      default:return false;
    }
  };
  window.StudioPythonBridge=async(action,a)=>{
    switch(action){
      case 'music_note':{
        if(!Number.isFinite(a[0])||a[0]<0||a[0]>127||!Number.isFinite(a[1])||a[1]>30)throw Error('Use a MIDI note from 0–127 and a duration of at most 30 seconds.');
        const Context=window.AudioContext||window.webkitAudioContext;if(!Context)throw Error('Web Audio is unavailable.');audio ||= new Context();await audio.resume();
        return new Promise(resolve=>{const oscillator=audio.createOscillator(),gain=audio.createGain();oscillator.frequency.value=440*Math.pow(2,(a[0]-69)/12);gain.gain.setValueAtTime(.15,audio.currentTime);gain.gain.exponentialRampToValueAtTime(.001,audio.currentTime+a[1]);oscillator.connect(gain);gain.connect(audio.destination);tones.add(oscillator);oscillator.onended=()=>{tones.delete(oscillator);oscillator.disconnect();gain.disconnect();resolve(true);};oscillator.start();oscillator.stop(audio.currentTime+a[1]);});
      }
      case 'speak':if(!window.speechSynthesis)throw Error('Text to Speech is unavailable in this browser.');return new Promise((resolve,reject)=>{const utterance=new SpeechSynthesisUtterance(a[0]);utterance.rate=Math.max(.1,Math.min(10,a[1]));utterance.lang=a[2];utterance.onend=()=>resolve(true);utterance.onerror=e=>reject(Error('Speech failed: '+e.error));speechSynthesis.speak(utterance);});
      case 'camera_start':{const current=generation;if(!navigator.mediaDevices?.getUserMedia)throw Error('Camera access is unavailable.');if(!camStream)camStream=await navigator.mediaDevices.getUserMedia({video:true});if(current!==generation){camOff();throw Error('Camera request cancelled.');}$('cam').srcObject=camStream;$('cam').hidden=false;await $('cam').play();return true;}
      case 'camera_stop':camOff();return true;
      case 'camera_capture':{const video=$('cam');if(!camStream||video.readyState<2)throw Error('Start the camera and wait for a frame before capture.');const c=document.createElement('canvas');c.width=video.videoWidth;c.height=video.videoHeight;c.getContext('2d').drawImage(video,0,0);return c.toDataURL('image/png');}
      case 'ml_text':if(!TR.text)throw Error('Train a text model in the ML environment first.');return nbPred(TR.text,a[0]).map(([label,confidence])=>({label,confidence}));
      case 'ml_number':{if(!TR.num)throw Error('Train a number model in the ML environment first.');const dimension=TR.num.reg?TR.num.M.mu.length:TR.num.st.mu.length;if(!Array.isArray(a[0])||a[0].length!==dimension||a[0].some(v=>typeof v!=='number'||!Number.isFinite(v)))throw Error('Provide exactly '+dimension+' numeric features.');return TR.num.reg?linPred(TR.num.M,a[0]):knn(a[0].map((v,i)=>(v-TR.num.st.mu[i])/TR.num.st.sd[i]),TR.num.S).map(([label,confidence])=>({label,confidence}));}
      case 'board_sensors':return {temperature:HW.t,light:HW.l,distance:HW.d,button:!!HW.btn};
      case 'board_write':{const bytes=new TextEncoder().encode(a[0]+'\n');if(wr)await wr.write(bytes);else if(bleChar)await bleChar.writeValue(bytes);else throw Error('Connect a compatible UART device using Connect first.');return true;}
      default:throw Error('Unknown extension action: '+action);
    }
  };
  const inputState={keys:[],mouseX:0,mouseY:0,mouseDown:false},keys=new Set();
  const publish=()=>{inputState.keys=[...keys];api.sendInputState(inputState);};
  window.StudioInput={snapshot:()=>({...inputState,keys:[...keys]})};
  document.addEventListener('keydown',event=>{if(/INPUT|TEXTAREA|SELECT/.test(event.target.tagName))return;keys.add(event.key===' '?'space':event.key.toLowerCase());publish();});
  document.addEventListener('keyup',event=>{keys.delete(event.key===' '?'space':event.key.toLowerCase());publish();});
  window.addEventListener('blur',()=>{keys.clear();inputState.mouseDown=false;publish();});
  $('stage').tabIndex=0;$('stage').addEventListener('pointermove',event=>{const r=$('stage').getBoundingClientRect();inputState.mouseX=Math.round(((event.clientX-r.left)/r.width-.5)*480);inputState.mouseY=Math.round((.5-(event.clientY-r.top)/r.height)*360);publish();});
  $('stage').addEventListener('pointerdown',()=>{inputState.mouseDown=true;publish();});document.addEventListener('pointerup',()=>{inputState.mouseDown=false;publish();});
  document.addEventListener('studio:python-reset',()=>{generation++;installed=[];stopTones();window.speechSynthesis?.cancel();});

  // Notebook cells use the same worker, packages and stage as the Python editor.
  const notebook=document.createElement('section');notebook.id='studio-notebook';notebook.hidden=true;
  notebook.innerHTML=`<div class="notebook-bar"><div><strong>Py Notebook</strong><small>Cells share one Python session</small></div><button id="notebook-run-all">▶ Run all cells</button><button id="notebook-stop">■ Stop</button><button id="notebook-reset">Reset kernel</button><button id="notebook-export">Export .ipynb</button><button id="notebook-import">Import .ipynb</button></div><div id="notebook-cells"></div><button id="notebook-add">＋ Add code cell</button><p id="notebook-status" role="status">Ready.</p>`;
  document.querySelector('main').prepend(notebook);
  const notebookTab=button('▤ Notebook',()=>window.tab('tN'));notebookTab.id='tN';notebookTab.setAttribute('role','tab');notebookTab.setAttribute('aria-selected','false');document.querySelector('.tabs').insertBefore(notebookTab,document.querySelector('.run'));
  let activeCell=null,cellCount=0,notebookRunning=false,selectedCell=null,batchCancelled=false;
  const notebookFigures=new Map();
  function cellId(){return 'cell-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,8);}
  function updateCells(cells){api.setNotebook(cells);renderNotebook();}
  function renderNotebook(){
    const cells=api.getNotebook(),container=$('notebook-cells');container.replaceChildren();
    cells.forEach((cell,index)=>{
      const card=document.createElement('article');card.className='notebook-cell';card.dataset.cell=cell.id;card.classList.toggle('selected',cell.id===selectedCell);card.addEventListener('focusin',()=>{selectedCell=cell.id;document.querySelectorAll('.notebook-cell').forEach(c=>c.classList.toggle('selected',c.dataset.cell===selectedCell));document.dispatchEvent(new Event('studio:notebook-selection'));});
      const bar=document.createElement('div');bar.className='notebook-cell-bar';bar.append(text((index+1)+'. '+(cell.type==='code'?'Python':'Markdown'),'strong'));
      const edit=()=>container.querySelector('[data-cell="'+cell.id+'"] textarea');
      bar.append(button('Run cell',()=>runCell(cell.id),notebookRunning||cell.type!=='code'),button('↑',()=>moveCell(cell.id,-1),notebookRunning||index===0),button('↓',()=>moveCell(cell.id,1),notebookRunning||index===cells.length-1),button('Duplicate',()=>{const next=api.getNotebook();next.splice(index+1,0,{...cell,id:cellId(),outputs:[]});updateCells(next);},notebookRunning||cells.length>=100),button(cell.type==='code'?'To markdown':'To code',()=>{const next=api.getNotebook();next[index].type=cell.type==='code'?'markdown':'code';updateCells(next);},notebookRunning),button('Delete',()=>updateCells(api.getNotebook().filter(c=>c.id!==cell.id)),notebookRunning||cells.length===1));
      const source=document.createElement('textarea');source.value=cell.source;source.spellcheck=false;source.wrap='off';source.setAttribute('aria-label','Notebook cell '+(index+1));source.rows=Math.max(3,Math.min(18,cell.source.split('\n').length+1));source.oninput=()=>{const next=api.getNotebook();next.find(c=>c.id===cell.id).source=source.value;api.setNotebook(next);};
      const output=document.createElement('pre');output.className='notebook-output';output.setAttribute('role','log');output.textContent=cell.outputs.join('\n');
      for(const source of notebookFigures.get(cell.id)||[]){const image=new Image();image.alt='Notebook chart';image.src=source;image.className='python-figure';output.append(image);}
      card.append(bar,source,output);
      if(cell.type==='markdown'){const preview=document.createElement('div');preview.className='notebook-markdown';preview.textContent=cell.source;source.oninput=()=>{const next=api.getNotebook();next.find(c=>c.id===cell.id).source=source.value;api.setNotebook(next);preview.textContent=source.value;};card.append(preview);}
      container.append(card);
    });
  }
  function moveCell(id,delta){const cells=api.getNotebook(),i=cells.findIndex(c=>c.id===id),target=i+delta;if(target<0||target>=cells.length)return;[cells[i],cells[target]]=[cells[target],cells[i]];updateCells(cells);}
  async function runCell(id,insideBatch=false){
    if((notebookRunning&&!insideBatch)||api.isBusy())return;
    const cells=api.getNotebook(),cell=cells.find(c=>c.id===id);if(!cell||cell.type!=='code')return;
    activeCell=id;cell.outputs=[];notebookFigures.delete(id);api.setNotebook(cells);notebookRunning=true;renderNotebook();$('notebook-status').textContent='Running cell…';
    try{await api.runCell(cell.source);cellCount++;$('notebook-status').textContent='Cell finished · execution '+cellCount;}
    catch(error){$('notebook-status').textContent=error.message;throw error;}
    finally{activeCell=null;notebookRunning=insideBatch;renderNotebook();}
  }
  async function runAll(ids=null){if(notebookRunning||api.isBusy())return;batchCancelled=false;notebookRunning=true;try{for(const cell of api.getNotebook()){if(batchCancelled)break;if(cell.type==='code'&&(!Array.isArray(ids)||ids.includes(cell.id)))await runCell(cell.id,true);}$('notebook-status').textContent='All cells finished.';}catch(_){}finally{notebookRunning=false;renderNotebook();}}
  // Avoid unhandled rejections from individual Run buttons.
  const previousRunCell=runCell;runCell=async(...args)=>{try{return await previousRunCell(...args);}catch(error){if(args[1])throw error;}};
  $('notebook-run-all').onclick=()=>runAll();$('notebook-stop').onclick=()=>{batchCancelled=true;api.restart();};$('notebook-reset').onclick=()=>{api.restart();cellCount=0;$('notebook-status').textContent='Kernel reset. Run cells to recreate variables.';};
  $('notebook-add').onclick=()=>{const cells=api.getNotebook();if(cells.length>=100)return;cells.push({id:cellId(),type:'code',source:'',outputs:[]});updateCells(cells);};
  const notebookInput=document.createElement('input');notebookInput.type='file';notebookInput.accept='.ipynb';notebookInput.hidden=true;notebook.append(notebookInput);
  $('notebook-import').onclick=()=>notebookInput.click();notebookInput.onchange=async()=>{try{const file=notebookInput.files[0];if(!file)return;if(file.size>2000000)throw Error('Notebook exceeds 2 MB.');const data=JSON.parse(await file.text());if(data.nbformat!==4||!Array.isArray(data.cells))throw Error('Choose a Jupyter notebook in nbformat 4.');const cells=data.cells.filter(c=>['code','markdown'].includes(c.cell_type)).map(c=>({id:cellId(),type:c.cell_type,source:Array.isArray(c.source)?c.source.join(''):c.source,outputs:[]}));if(!await api.ask('Import notebook','Replace the current notebook cells?',undefined,['Import notebook']))return;api.restart();updateCells(catalog.normalizeNotebook(cells));$('notebook-status').textContent='Notebook imported. Cells have not been executed.';}catch(error){$('notebook-status').textContent=error.message;}finally{notebookInput.value='';}};
  $('notebook-export').onclick=()=>{
    const cells=api.getNotebook().map(cell=>{
      const value={cell_type:cell.type,id:cell.id,metadata:{},source:cell.source.split(/(?<=\n)/)};
      if(cell.type==='code'){value.execution_count=null;value.outputs=cell.outputs.length?[{output_type:'stream',name:'stdout',text:cell.outputs.join('\n')}]:[];}
      return value;
    });
    api.download(($('pname').value||'project')+'.ipynb',JSON.stringify({nbformat:4,nbformat_minor:5,metadata:{kernelspec:{display_name:'Python (Block Studio)',language:'python',name:'python3'}},cells},null,2),'application/x-ipynb+json');
  };
  document.addEventListener('studio:python-event',({detail:d})=>{
    if(!activeCell)return;
    const target=$('notebook-cells').querySelector('[data-cell="'+activeCell+'"] .notebook-output');
    if(d.type==='stdout'||d.type==='stderr'||d.type==='error'){const cells=api.getNotebook(),cell=cells.find(c=>c.id===activeCell);if(cell){cell.outputs.push(d.text);cell.outputs=cell.outputs.slice(-100);api.setNotebook(cells);}if(target){target.textContent+=(target.textContent?'\n':'')+d.text;}}
    if(d.type==='sprite'&&d.action==='figure'&&target){const sources=notebookFigures.get(activeCell)||[];sources.push(d.args[0]);notebookFigures.set(activeCell,sources);const image=new Image();image.alt='Notebook chart';image.className='python-figure';image.src=d.args[0];target.append(image);}
  });
  const previousTab=window.tab;window.tab=n=>{previousTab(n==='tN'?'tP':n);document.body.classList.toggle('notebook-mode',n==='tN');notebook.hidden=n!=='tN';if(n==='tN'){$('python-workspace').hidden=true;$('tP').setAttribute('aria-selected','false');renderNotebook();}$('tN').setAttribute('aria-selected',n==='tN');};
  const previousGo=$('go').onclick;$('go').onclick=()=>document.body.classList.contains('notebook-mode')?runAll():previousGo();
  $('pf-notebook').onclick=()=>window.tab('tN');
  document.addEventListener('click',event=>{if(event.target.closest('[data-w="pn"]')){event.preventDefault();event.stopImmediatePropagation();$('land').hidden=true;window.tab('tN');}},true);
  document.addEventListener('keydown',event=>{if(document.body.classList.contains('notebook-mode')&&(event.ctrlKey||event.metaKey)&&event.key==='Enter'){event.preventDefault();event.stopPropagation();if(event.shiftKey)runAll();else{const id=event.target.closest('[data-cell]')?.dataset.cell;if(id)runCell(id);}}});
  document.addEventListener('studio:configuration',renderNotebook);
  window.StudioNotebook={render:renderNotebook,selected:()=>selectedCell||api.getNotebook()[0]?.id,select:id=>{selectedCell=id;renderNotebook();},runSelected:()=>runCell(selectedCell||api.getNotebook()[0]?.id),runAll:()=>runAll(),runRange:side=>{const cells=api.getNotebook(),index=cells.findIndex(c=>c.id===(selectedCell||cells[0]?.id));return runAll(cells.filter((_,i)=>side==='above'?i<index:i>index).map(c=>c.id));},add:direction=>{if(notebookRunning)return;const cells=api.getNotebook();if(cells.length>=100)return;const index=cells.findIndex(c=>c.id===(selectedCell||cells[0]?.id)),cell={id:cellId(),type:'code',source:'',outputs:[]};cells.splice(Math.max(0,index+(direction==='above'?0:1)),0,cell);selectedCell=cell.id;updateCells(cells);},remove:()=>{if(notebookRunning)return;const cells=api.getNotebook();if(cells.length>1)updateCells(cells.filter(c=>c.id!==(selectedCell||cells[0]?.id)));},setType:type=>{if(notebookRunning)return;const cells=api.getNotebook(),cell=cells.find(c=>c.id===(selectedCell||cells[0]?.id));if(cell){cell.type=type;updateCells(cells);}},clear:()=>{if(notebookRunning)return;notebookFigures.clear();updateCells(api.getNotebook().map(c=>({...c,outputs:[]})));},busy:()=>notebookRunning};sidebar();renderNotebook();
})();
