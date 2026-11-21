/* Dedicated notebook presentation. All selectors and styles stay within notebook mode. */
(() => {
  'use strict';
  const $=id=>document.getElementById(id), api=window.StudioPython, nb=window.StudioNotebook;
  const root=$('studio-notebook');
  const sidebar=document.createElement('aside');sidebar.className='nb-files';
  sidebar.innerHTML=`<div class="nb-files-title">Project Files <button id="nb-import" title="Import notebook" aria-label="Import notebook file">↥</button></div><button class="nb-file selected" id="nb-file">▧ <span>notebook.ipynb</span></button><div class="nb-file-actions"><button id="nb-export" title="Export notebook" aria-label="Export notebook">↓</button><button id="nb-add-round" title="Add code cell" aria-label="Add code cell">Py⁺</button></div><div class="nb-libraries"><div>Modules / Libraries</div><button id="nb-sprite-api">▧ Sprite</button><button id="nb-packages" title="Install Packages" aria-label="Install Packages">▣</button><button id="nb-extensions" title="Add Extension" aria-label="Add Extension">＋</button><p>Python notebook<br><span id="nb-kernel">Kernel idle</span></p></div>`;
  const editor=document.createElement('div');editor.className='nb-editor';
  const toolbar=document.createElement('div');toolbar.className='nb-toolbar';
  toolbar.innerHTML=`<select id="nb-type" aria-label="Selected cell type"><option value="code">Code</option><option value="markdown">Markdown</option></select><button id="nb-above" title="Insert cell above" aria-label="Insert cell above">＋ ↑</button><button id="nb-below" title="Insert cell below" aria-label="Insert cell below">＋ ↓</button><button id="nb-delete" title="Delete selected cell" aria-label="Delete selected cell">♜</button><button id="nb-terminal-toggle" aria-expanded="false">❯❯ Terminal</button>`;
  const footer=document.createElement('div');footer.className='nb-execution';
  footer.innerHTML=`<div><button id="nb-restart">↶ Restart</button><button id="nb-restart-run">↶ Restart &amp; Run All</button><button id="nb-restart-clear">↶ Restart &amp; Clear Output</button></div><div><button id="nb-run">▶ Run</button><button id="nb-run-all">▷ Run All</button><button id="nb-run-above">▷ Run All Above</button><button id="nb-run-below">▷ Run All Below</button><button id="nb-stop">■ Stop</button></div>`;
  const terminal=document.createElement('section');terminal.className='nb-terminal';terminal.hidden=true;
  terminal.innerHTML=`<div><strong>❯❯ Terminal</strong><span>Python notebook</span><button id="nb-terminal-clear">Clear</button><button id="nb-terminal-close" aria-label="Close notebook terminal">×</button></div><pre id="nb-terminal-output" role="log" aria-label="Notebook terminal output">Run a cell to see its output here.</pre>`;
  const cells=$('notebook-cells'), add=$('notebook-add'), status=$('notebook-status');
  const canvas=document.createElement('div');canvas.className='nb-canvas';canvas.append(cells,add);
  editor.append(canvas,status,terminal);root.prepend(sidebar,editor);document.querySelector('.tabs').insertBefore(toolbar,document.querySelector('.tabs .run'));document.querySelector('main').append(footer);
  const oldBar=root.querySelector('.notebook-bar');oldBar.hidden=true;$('nb-delete').innerHTML='<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M4 6h16M9 6V3h6v3M6 6l1 15h10l1-15M10 10v7m4-7v7" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  const info=document.querySelector('.side .info'),originalInfoNodes=Array.from(info.childNodes),spritePanel=document.createElement('div'),backdropPanel=document.createElement('div');spritePanel.className='nb-sprite-panel';backdropPanel.className='nb-backdrop-panel';
  const headings=Array.from(info.querySelectorAll(':scope > h4')),spriteHeading=headings[0],backdropHeading=headings[1];
  let item=spriteHeading;while(item&&item!==backdropHeading){const next=item.nextElementSibling;spritePanel.append(item);item=next;}
  item=backdropHeading;while(item&&item!==headings[2]){const next=item.nextElementSibling;backdropPanel.append(item);item=next;}
  info.prepend(spritePanel,backdropPanel);
  const stageLabel=document.createElement('div');stageLabel.className='nb-stage-label';stageLabel.textContent='Stage';backdropPanel.prepend(stageLabel);
  const spriteNodes=Array.from(spritePanel.childNodes),backdropNodes=Array.from(backdropPanel.childNodes).filter(n=>n!==stageLabel);
  const stageControls=document.querySelector('.side .stb');
  function arrangeStage(on){if(on)document.querySelector('.tabs').append(stageControls);else document.querySelector('.side').insertBefore(stageControls,$('stage'));if(on){spritePanel.replaceChildren(...spriteNodes);backdropPanel.replaceChildren(stageLabel,...backdropNodes);info.replaceChildren(spritePanel,backdropPanel,...originalInfoNodes.filter(n=>!spriteNodes.includes(n)&&!backdropNodes.includes(n)));}else info.replaceChildren(...originalInfoNodes);}
  document.querySelectorAll('.stb button').forEach(button=>button.setAttribute('aria-label',button.title));$('nb-terminal-toggle').setAttribute('aria-label','Notebook terminal');
  let logs=[];
  const act=(id,fn)=>{$(id).onclick=fn;};
  const reset=()=>{api.restart();$('nb-kernel').textContent='Kernel idle';status.textContent='Kernel restarted. Variables cleared.';};
  act('nb-add-round',()=>nb.add('below'));act('nb-sprite-api',()=>$('pf-api').click());
  act('nb-file',()=>cells.querySelector('textarea')?.focus());
  act('nb-import',()=>$('notebook-import').click());act('nb-export',()=>$('notebook-export').click());
  act('nb-packages',()=>$('pf-packages').click());act('nb-extensions',()=>$('pf-extensions').click());
  act('nb-above',()=>nb.add('above'));act('nb-below',()=>nb.add('below'));act('nb-delete',()=>nb.remove());
  $('nb-type').onchange=()=>nb.setType($('nb-type').value);
  act('nb-run',()=>nb.runSelected());act('nb-run-all',()=>nb.runAll());act('nb-run-above',()=>nb.runRange('above'));act('nb-run-below',()=>nb.runRange('below'));
  act('nb-stop',()=>$('notebook-stop').click());act('nb-restart',reset);
  act('nb-restart-run',async()=>{if(nb.busy())return;reset();await nb.runAll();});
  act('nb-restart-clear',()=>{if(nb.busy())return;reset();nb.clear();logs=[];$('nb-terminal-output').textContent='Output cleared.';});
  function showTerminal(on){terminal.hidden=!on;$('nb-terminal-toggle').setAttribute('aria-expanded',String(on));}
  act('nb-terminal-toggle',()=>showTerminal(terminal.hidden));act('nb-terminal-close',()=>showTerminal(false));
  act('nb-terminal-clear',()=>{logs=[];$('nb-terminal-output').textContent='';});
  document.addEventListener('studio:python-event',({detail:d})=>{
    if(!nb.busy())return;
    if(['stdout','stderr','error'].includes(d.type)){logs.push(d.text);logs=logs.slice(-500);$('nb-terminal-output').textContent=logs.join('\n');$('nb-terminal-output').scrollTop=$('nb-terminal-output').scrollHeight;}
  });
  const sync=()=>{const busy=nb.busy();$('nb-kernel').textContent=busy?'● Running':'○ Ready';root.classList.toggle('nb-running',busy);document.body.classList.toggle('nb-is-running',busy);for(const source of cells.querySelectorAll('textarea'))source.disabled=busy;for(const id of ['nb-run','nb-run-all','nb-run-above','nb-run-below','nb-restart-run','nb-restart-clear','nb-above','nb-below','nb-delete','nb-type'])$(id).disabled=busy;$('nb-stop').disabled=!busy;const cell=api.getNotebook().find(c=>c.id===nb.selected());if(cell)$('nb-type').value=cell.type;};
  new MutationObserver(sync).observe(cells,{childList:true});document.addEventListener('studio:notebook-selection',sync);sync();
  const previousTab=window.tab;window.tab=id=>{const wasNotebook=document.body.classList.contains('notebook-mode');previousTab(id);arrangeStage(id==='tN');$('tN').textContent=id==='tN'?'Python':'Notebook';$('tN').setAttribute('aria-label',id==='tN'?'Python notebook':'Notebook');if(id==='tN'){if(!wasNotebook)api.restart();$('tP').setAttribute('aria-selected','false');$('tP').classList.remove('on');setTimeout(()=>{if(document.body.classList.contains('notebook-mode'))$('tP').setAttribute('aria-selected','false');},0);status.textContent='Notebook ready. Run cells to create variables.';sync();}};
  document.addEventListener('click',async event=>{if(!document.body.classList.contains('notebook-mode'))return;const action=event.target.closest('[data-a]')?.dataset.a;if(!['save','load','new'].includes(action))return;event.preventDefault();event.stopImmediatePropagation();if(action==='save')$('notebook-export').click();if(action==='load')$('notebook-import').click();if(action==='new'&&!nb.busy()&&await api.ask('New notebook','Replace the current notebook? Export it first to keep a copy.',undefined,['Create notebook'])){reset();api.setNotebook([{id:'cell-'+Date.now().toString(36),type:'code',source:'',outputs:[]}]);nb.render();}},true);
  document.addEventListener('keydown',event=>{if(document.body.classList.contains('notebook-mode')&&(event.ctrlKey||event.metaKey)&&event.key.toLowerCase()==='s'){event.preventDefault();$('notebook-export').click();}});
  arrangeStage(document.body.classList.contains('notebook-mode'));
  // A direct notebook link opens this workspace, without switching to the source editor first.
  if(new URLSearchParams(location.search).get('editor')==='notebook'){$('land').hidden=true;window.tab('tN');}
})();
