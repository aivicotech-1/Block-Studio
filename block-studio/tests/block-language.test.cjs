const test=require('node:test'),assert=require('node:assert/strict');
const language=require('../block-language.js');
test('expressions respect arithmetic, comparison and boolean precedence',()=>{
  assert.equal(language.evaluate('2 + 3 * 4'),14);
  assert.equal(language.evaluate('not x > 2',{x:3}),false);
  assert.equal(language.evaluate('2 ** 3 ** 2'),512);
  assert.equal(language.evaluate('score >= 10 and score < 20',{score:15}),true);
});
test('logical expressions short-circuit dangerous or unknown branches',()=>{
  assert.equal(language.evaluate('x != 0 and 10 / x > 1',{x:0}),false);
  assert.equal(language.evaluate('True or missing()'),true);
});
test('expressions allow only explicitly supplied functions and variables',()=>{
  assert.equal(language.evaluate("join('Hello ', name)",{name:'Ada'},{join:(a,b)=>a+b}),'Hello Ada');
  for(const text of ['window.location','constructor()',"fetch('https://example.com')",'1; alert(1)'])assert.throws(()=>language.evaluate(text));
});
test('program parser separates event scripts and custom block bodies',()=>{
  const scripts=language.scripts(['define square','repeat 4','move 10 steps','end','end','when green flag clicked','call square','when key space pressed','say Hello']);
  assert.equal(scripts.length,3);
  assert.equal(scripts[0].body[0].k[0].k[0].t,'move 10 steps');
  assert.equal(scripts[2].kind,'key');assert.equal(scripts[2].value,'space');
});
test('if/else parsing preserves both branches and rejects missing end',()=>{
  const node=language.tree(['if x > 0 then','say positive','else','say negative','end'])[0];
  assert.equal(node.k[0].t,'say positive');assert.equal(node.otherwise[0].t,'say negative');
  assert.throws(()=>language.tree(['repeat 4','move 10 steps']),/end block/);
});
