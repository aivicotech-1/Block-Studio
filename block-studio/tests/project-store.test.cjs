const test = require('node:test');
const assert = require('node:assert/strict');
const ProjectStore = require('../project-store.js');

test('serializes and parses a versioned project without losing block inputs', () => {
  const project = ProjectStore.create('Walk', [
    { t: 'move 25 steps', c: '--motion' },
    { t: 'say Hello!', c: '--looks' }
  ]);

  assert.deepEqual(ProjectStore.parse(ProjectStore.serialize(project)), project);
});

test('imports existing unversioned project files', () => {
  const project = ProjectStore.parse(JSON.stringify({
    name: 'Old project',
    blocks: [{ t: 'move 10 steps', c: '--motion' }]
  }));

  assert.equal(project.version, 1);
  assert.equal(project.name, 'Old project');
  assert.deepEqual(project.blocks, [{ t: 'move 10 steps', c: '--motion' }]);
});

test('rejects malformed or unsupported projects', () => {
  assert.throws(() => ProjectStore.parse('{'), /valid JSON/);
  assert.throws(() => ProjectStore.parse(JSON.stringify({
    format: ProjectStore.format,
    version: ProjectStore.version + 1,
    blocks: []
  })), /version is not supported/);
  assert.throws(() => ProjectStore.create('Bad block', [{ t: 'move' }]), /block is invalid/);
});

test('restores a saved project from browser storage', () => {
  const values = new Map();
  const storage = {
    getItem: key => values.has(key) ? values.get(key) : null,
    setItem: (key, value) => values.set(key, value)
  };
  const project = ProjectStore.create('Saved', [{ t: 'turn right 15 degrees', c: '--motion' }]);

  assert.equal(ProjectStore.restore(storage), null);
  ProjectStore.save(storage, project);
  assert.deepEqual(ProjectStore.restore(storage), project);
});
