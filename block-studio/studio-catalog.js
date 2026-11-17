(function(root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  root.StudioCatalog = api;
})(globalThis, function() {
  const extensions = [
    {id:'sprite',name:'Sprite & Stage',icon:'✦',category:'Creative',description:'Move sprites, change costumes, speak and switch backdrops.',requirements:[],modules:['sprite','stage'],example:"from sprite import Sprite\nfrom stage import Stage\nsprite = Sprite('Sprite1')\nsprite.move(50)\nsprite.say('Hello!')\n"},
    {id:'pen',name:'Pen',icon:'✎',category:'Creative',description:'Draw lines and shapes on the stage with a programmable pen.',requirements:[],modules:['pen'],example:"from pen import Pen\npen = Pen()\npen.set_color('#8b35b1')\npen.set_size(3)\npen.down()\nfor side in range(4):\n    pen.move(90)\n    pen.turn(90)\npen.up()\n"},
    {id:'music',name:'Music',icon:'♫',category:'Creative',description:'Play musical notes, change tempo and create melodies.',requirements:[],modules:['music'],example:"import music\nmusic.set_tempo(120)\nfor note in [60, 64, 67, 72]:\n    await music.play_note(note, 0.5)\n"},
    {id:'speech',name:'Text to Speech',icon:'◖',category:'AI & Language',description:'Read text aloud with your browser’s speech voices.',requirements:[],modules:['speech'],example:"import speech\nawait speech.speak('Welcome to Block Studio!')\n"},
    {id:'sensing',name:'Keyboard & Mouse',icon:'⌨',category:'Interaction',description:'Read keyboard, pointer coordinates and a project timer.',requirements:[],modules:['sensing'],example:"import sensing\nimport time\nsprite = Sprite('Sprite1')\nfor frame in range(200):\n    if sensing.key_pressed('ArrowRight'):\n        sprite.changex(3)\n    if sensing.key_pressed('ArrowLeft'):\n        sprite.changex(-3)\n    time.sleep(0.02)\n"},
    {id:'camera',name:'Camera',icon:'◉',category:'AI & Language',description:'Preview your camera and capture a frame as a PNG data URL. Requires camera permission.',requirements:[],modules:['camera'],example:"from camera import Camera\ncamera = Camera()\nawait camera.start()\nimage = await camera.capture()\nprint('Captured image:', len(image), 'characters')\nawait camera.stop()\n"},
    {id:'ml',name:'Machine Learning Models',icon:'◈',category:'AI & Language',description:'Use text and numeric models trained in the studio’s ML environment.',requirements:[],modules:['studio_ml'],example:"import studio_ml\n# Train a Text model in File > Open ML Environment first.\nresult = await studio_ml.classify_text('hello world')\nprint(result)\n"},
    {id:'board',name:'Virtual Board & UART',icon:'▤',category:'Hardware',description:'Control virtual LED, motor and servo values; send text to an already connected UART device. No firmware flashing.',requirements:[],modules:['board'],example:"from board import VirtualBoard\nboard = VirtualBoard()\nboard.led(True)\nboard.motor(50)\nboard.servo(90)\n"},
    {id:'numpy',name:'Scientific Computing',icon:'∑',category:'Data & Science',description:'Array mathematics and statistics with NumPy.',requirements:['numpy'],modules:['numpy'],example:"import numpy as np\nvalues = np.array([10, 20, 30, 40])\nprint('Mean:', values.mean())\n"},
    {id:'pandas',name:'Data Tables',icon:'▦',category:'Data & Science',description:'Explore and transform tabular data with pandas.',requirements:['pandas'],modules:['pandas'],example:"import pandas as pd\ntable = pd.DataFrame({'name': ['Ada', 'Grace'], 'score': [95, 98]})\nprint(table)\n"},
    {id:'plots',name:'Charts & Plots',icon:'▥',category:'Data & Science',description:'Create Matplotlib charts and display figures inside your workspace.',requirements:['matplotlib'],modules:['matplotlib'],example:"import matplotlib.pyplot as plt\nplt.plot([1, 2, 3, 4], [1, 4, 9, 16], marker='o')\nplt.title('My first chart')\nplt.show()\n"}
  ];
  const packages = [
    {name:'numpy',description:'Scientific arrays and mathematics'},
    {name:'pandas',description:'Data frames and tabular analysis'},
    {name:'matplotlib',description:'Charts and scientific plots'},
    {name:'pillow',description:'Image processing with PIL'},
    {name:'sympy',description:'Symbolic mathematics'},
    {name:'requests',description:'HTTP client (browser network restrictions apply)'},
    {name:'beautifulsoup4',description:'HTML parsing'},
    {name:'scikit-learn',description:'Machine-learning algorithms'},
    {name:'scipy',description:'Scientific algorithms'},
    {name:'emoji',description:'Pure-Python Unicode emoji utilities'}
  ];
  const requirementPattern = /^[A-Za-z0-9][A-Za-z0-9_.-]*(?:(?:==|>=|<=|~=|>|<)[A-Za-z0-9][A-Za-z0-9.*+_-]*(?:,(?:==|>=|<=|~=|>|<)[A-Za-z0-9][A-Za-z0-9.*+_-]*)*)?$/;
  function normalizeRequirement(value) {
    if (typeof value !== 'string' || value.length > 160 || !requirementPattern.test(value.trim())) throw Error('Use a package name, optionally with a version, such as numpy or emoji==2.15.0.');
    return value.trim();
  }
  function packageName(value) { return normalizeRequirement(value).split(/[<>=~]/)[0].toLowerCase().replace(/[-_.]+/g,'-'); }
  function validateExtension(value) {
    if (!value || value.format!=='block-studio-extension' || value.version!==1 || typeof value.id!=='string' || !/^custom:[a-z][a-z0-9-]{0,49}$/.test(value.id)) throw Error('Invalid extension manifest or id (use custom:my-extension).');
    if (typeof value.name!=='string' || !value.name.trim() || value.name.length>80 || typeof value.description!=='string' || value.description.length>500) throw Error('Extension name or description is invalid.');
    if (!value.modules || typeof value.modules!=='object' || Array.isArray(value.modules) || Object.keys(value.modules).length<1 || Object.keys(value.modules).length>20) throw Error('Provide 1–20 Python modules.');
    for (const [name,code] of Object.entries(value.modules)) if (!/^ext_[A-Za-z0-9_]\.py$/.test(name) && !/^ext_[A-Za-z0-9_]+\.py$/.test(name) || typeof code!=='string' || code.length>100000) throw Error('Custom modules must use ext_name.py filenames and contain at most 100 KB of source.');
    const requirements=(value.requirements||[]).map(normalizeRequirement);
    if(requirements.length>20)throw Error('An extension can declare at most 20 requirements.');
    if(value.example!==undefined&&(typeof value.example!=='string'||value.example.length>10000))throw Error('Extension example is too large.');
    return {format:value.format,version:1,id:value.id,name:value.name.trim(),description:value.description,category:'Custom',icon:'◇',modules:{...value.modules},requirements,example:value.example||''};
  }
  function normalizeConfig(value={}) {
    if(!value||typeof value!=='object'||Array.isArray(value))throw Error('Invalid Python configuration.');
    if(value.packages!==undefined&&!Array.isArray(value.packages))throw Error('Invalid package list.');
    const requirements=(value.packages||[]).map(normalizeRequirement);
    if(requirements.length>50)throw Error('A project can declare at most 50 packages.');
    if(value.customExtensions!==undefined&&!Array.isArray(value.customExtensions))throw Error('Invalid custom extensions.');
    const custom=(value.customExtensions||[]).map(validateExtension);
    if(custom.length>20||new Set(custom.map(e=>e.id)).size!==custom.length)throw Error('Custom extension list is invalid.');
    const allowed=new Set([...extensions,...custom].map(e=>e.id));
    if(value.extensions!==undefined&&!Array.isArray(value.extensions))throw Error('Invalid extension list.');
    const enabled=[...new Set(['sprite',...(value.extensions||[])])];
    if(enabled.some(id=>!allowed.has(id)))throw Error('Unknown extension in project.');
    return {packages:[...new Map(requirements.map(r=>[packageName(r),r])).values()],extensions:enabled,customExtensions:custom};
  }
  function normalizeNotebook(value) {
    if(value===undefined)return [{id:'cell-1',type:'code',source:"print('Hello from my notebook!')",outputs:[]}];
    if(!Array.isArray(value)||value.length<1||value.length>100)throw Error('A notebook needs 1–100 cells.');
    const ids=new Set();
    return value.map(cell=>{
      if(!cell||typeof cell.id!=='string'||!/^cell-[A-Za-z0-9_-]{1,70}$/.test(cell.id)||ids.has(cell.id)||!['code','markdown'].includes(cell.type)||typeof cell.source!=='string'||cell.source.length>100000)throw Error('Invalid notebook cell.');
      ids.add(cell.id);
      return {id:cell.id,type:cell.type,source:cell.source,outputs:Array.isArray(cell.outputs)?cell.outputs.filter(x=>typeof x==='string').slice(-100).map(x=>x.slice(0,10000)):[]};
    });
  }
  return {extensions,packages,normalizeRequirement,packageName,validateExtension,normalizeConfig,normalizeNotebook};
});
