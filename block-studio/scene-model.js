(function(root,factory){const value=factory();if(typeof module==='object'&&module.exports)module.exports=value;root.StudioSceneModel=value;})(globalThis,function(){
  const fail=message=>{throw Error(message);};
  function safeJSON(value){const text=JSON.stringify(value,(_,v)=>{if(typeof v==='number'&&!Number.isFinite(v))fail('Project contains a non-finite number.');return v;});if(!text||text.length>32000000)fail('Project scene exceeds the 32 MB limit.');const parsed=JSON.parse(text);function visit(v,depth=0){if(depth>30)fail('Project data is nested too deeply.');if(v&&typeof v==='object'){if(Array.isArray(v)&&v.length>50000)fail('Project array exceeds the item limit.');for(const key of Object.keys(v)){if(['__proto__','constructor','prototype'].includes(key))fail('Unsafe project property.');visit(v[key],depth+1);}}}visit(parsed);return parsed;}
  function string(value,max,label){if(typeof value!=='string'||value.length>max)fail('Invalid '+label+'.');return value;}
  function number(value,min,max,label){if(typeof value!=='number'||!Number.isFinite(value)||value<min||value>max)fail('Invalid '+label+'.');return value;}
  function image(value){if(value===undefined||value==='')return '';string(value,8000000,'image');if(!/^data:image\/(png|jpeg|webp|gif);base64,[A-Za-z0-9+/=]+$/.test(value))fail('Use embedded PNG, JPEG, WebP or GIF images.');return value;}
  function blocks(value){if(!Array.isArray(value)||value.length>5000)fail('Invalid sprite scripts.');return value.map(b=>({t:string(b.t,500,'block text'),c:string(b.c,80,'block color')}));}
  function normalize(value){
    const scene=safeJSON(value);if(scene.version!==1||!Array.isArray(scene.sprites)||scene.sprites.length<1||scene.sprites.length>100)fail('Invalid scene or sprite count.');
    const names=new Set();scene.sprites=scene.sprites.map(sprite=>{
      const name=string(sprite.n,120,'sprite name').trim();if(!name||names.has(name))fail('Sprite names must be nonempty and unique.');names.add(name);
      if(!Array.isArray(sprite.costumes)||sprite.costumes.length<1||sprite.costumes.length>200)fail('Invalid costume list.');
      const costumes=sprite.costumes.map(c=>({n:string(c.n,120,'costume name'),e:string(c.e||'',200,'costume symbol'),img:image(c.img)}));
      return {n:name,x:number(sprite.x,-1000000,1000000,'x'),y:number(sprite.y,-1000000,1000000,'y'),dir:number(sprite.dir,-1000000,1000000,'direction'),size:number(sprite.size,0,100000,'size'),visible:!!sprite.visible,cosI:number(sprite.cosI,0,costumes.length-1,'costume index'),costumes,blocks:blocks(sprite.blocks)};
    });
    number(scene.activeSprite,0,scene.sprites.length-1,'active sprite');if(!Number.isInteger(scene.activeSprite)||scene.sprites.some(s=>!Number.isInteger(s.cosI)))fail('Scene indices must be integers.');
    if(!Array.isArray(scene.backdrops)||!scene.backdrops.length||scene.backdrops.length>200)fail('Invalid backdrops.');
    scene.backdrops=scene.backdrops.map(b=>{const c=string(b.c,8000000,'backdrop');if(/url\s*\(/i.test(c)&&!/^url\(data:image\/(png|jpeg|webp|gif);base64,[A-Za-z0-9+/=]+\) center\/cover$/.test(c))fail('Backdrops must contain embedded images, colors or gradients.');return {n:string(b.n,120,'backdrop name'),c};});
    number(scene.backdropIndex,0,scene.backdrops.length-1,'backdrop index');if(!Number.isInteger(scene.backdropIndex))fail('Backdrop index must be an integer.');
    if(scene.background!==undefined){string(scene.background,8000000,'stage background');if(/url\s*\(/i.test(scene.background)&&!scene.backdrops.some(b=>b.c===scene.background))fail('Unrecognized stage background.');}
    image(scene.penImage);
    if(!Array.isArray(scene.sounds)||scene.sounds.length>200)fail('Invalid sound list.');
    for(const sound of scene.sounds){string(sound.n,120,'sound name');if(sound.url){string(sound.url,16000000,'recording');if(!/^data:audio\/[A-Za-z0-9.+-]+(?:;codecs=[A-Za-z0-9.+-]+)?;base64,[A-Za-z0-9+/=]+$/.test(sound.url))fail('Recorded sounds must be embedded audio.');}else{if(!Array.isArray(sound.f)||!sound.f.length||sound.f.some(n=>typeof n!=='number'||!Number.isFinite(n)||n<=0)||!['sine','square','triangle','sawtooth'].includes(sound.w))fail('Invalid synthesized sound.');number(sound.d,0,60,'sound duration');}}
    number(scene.volume,0,1,'volume');number(scene.pitch,.01,10,'pitch');
    if(!Array.isArray(scene.extensions)||scene.extensions.some(x=>typeof x!=='string'||x.length>120))fail('Invalid block extension list.');
    if(scene.backpack!==undefined&&(!Array.isArray(scene.backpack)||scene.backpack.length>1000))fail('Invalid backpack.');
    if(scene.backpack)for(const item of scene.backpack){string(item.n,120,'backpack name');if(item.k==='s')blocks(JSON.parse(string(item.d,3000000,'backpack scripts')));else if(item.k==='c')image(item.d);else fail('Invalid backpack item.');}
    if(scene.runtime!==undefined){if(!scene.runtime||typeof scene.runtime!=='object'||Array.isArray(scene.runtime))fail('Invalid block state.');for(const v of Object.values(scene.runtime.lists||{}))if(!Array.isArray(v)||v.length>10000)fail('Invalid runtime list.');}
    return scene;
  }
  return {normalize,safeJSON};
});
