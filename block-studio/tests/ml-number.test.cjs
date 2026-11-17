const test = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const path = require('node:path');
const source = fs.readFileSync(path.join(__dirname, '../script.js'), 'utf8');
const scope = vm.createContext({});
vm.runInContext(source.slice(source.indexOf('function parseNum('), source.indexOf('function recAudio(')), scope);

test('rejects mismatched feature counts instead of fitting a NaN model', () => {
  assert.throws(() => scope.parseNum('1,2,3\n2,4\n3,4,5', true), /same number of features/);
});
test('rejects missing, nonnumeric and infinite numeric values', () => {
  for (const text of ['1,,3', 'hello,4', 'Infinity,4', '1,Infinity', '1abc,4']) {
    assert.throws(() => scope.parseNum(text, true));
  }
});
test('fits and predicts a known linear relationship', () => {
  const rows = scope.parseNum('0,1\n1,3\n2,5\n3,7', true);
  const model = scope.fitLin(rows);
  assert.ok(Math.abs(scope.linPred(model, [5]) - 11) < 0.001);
});
test('prediction rejects incorrect dimensions and leaves callback untouched', () => {
  const output = {textContent: ''};
  scope.TR = {num: {reg: true, M: scope.fitLin(scope.parseNum('0,1\n1,3\n2,5', true))}};
  scope.$ = () => output;
  scope.aiMsg = () => {};
  vm.runInContext(source.slice(source.indexOf('function numPredict('), source.indexOf('\nfunction reg(')), scope);
  let called = false;
  scope.numPredict('5,6', () => { called = true; });
  assert.equal(called, false);
  assert.match(output.textContent, /exactly 1 finite numeric feature/);
  scope.numPredict('5', (_, value) => { assert.equal(value, 11); called = true; });
  assert.equal(called, true);
});
