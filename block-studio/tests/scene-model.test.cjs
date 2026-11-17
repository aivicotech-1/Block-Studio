const test=require('node:test'),assert=require('node:assert/strict');
const model=require('../scene-model.js'),store=require('../project-store.js');
const scene=()=>({version:1,sprites:[{n:'Cat',x:0,y:0,dir:90,size:100,visible:true,cosI:0,costumes:[{n:'Cat',e:'🐱'}],blocks:[{t:'move 25 steps',c:'--motion'}]}],activeSprite:0,backdrops:[{n:'Backdrop1',c:''}],backdropIndex:0,sounds:[{n:'Pop',f:[800,200],d:.12,w:'sine'}],volume:1,pitch:1,extensions:[],models:{},runtime:{variables:{score:42},lists:{items:[1,2]}}});
test('scene and Python metadata round-trip in a full block project',()=>{
  const project={...store.create('Agency',[]),scene:scene(),savedAt:123,python:{format:'block-studio-python',version:1,name:'Agency',active:'Stage.py',files:{'Stage.py':'print(42)'},configuration:{packages:['numpy'],extensions:['sprite','pen']}}};
  const restored=store.parse(store.serialize(project));
  assert.equal(restored.scene.runtime.variables.score,42);
  assert.equal(restored.scene.sprites[0].costumes[0].e,'🐱');
  assert.deepEqual(restored.python.configuration.extensions,['sprite','pen']);
});
test('scene validation rejects duplicate names and invalid references',()=>{
  let value=scene();value.sprites.push({...value.sprites[0]});assert.throws(()=>model.normalize(value),/unique/);
  value=scene();value.activeSprite=12;assert.throws(()=>model.normalize(value));
  value=scene();value.sprites[0].cosI=.5;assert.throws(()=>model.normalize(value));
});
test('project import rejects external image loads and unsafe object properties',()=>{
  const value=scene();value.sprites[0].costumes[0].img='https://example.com/tracker.png';assert.throws(()=>model.normalize(value),/embedded/);
  assert.throws(()=>model.safeJSON(JSON.parse('{"__proto__":{"polluted":true}}')),/Unsafe/);
  assert.throws(()=>model.safeJSON({score:NaN}),/non-finite/);
});
test('restoration rejects invalid embedded Python files',()=>{
  const project={...store.create('Bad',[]),python:{format:'block-studio-python',version:1,files:{'../bad.py':'pass'}}};
  assert.throws(()=>store.normalize?store.normalize(project):store.serialize(project),/Invalid Python/);
});
