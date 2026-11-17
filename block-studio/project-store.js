(function (root, factory) {
  var store = factory();
  if (typeof module === 'object' && module.exports) module.exports = store;
  root.BlockStudioProjectStore = store;
})(typeof globalThis === 'undefined' ? this : globalThis, function () {
  var SceneModel = typeof module === 'object' && module.exports ? require('./scene-model.js') : globalThis.StudioSceneModel;
  var Catalog = typeof module === 'object' && module.exports ? require('./studio-catalog.js') : globalThis.StudioCatalog;
  var FORMAT = 'block-studio-project';
  var VERSION = 1;
  var STORAGE_KEY = 'block-studio.autosave.v1';
  var MAX_BLOCKS = 5000;

  function invalid(message) {
    throw new Error(message);
  }

  function normalize(value) {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
      invalid('Project must be a JSON object.');
    }

    if (value.format === FORMAT && value.version !== VERSION) {
      invalid('This project version is not supported.');
    }
    if (value.format && value.format !== FORMAT) {
      invalid('This file is not a Block Studio project.');
    }

    var name = value.name === undefined ? 'My Project' : value.name;
    var blocks = value.blocks === undefined ? [] : value.blocks;
    if (typeof name !== 'string' || name.length > 120) {
      invalid('Project name must be 120 characters or fewer.');
    }
    if (!Array.isArray(blocks) || blocks.length > MAX_BLOCKS) {
      invalid('Project blocks are invalid or exceed the project limit.');
    }

    var normalizedBlocks = blocks.map(function (block) {
      if (!block || typeof block !== 'object' || Array.isArray(block) ||
          typeof block.t !== 'string' || block.t.length > 500 ||
          typeof block.c !== 'string' || block.c.length > 80) {
        invalid('A project block is invalid.');
      }
      return { t: block.t, c: block.c };
    });

    var project={format:FORMAT,version:VERSION,name:name,blocks:normalizedBlocks};
    if(value.scene!==undefined)project.scene=SceneModel.normalize(value.scene);
    if(value.savedAt!==undefined){if(typeof value.savedAt!=='number'||!Number.isFinite(value.savedAt))invalid('Invalid project timestamp.');project.savedAt=value.savedAt;}
    if(value.python!==undefined){
      var python=value.python;
      if(!python||python.format!=='block-studio-python'||python.version!==1||!python.files||typeof python.files!=='object'||Array.isArray(python.files))invalid('Invalid Python project metadata.');
      var names=Object.keys(python.files);if(!names.length||names.length>100||names.some(function(n){return !/^[A-Za-z_]\w*\.py$/.test(n)||typeof python.files[n]!=='string'||python.files[n].length>1000000}))invalid('Invalid Python source files.');
      project.python={format:python.format,version:1,name:typeof python.name==='string'?python.name.slice(0,120):name,active:names.includes(python.active)?python.active:names[0],files:python.files,configuration:Catalog.normalizeConfig(python.configuration),notebook:Catalog.normalizeNotebook(python.notebook)};
    }
    return project;
  }

  function create(name, blocks) {
    return normalize({ format: FORMAT, version: VERSION, name: name, blocks: blocks });
  }

  function parse(serialized) {
    if (typeof serialized !== 'string') invalid('Project data must be text.');
    var value;
    try {
      value = JSON.parse(serialized);
    } catch (error) {
      invalid('Project file is not valid JSON.');
    }
    return normalize(value);
  }

  function serialize(project) {
    return JSON.stringify(normalize(project), null, 1);
  }

  function save(storage, project) {
    if (!storage || typeof storage.setItem !== 'function') {
      invalid('Browser storage is not available.');
    }
    storage.setItem(STORAGE_KEY, serialize(project));
  }

  function restore(storage) {
    if (!storage || typeof storage.getItem !== 'function') {
      invalid('Browser storage is not available.');
    }
    var serialized = storage.getItem(STORAGE_KEY);
    return serialized === null ? null : parse(serialized);
  }

  return {
    format: FORMAT,
    version: VERSION,
    storageKey: STORAGE_KEY,
    create: create,
    parse: parse,
    serialize: serialize,
    save: save,
    restore: restore
  };
});
