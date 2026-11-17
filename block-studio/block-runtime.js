/* Text block execution with explicit parsing: no JavaScript eval or Function(). */
(() => {
  const language=StudioBlockLanguage,$=id=>document.getElementById(id);
  const state={variables:Object.create(null),lists:Object.create(null),answer:'',started:performance.now(),running:true,pens:Object.create(null),tempo:120};
  let compiled=[],definitions=new Map();
  const oldStep=window.step,oldCond=window.cond,oldStop=window.stop,oldAdd=window.add;
  const monitor=document.createElement('div');monitor.id='block-monitors';$('stat').after(monitor);
  function renderMonitors(){monitor.replaceChildren();for(const [name,value] of Object.entries({...state.variables,...state.lists})){const row=document.createElement('div');row.textContent=name+': '+(Array.isArray(value)?JSON.stringify(value):String(value));monitor.append(row);}}
  function values(){const result=Object.create(null);for(const [key,value] of Object.entries({...state.variables,...state.lists}))result[language.alias(key)]=value;return Object.assign(result,{x,y,direction:dir,size,answer:state.answer,timer:(performance.now()-state.started)/1000,'sprite.x':x,'sprite.y':y});}
  function functions(){return {random:(a,b)=>Math.floor(Math.random()*(Number(b)-Number(a)+1))+Number(a),join:(a,b)=>String(a)+String(b),length:value=>value?.length||0,len:value=>value?.length||0,round:Math.round,abs:Math.abs,min:Math.min,max:Math.max,sqrt:Math.sqrt,sin:Math.sin,cos:Math.cos,variable:name=>state.variables[name]??0,list:name=>state.lists[name]||[],item:(list,index)=>Array.isArray(list)?list[Number(index)-1]??'':'',contains:(list,item)=>list?.includes(item)||false,key:name=>window.StudioInput?.snapshot().keys.includes(normalizeKey(name))||false,touching:what=>what==='edge'?Math.abs(x)>=230||Math.abs(y)>=170:what==='mouse-pointer'?Math.hypot((window.StudioInput?.snapshot().mouseX||0)-x,(window.StudioInput?.snapshot().mouseY||0)-y)<30:false,timer:()=> (performance.now()-state.started)/1000,answer:()=>state.answer};}
  function evaluate(text){return language.evaluate(text,values(),functions());}
  function value(text){try{return evaluate(text);}catch(error){if(/^[A-Za-z][A-Za-z !?.-]*$/.test(text)&&!Object.hasOwn(values(),language.alias(text)))return text;throw error;}}
  function context(sprite,fn){const index=SP.findIndex(s=>s.n===sprite);if(index<0)return;const previous=spi;if(index!==spi)selSprite(index);let result;try{result=fn();SP[spi].x=x;SP[spi].y=y;SP[spi].dir=dir;SP[spi].size=size;SP[spi].cosI=cosI;SP[spi].COS=COS;}finally{if(previous!==spi)selSprite(previous);}return result;}
  function collect(){SP[spi].blocks=snap();compiled=[];definitions=new Map();for(const sprite of SP){const program=language.scripts(JSON.parse(sprite.blocks).map(b=>b.t));for(const script of program){compiled.push({...script,sprite:sprite.n});for(const node of script.body)if(node.t.startsWith('define '))definitions.set(sprite.n+':'+node.t.slice(7),node.k);}}}
  function pen(sprite){return state.pens[sprite] ||= {down:false,color:'#652080',size:2};}
  function draw(before,sprite){const p=pen(sprite);if(p.down&&(before.x!==x||before.y!==y))window.StudioExtensionEvent?.({action:'pen_line',args:[before.x,before.y,x,y,p.color,p.size]});}
  function report(value){say(Array.isArray(value)?JSON.stringify(value):String(value));aiMsg('Result: '+String(value));}
  async function command(text,sprite,id,depth){let m;
    if((m=text.match(/^call (.+)$/))){const body=definitions.get(sprite+':'+m[1]);if(!body)throw Error('Custom block not defined: '+m[1]);return execute(body,sprite,id,depth+1);}
    if((m=text.match(/^broadcast (.+?)( and wait)?$/))){const task=dispatch('message',m[1],id,false);if(m[2])await task;return;}
    if((m=text.match(/^ask (.+?) and wait$/))){const answer=await StudioPython.ask('Ask',m[1],'',['Submit answer']);if(id===tok)state.answer=answer??'';return;}
    if((m=text.match(/^play note (.+) for (.+) beats$/))){const args=context(sprite,()=>[Number(evaluate(m[1])),Number(evaluate(m[2]))*60/state.tempo]);await StudioPythonBridge('music_note',args);return;}
    return context(sprite,()=>{
      const before={x,y};
      if((m=text.match(/^set (.+) to (.+)$/))&&!/^set (motor|servo|digital|analog|PWM|pin|pen|tempo)/i.test(text)){state.variables[m[1]]=value(m[2]);renderMonitors();}
      else if((m=text.match(/^change (.+) by (.+)$/))&&!['x','y','size','volume'].includes(m[1])){state.variables[m[1]]=Number(state.variables[m[1]]||0)+Number(evaluate(m[2]));renderMonitors();}
      else if((m=text.match(/^make list (.+)$/))){state.lists[m[1]]=[];renderMonitors();}
      else if((m=text.match(/^add (.+) to (.+)$/))&&(Object.hasOwn(state.lists,m[2])||/^[A-Za-z_]\w*$/.test(m[2]))){(state.lists[m[2]] ||= []).push(value(m[1]));if(state.lists[m[2]].length>10000)throw Error('A list can contain at most 10,000 items.');renderMonitors();}
      else if((m=text.match(/^delete item (.+) of (.+)$/))){state.lists[m[2]]?.splice(Math.max(0,Number(evaluate(m[1]))-1),1);renderMonitors();}
      else if(text==='show variable')renderMonitors();
      else if((m=text.match(/^report (.+)$/)))report(evaluate(m[1]));
      else if((m=text.match(/^move (.+) steps$/))){const amount=Number(evaluate(m[1]));x+=amount*Math.cos((dir-90)*Math.PI/180);y-=amount*Math.sin((dir-90)*Math.PI/180);}
      else if((m=text.match(/^turn (right|left) (.+) degrees$/)))dir=(dir+(m[1]==='left'?-1:1)*Number(evaluate(m[2])))%360;
      else if((m=text.match(/^change (x|y) by (.+)$/))){if(m[1]==='x')x+=Number(evaluate(m[2]));else y+=Number(evaluate(m[2]));}
      else if((m=text.match(/^go to x:\s*(.*?)\s+y:\s*(.*)$/))){x=Number(evaluate(m[1]));y=Number(evaluate(m[2]));}
      else if((m=text.match(/^pen (down|up)$/)))pen(sprite).down=m[1]==='down';
      else if(text==='clear pen')window.StudioExtensionEvent?.({action:'pen_clear',args:[]});
      else if((m=text.match(/^set pen color to (.+)$/))){if(!CSS.supports('color',m[1]))throw Error('Choose a valid pen color.');pen(sprite).color=m[1];}
      else if((m=text.match(/^set pen size to (.+)$/)))pen(sprite).size=Math.max(.5,Math.min(100,Number(evaluate(m[1]))));
      else if((m=text.match(/^set tempo to (.+)$/)))state.tempo=Math.max(20,Math.min(400,Number(evaluate(m[1]))));
      else if(text==='timer')report((performance.now()-state.started)/1000);
      else if(text==='reset timer')state.started=performance.now();
      else if(text==='key space pressed?')report(functions().key('space'));
      else if(text==='touching mouse-pointer?')report(functions().touching('mouse-pointer'));
      else if((m=text.match(/^pick random (.+) to (.+)$/)))report(functions().random(evaluate(m[1]),evaluate(m[2])));
      else if(text==='join hello world')report('helloworld');
      else if(text==='() + ()')report(0);
      else if(text==='() = ()')report(true);
      else if((m=text.match(/^(say|think) (.+?)(?: for ([\d.]+) seconds)?$/)))say(value(m[2]));
      else {const result=oldStep(text);draw(before,sprite);return result;}
      draw(before,sprite);upd();
    });
  }
  async function execute(nodes,sprite,id,depth=0){if(depth>50)throw Error('Custom block recursion limit reached.');for(const node of nodes){if(id!==tok)return;const text=node.t;
    if(text.startsWith('define '))continue;
    if(text.startsWith('repeat ')){const times=context(sprite,()=>Math.max(0,Math.floor(Number(evaluate(text.slice(7))))));if(times>1000000)throw Error('Repeat count exceeds one million.');for(let i=0;i<times&&id===tok;i++){await execute(node.k,sprite,id,depth);if(i%100===0)await sleep(0);}}
    else if(text==='forever'){while(id===tok){await execute(node.k,sprite,id,depth);await sleep(16);}}
    else if(text.startsWith('if ')){const expression=text.slice(3).replace(/ then$/,'');const yes=context(sprite,()=>expression==='touching edge'?functions().touching('edge'):expression==='face detected'?faces.length>0:findX(text)?.q?oldCond(text):Boolean(evaluate(expression)));await execute(yes?node.k:node.otherwise||[],sprite,id,depth);}
    else if(text==='stop all'){stop();return;}
    else if(/^wait /.test(text)){const seconds=context(sprite,()=>Number(evaluate(text.slice(5).replace(/ seconds$/,''))));await sleep(Math.max(0,seconds)*1000);}
    else if(/^rest for /.test(text)){const beats=context(sprite,()=>Number(evaluate(text.slice(9).replace(/ beats$/,''))));await sleep(Math.max(0,beats)*60000/state.tempo);}
    else {await command(text,sprite,id,depth);await sleep(20);}
  }}
  async function dispatch(kind,value,id=tok,rebuild=true,sprite=null){try{if(rebuild)collect();const work=compiled.filter(s=>s.kind===kind&&(kind==='key'?normalizeKey(s.value)===normalizeKey(value):kind==='message'?s.value===value:true)&&(!sprite||sprite===s.sprite));await Promise.all(work.map(s=>execute(s.body,s.sprite,id)));}catch(error){aiMsg('Program error: '+error.message);StudioPython?.notify('Block error: '+error.message,'error');}}
  window.go=()=>{stop();state.running=true;state.started=performance.now();dispatch('flag','',tok);};
  window.stop=()=>{oldStop();state.running=false;};
  function normalizeKey(key){return ({' ':'space','right arrow':'arrowright','left arrow':'arrowleft','up arrow':'arrowup','down arrow':'arrowdown'})[String(key).toLowerCase()]||String(key).toLowerCase();}
  document.addEventListener('keydown',event=>{if(state.running&&!event.repeat&&!/INPUT|TEXTAREA|SELECT/.test(event.target.tagName)&&!document.body.classList.contains('python-mode'))dispatch('key',event.key);});
  let pointerSprite=null;
  $('stage').addEventListener('pointerdown',event=>{const sprite=SP.find(s=>s.el===event.target.closest('.sprite'));pointerSprite=sprite?{name:sprite.n,x:event.clientX,y:event.clientY}:null;});
  $('stage').addEventListener('pointerup',event=>{const pressed=pointerSprite;pointerSprite=null;if(pressed&&Math.hypot(event.clientX-pressed.x,event.clientY-pressed.y)<5&&state.running&&!document.body.classList.contains('python-mode'))dispatch('click','',tok,true,pressed.name);});
  $('stage').addEventListener('pointercancel',()=>{pointerSprite=null;});
  window.add=async function(t,color,before){
    if(!busy&&t==='Make a Block'){const name=await StudioPython.ask('Create custom block','Use a name such as draw_square.','my_block',['Create block']);if(!name)return;if(name.length>80||!/^[A-Za-z_]\w*$/.test(name)){aiMsg('Use letters, digits and underscores for a custom block name.');return;}oldAdd('define '+name,color,before);oldAdd('end','--control');if(!C['My Blocks'][1].includes('call '+name))C['My Blocks'][1].push('call '+name);show('My Blocks');return;}
    if(!busy&&t==='make a list'){const name=await StudioPython.ask('Create list','Choose a list name.','my_list',['Create list']);if(!name)return;if(name.length>80||['__proto__','constructor','prototype'].includes(name)){aiMsg('Choose a list name of at most 80 characters.');return;}oldAdd('make list '+name,color,before);return;}
    return oldAdd(t,color,before);
  };
  // Right-click editing keeps the simple block UI useful for strings and expressions.
  $('stack').addEventListener('contextmenu',async event=>{const block=event.target.closest('.blk');if(!block)return;event.preventDefault();const text=await StudioPython.ask('Edit block','Edit the command or expression.',txt(block),['Apply']);if(text===null)return;if(text.length>500){aiMsg('A block command can contain at most 500 characters.');return;}oldAdd(text,block.dataset.c,block);block.remove();hint();});
  OPEN=/^(repeat|forever|if |define )/;
  C.Events[1].push('when I receive message1','broadcast message1 and wait');C.Control[1].splice(-1,0,'else');
  C.Operators[1]=['report 1 + 2','report 10 / 2',"report random(1, 10)","report join('hello', 'world')",'report 1 < 2'];
  C.Variables[1].push('add 1 to my_list','delete item 1 of my_list','report length(my_list)');
  EB.Pen=['pen down','pen up','clear pen','set pen color to #652080','set pen size to 3'];
  EB.Music=['play note 60 for 1 beats','set tempo to 120','rest for 1 beats'];
  function refreshDefinitions(){const names=new Set();for(const sprite of SP){const blocks=sprite===SP[spi]?JSON.parse(snap()):JSON.parse(sprite.blocks);for(const block of blocks){const match=block.t.match(/^define ([A-Za-z_]\w*)$/);if(match)names.add('call '+match[1]);}}C['My Blocks'][1]=['Make a Block',...names];}
  const previousHint=window.hint;window.hint=()=>{previousHint();refreshDefinitions();};
  window.StudioBlockRuntime={refreshDefinitions,snapshot:()=>JSON.parse(JSON.stringify({variables:state.variables,lists:state.lists,answer:state.answer,tempo:state.tempo})),restore:value=>{state.variables=Object.assign(Object.create(null),value.variables||{});state.lists=Object.assign(Object.create(null),value.lists||{});state.answer=value.answer||'';state.tempo=value.tempo||120;renderMonitors();},evaluate};
})();
