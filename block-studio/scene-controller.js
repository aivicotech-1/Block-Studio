/* Shared stage/asset persistence for block projects and Python project exports. */
(() => {
  const $=id=>document.getElementById(id),clone=value=>JSON.parse(JSON.stringify(value));
  let restoring=false;
  function capture(){
    const sprites=SP.map((sprite,i)=>({n:sprite.n,x:i===spi?x:sprite.x,y:i===spi?y:sprite.y,dir:i===spi?dir:sprite.dir,size:i===spi?size:sprite.size,visible:sprite.el.style.visibility!=='hidden',cosI:i===spi?cosI:sprite.cosI,costumes:i===spi?COS:sprite.COS,blocks:i===spi?JSON.parse(snap()):JSON.parse(sprite.blocks)}));
    const scene={version:1,sprites,activeSprite:spi,backdrops:BK,backdropIndex:bki,background:/url\s*\(/i.test($('stage').style.background)?BK[bki].c:$('stage').style.background,penImage:$('stage-pen')?.toDataURL()||'',sounds:SND.map(s=>{const sound={...s};if(sound.data)sound.url=sound.data;delete sound.data;return sound;}),volume:vol,pitch,backpack:BP,extensions:Object.keys(C).filter(n=>!['Motion','Looks','Sound','Events','Control','Sensing','Operators','Variables','My Blocks','AI Models'].includes(n)),board:chosen?board:null,hardware:HW,models:TR,trainingData:MLM,cameraDataset:KN,cloud:IOT,runtime:StudioBlockRuntime.snapshot()};
    return StudioSceneModel.normalize(scene);
  }
  const defaultScene=capture();defaultScene.sprites=defaultScene.sprites.slice(0,1);defaultScene.sprites[0].blocks=[];defaultScene.activeSprite=0;
  function restore(raw){
    const scene=StudioSceneModel.normalize(raw);restoring=true;
    try{
      stop();stopSnd();camOff();SP.forEach(s=>s.el.remove());SP=scene.sprites.map((data,index)=>{
        const el=document.createElement('div');el.className='sprite';if(index===0)el.id='sp';const costume=data.costumes[data.cosI];
        if(costume.img){const image=new Image();image.src=costume.img;image.style.cssText='width:64px;height:48px;display:block';el.append(image);}else el.textContent=costume.e;
        el.style.left=(50+data.x/4.8)+'%';el.style.top=(50-data.y/3.6)+'%';el.style.transform='translate(-50%,-50%) rotate('+(data.dir-90)+'deg) scale('+data.size/100+')';el.style.visibility=data.visible?'visible':'hidden';$('stage').append(el);
        return {n:data.n,x:data.x,y:data.y,dir:data.dir,size:data.size,COS:data.costumes,cosI:data.cosI,blocks:JSON.stringify(data.blocks),el};
      });
      spi=scene.activeSprite;BK=scene.backdrops;bki=scene.backdropIndex;$('stage').style.background=scene.background||BK[bki].c;
      SND=scene.sounds;vol=scene.volume;pitch=scene.pitch;BP=scene.backpack||[];TR=scene.models||{};MLM=scene.trainingData||MLM;KN=scene.cameraDataset||[];IOT=scene.cloud||{};
      if(scene.hardware)Object.assign(HW,scene.hardware);
      loadSprite(spi);StudioBlockRuntime.refreshDefinitions();listBk();listBp();hwUI();StudioBlockRuntime.restore(scene.runtime||{});
      for(const name of scene.extensions){const button=Array.from($('exts').children).find(b=>b.textContent==='+ '+name);if(button&&!C[name])button.click();}
      if(scene.board){const index=BD.findIndex(b=>b[0]===scene.board);if(index>=0)setBoard(index);}
      if(Object.keys(TR).length)exportBlocks();
      let canvas=$('stage-pen');if(!canvas){canvas=document.createElement('canvas');canvas.id='stage-pen';canvas.width=480;canvas.height=360;$('stage').prepend(canvas);}const context=canvas.getContext('2d');context.clearRect(0,0,480,360);if(scene.penImage){const image=new Image();image.onload=()=>context.drawImage(image,0,0,480,360);image.src=scene.penImage;}
      document.dispatchEvent(new CustomEvent('studio:scene-restored'));
    }finally{restoring=false;}
  }
  window.StudioScene={capture,restore,reset:()=>restore(clone(defaultScene))};
  const oldProject=window.currentProject;
  window.currentProject=()=>{const project=oldProject();project.scene=capture();project.savedAt=Date.now();if(window.StudioPython)project.python=StudioPython.getMetadata();return project;};
  const oldLoad=window.loadProj;
  window.loadProj=source=>{if(!oldLoad(source))return false;const project=BlockStudioProjectStore.parse(source);if(project.scene)restore(project.scene);if(project.python&&window.StudioPython)StudioPython.loadMetadata(project.python);queueAutosave();return true;};
  const oldNew=window.doNew;window.doNew=()=>{oldNew();StudioScene.reset();};
  // Restore the newest complete scene before the Python editor reads its recovery file.
  try{
    const blocks=BlockStudioProjectStore.restore(localStorage),python=JSON.parse(localStorage.getItem('block-studio.python.v1')||'null');
    if(python?.scene&&(python.savedAt||0)>=(blocks?.savedAt||0))restore(python.scene);
    else if(blocks?.scene){restore(blocks.scene);if(blocks.python)localStorage.setItem('block-studio.python.v1',JSON.stringify({...blocks.python,scene:blocks.scene,savedAt:blocks.savedAt}));}
  }catch(error){aiMsg('Could not restore full scene: '+error.message);}
  $('spn').oninput=function(){const name=this.value.trim();const valid=name.length>0&&name.length<=120&&!SP.some((s,i)=>i!==spi&&s.n===name);this.setCustomValidity(valid?'':'Use a unique, nonempty sprite name.');if(valid){SP[spi].n=name;listSp();queueAutosave();}};
  $('spn').onchange=function(){this.value=SP[spi].n;this.setCustomValidity('');};
  const previousQueue=window.queueAutosave;window.queueAutosave=()=>{if(!restoring)previousQueue();};
  // Asset and sprite property edits also trigger full-scene recovery.
  document.addEventListener('change',()=>{if(!restoring)queueAutosave();});
  document.addEventListener('pointerup',()=>{if(!restoring)queueAutosave();});
})();
