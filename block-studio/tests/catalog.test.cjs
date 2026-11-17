const test=require('node:test');
const assert=require('node:assert/strict');
const catalog=require('../studio-catalog.js');
test('package requirements allow versions but reject shell arguments and URLs',()=>{
  assert.equal(catalog.normalizeRequirement(' numpy>=2,<3 '),'numpy>=2,<3');
  assert.equal(catalog.packageName('Pillow==12.2.0'),'pillow');
  for(const value of ['pip install numpy','numpy;echo hi','https://example.com/a.whl','../numpy','numpy --extra-index-url=x'])assert.throws(()=>catalog.normalizeRequirement(value));
});
test('project configuration restores packages and extensions without duplicates',()=>{
  const value=catalog.normalizeConfig({packages:['NumPy','numpy==2.4.6'],extensions:['pen','pen']});
  assert.deepEqual(value.packages,['numpy==2.4.6']);
  assert.deepEqual(value.extensions,['sprite','pen']);
  assert.throws(()=>catalog.normalizeConfig({extensions:['unrecognized-extension']}));
});
test('custom extensions cannot overwrite standard modules or traverse directories',()=>{
  const base={format:'block-studio-extension',version:1,id:'custom:greeting',name:'Greeting',description:'Example',modules:{'ext_greet.py':'def greet(): return 42'}};
  assert.ok(catalog.validateExtension(base));
  for(const filename of ['os.py','../ext_greet.py','ext_a/b.py','ext_<script>.py'])assert.throws(()=>catalog.validateExtension({...base,modules:{[filename]:'pass'}}));
});
test('notebook validation rejects duplicate cell ids and restores code safely',()=>{
  const cell={id:'cell-1',type:'code',source:'print(42)',outputs:['42']};
  assert.deepEqual(catalog.normalizeNotebook([cell]),[cell]);
  assert.throws(()=>catalog.normalizeNotebook([cell,cell]));
  assert.throws(()=>catalog.normalizeNotebook([{...cell,type:'javascript'}]));
});
