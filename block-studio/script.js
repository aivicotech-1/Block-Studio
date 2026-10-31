var C = {
  Motion: ["--motion", ["move 50 steps", "turn right 15 degrees", "go to x: 0 y: 0", "go to random position", "change x by 40", "change y by 40", "bounce if on edge"]],
  Looks: ["--looks", ["say Hello! for 2 seconds", "think Hmm...", "next costume", "switch backdrop to Backdrop1", "change size by 10", "show", "hide"]],
  Sound: ["--sound", ["play sound Meow until done", "start sound Pop", "play sound Chirp until done", "start sound Drum", "start sound Laser", "stop all sounds", "change volume by -10"]],
  Events: ["--events", ["when green flag clicked", "when this sprite clicked", "when key space pressed", "broadcast message1"]],
  Control: ["--control", ["wait 1 seconds", "repeat 10", "forever", "if x > 0 then", "if touching edge then", "end", "stop all"]],
  Sensing: ["--sensing", ["touching mouse-pointer?", "ask What's your name? and wait", "key space pressed?", "timer", "reset timer"]],
  Operators: ["--operators", ["pick random 1 to 10", "join hello world", "() + ()", "() = ()"]],
  Variables: ["--variables", ["set my variable to 0", "change my variable by 1", "show variable", "make a list"]],
  "My Blocks": ["--myblocks", ["Make a Block"]]
};
var EB = { 'Face Detection': ['camera on', 'camera off', 'if face detected then', 'end', 'glide to face position', 'show number of faces'], 'Text to Speech': ['speak Hello there', 'speak I can see you', 'speak Goodbye'] };
var EXT = ['Image Classification', 'Dataset Collection', 'AI Model Training', 'Face Recognition', 'Pose Detection', 'Hand Gesture', 'Body Tracking', 'OCR', 'Natural Language', 'Sensors', 'Motors & Servos', 'Bluetooth', 'IoT', "Face Detection", "Speech Recognition", "Text to Speech", "Object Detection", "Machine Learning Environment", "Quarky", "Arduino Uno", "ESP32", "micro:bit", "Pen", "Music"];
var cats = document.getElementById("cats"), pal = document.getElementById("palette"), stack = document.getElementById("stack"), sp = document.getElementById("sp"), stage = document.getElementById("stage"), stat = document.getElementById("stat");
var prog = [], x = 0, y = 0, dir = 90, timers = [];
function col(v) { return "var(" + v + ")" }
function show(name) {
  Array.prototype.forEach.call(cats.children, function (b) { b.setAttribute("aria-pressed", b.dataset.n === name) });
  var c = C[name] || ["--ext", []]; pal.innerHTML = "<h3>" + name + "</h3>";
  c[1].forEach(function (t) { var b = document.createElement("button"); b.className = "blk"; b.style.background = col(c[0]); b.textContent = t; b.draggable = true; b.ondragstart = function (e) { drag = { t: t, c: c[0], el: null }; e.dataTransfer.setData('text/plain', t); e.dataTransfer.effectAllowed = 'copyMove' }; b.onclick = function () { add(t, c[0]) }; pal.appendChild(b) });
}
Object.keys(C).forEach(function (n) { var b = document.createElement("button"); b.dataset.n = n; b.innerHTML = '<span class="dot" style="background:' + col(C[n][0]) + '"></span>' + n; b.onclick = function () { show(n) }; cats.appendChild(b) });
var ex = document.getElementById("exts"); EXT.forEach(function (n) {
  var s = document.createElement("button"); s.className = "chip"; s.textContent = "+ " + n; s.style.cursor = "pointer"; s.onclick = function () {
    if (!C[n]) { var d = document.createElement("button"); d.dataset.n = n; d.innerHTML = '<span class="dot" style="background:' + col("--ext") + '"></span>' + n; d.onclick = function () { show(n) }; cats.appendChild(d); C[n] = ["--ext", EB[n] || [n + " block 1", n + " block 2"]] } show(n); cats.lastChild.scrollIntoView()
  }; ex.appendChild(s)
});
var drag = null;
function hint() { document.getElementById("hint").style.display = (stack.children.length || pyOn) ? "none" : "block"; indent(); if (pyOn) render(); hist2() }
function add(t, c, before) {
  var b = document.createElement("div"); b.className = "blk"; b.style.background = col(c); t.split(/(-?\d+)/).forEach(function (s, i) { if (i % 2) { var f = document.createElement('input'); f.value = s; f.size = 3; b.appendChild(f) } else if (s) b.appendChild(document.createTextNode(s)) }); b.dataset.c = c; b.draggable = true; b.title = "Drag to reorder, drag to the palette or double-click to delete";
  b.ondragstart = function (e) { drag = { t: t, c: c, el: b }; e.dataTransfer.setData('text/plain', t); e.dataTransfer.effectAllowed = 'move' };
  b.ondblclick = function () { trash.push([{ t: txt(b), c: b.dataset.c }]); b.remove(); hint() };
  stack.insertBefore(b, before || null); hint()
}
function slot(y) { var k = stack.children; for (var i = 0; i < k.length; i++) { if (k[i] === (drag && drag.el)) continue; var r = k[i].getBoundingClientRect(); if (y < r.top + r.height / 2) return k[i] } return null }
var wsEl = document.getElementById("ws");
[wsEl, pal].forEach(function (z) { z.ondragover = function (e) { e.preventDefault(); z.classList.add("over") }; z.ondragleave = function () { z.classList.remove("over") } });
wsEl.ondrop = function (e) { e.preventDefault(); wsEl.classList.remove("over"); if (!drag) return; var at = slot(e.clientY); if (drag.el) stack.insertBefore(drag.el, at); else add(drag.t, drag.c, at); drag = null; hint() };
pal.ondrop = function (e) { e.preventDefault(); pal.classList.remove("over"); if (drag && drag.el) { trash.push([{ t: txt(drag.el), c: drag.el.dataset.c }]); drag.el.remove(); hint() } drag = null };
function upd() { stat.textContent = "Stage · x: " + Math.round(x) + " y: " + Math.round(y) + " · direction: " + dir; sp.style.left = (50 + x / 4.8 * 1) + "%"; sp.style.top = (50 - y / 3.6 * 1) + "%"; sp.style.transform = "translate(-50%,-50%) rotate(" + (dir - 90) + "deg)" }
function say(t) { var o = stage.querySelector(".bubble"); if (o) o.remove(); var b = document.createElement("div"); b.className = "bubble"; b.textContent = t; b.style.left = sp.style.left; b.style.top = sp.style.top; stage.appendChild(b); timers.push(setTimeout(function () { b.remove() }, 1800)) }
function step(t) {
  var n = parseInt((t.match(/-?\d+/) || [0])[0], 10); var xb = findX(t); if (xb) { var rv = xb.r ? xb.r(t, n) : 0; upd(); return rv }
  if (/^move/.test(t)) { x += n * Math.cos((dir - 90) * Math.PI / 180); y -= n * Math.sin((dir - 90) * Math.PI / 180) }
  else if (/^turn/.test(t)) dir = (dir + n) % 360;
  else if (/^go to random/.test(t)) { x = Math.random() * 300 - 150; y = Math.random() * 200 - 100 }
  else if (/^go to/.test(t)) { var g = t.match(/x: (-?\d+) y: (-?\d+)/); x = g ? +g[1] : 0; y = g ? +g[2] : 0 }
  else if (/^bounce/.test(t)) { if (Math.abs(x) >= 230) { dir = (dir + 180) % 360; x = Math.sign(x) * 229 } }
  else if (/^camera on/.test(t)) camOn();
  else if (/^camera off/.test(t)) camOff();
  else if (/^glide to face/.test(t)) { if (faces.length) { x = faces[0].x; y = faces[0].y } }
  else if (/^show number of faces/.test(t)) say(faces.length + ' face(s)');
  else if (/^speak/.test(t)) { var sp2 = t.replace(/^speak /, ''); try { speechSynthesis.speak(new SpeechSynthesisUtterance(sp2)) } catch (e) { } say(sp2) }
  else if (/^change x/.test(t)) x += n; else if (/^change y/.test(t)) y += n;
  else if (/^(say|think)/.test(t)) say(t.replace(/^(say|think) /, "").replace(/ for \d+ seconds/, ""));
  else if (/^hide/.test(t)) sp.style.visibility = "hidden"; else if (/^show$/.test(t)) sp.style.visibility = "visible";
  else if (/^next costume/.test(t)) sp.textContent = sp.textContent === "🐱" ? "😺" : "🐱";
  upd()
}
var tok = 0, pyOn = false, OPEN = /^(repeat|forever|if )/;
function stop() { tok++; timers.forEach(clearTimeout); timers = [] }
function txt(e) { return Array.prototype.map.call(e.childNodes, function (n) { return n.nodeType === 3 ? n.textContent : n.value }).join('') }
function indent() { var d = 0; Array.prototype.forEach.call(stack.children, function (e) { var t = txt(e); if (t === 'end') d = Math.max(0, d - 1); e.style.marginLeft = d * 22 + 'px'; if (OPEN.test(t)) d++ }) }
function parse(L) { var i = 0; function blk() { var o = []; while (i < L.length) { var t = L[i++]; if (t === 'end') return o; var n = { t: t }; if (OPEN.test(t)) n.k = blk(); o.push(n) } return o } var r = []; while (i < L.length) r = r.concat(blk()); return r }
function sleep(ms) { return new Promise(function (r) { setTimeout(r, ms) }) }
function cond(t) { var xb = findX(t); if (xb && xb.q) return !!xb.q(t, parseInt((t.match(/-?\d+/) || [0])[0], 10)); if (/face detected/.test(t)) return faces.length > 0; if (/touching edge/.test(t)) return Math.abs(x) >= 230 || Math.abs(y) >= 170; var m = t.match(/x > (-?\d+)/); return m ? x > +m[1] : false }
async function exec(L, id) {
  for (var q = 0; q < L.length; q++) {
    if (id !== tok) return; var t = L[q].t, k = L[q].k || [], n = parseInt((t.match(/-?\d+/) || [1])[0], 10);
    if (/^repeat/.test(t)) { for (var j = 0; j < n && id === tok; j++)await exec(k, id) }
    else if (/^forever/.test(t)) { while (id === tok) { await exec(k, id); await sleep(30) } }
    else if (/^if /.test(t)) { if (cond(t)) await exec(k, id) }
    else if (/^wait/.test(t)) { await sleep(n * 1000) }
    else if (/^stop all/.test(t)) { tok++; return }
    else { var rv = step(t); if (rv && rv.then) await rv; await sleep(/^(say|think)/.test(t) ? 700 : 350) }
  }
}
function go() { stop(); var id = tok; exec(parse(Array.prototype.map.call(stack.children, function (e) { return txt(e) })), id) }
function render() {
  var L = Array.prototype.map.call(stack.children, function (e) { return txt(e) }), o = [], d = 0, rnd = 0, tm = 0;
  function P(s) { o.push('    '.repeat(d) + s) }
  L.forEach(function (t) {
    var n = (t.match(/-?\d+/) || [0])[0], m, s;
    if (t === 'end') { if (o.length && /:$/.test(o[o.length - 1])) P('pass'); d = Math.max(0, d - 1); return }
    var xb = findX(t); if (xb) s = xb.p.split('#').join(n); else if (/^move/.test(t)) s = 'sprite.move(' + n + ')';
    else if (/^turn/.test(t)) s = 'sprite.turn(' + n + ')';
    else if (/^go to random/.test(t)) { s = 'sprite.goto(random.randint(-150, 150), random.randint(-100, 100))'; rnd = 1 }
    else if (/^go to/.test(t)) { m = t.match(/x: (-?\d+) y: (-?\d+)/); s = 'sprite.goto(' + (m ? m[1] + ', ' + m[2] : '0, 0') + ')' }
    else if (/^change x/.test(t)) s = 'sprite.changex(' + n + ')';
    else if (/^change y/.test(t)) s = 'sprite.changey(' + n + ')';
    else if (/^bounce/.test(t)) s = 'sprite.bounce_on_edge()';
    else if (/^(say|think)/.test(t)) { m = t.match(/^(say|think) (.*?)(?: for (-?\d+) seconds)?$/); s = 'sprite.' + m[1] + '(\"' + m[2] + '\"' + (m[3] ? ', ' + m[3] : '') + ')' }
    else if (/^next costume/.test(t)) s = 'sprite.next_costume()';
    else if (/^show$/.test(t)) s = 'sprite.show()';
    else if (/^hide$/.test(t)) s = 'sprite.hide()';
    else if (/^wait/.test(t)) { s = 'time.sleep(' + n + ')'; tm = 1 }
    else if (/^repeat/.test(t)) s = 'for i in range(' + n + '):';
    else if (/^forever/.test(t)) s = 'while True:';
    else if (/^if touching edge/.test(t)) s = 'if sprite.touching_edge():';
    else if (/^if x/.test(t)) s = 'if sprite.x > ' + n + ':';
    else if (/^stop all/.test(t)) s = 'stop_all()';
    else if (/^camera on/.test(t)) s = 'camera.on()';
    else if (/^camera off/.test(t)) s = 'camera.off()';
    else if (/^if face detected/.test(t)) s = 'if camera.face_detected():';
    else if (/^glide to face/.test(t)) s = 'sprite.goto(*camera.face_position())';
    else if (/^show number of faces/.test(t)) s = 'print(camera.face_count())';
    else if (/^speak/.test(t)) s = 'speaker.say(' + JSON.stringify(t.replace(/^speak /, '')) + ')';
    else s = '# ' + t + '  (no Python equivalent yet)';
    P(s); if (/:$/.test(s)) d++
  });
  if (o.length && /:$/.test(o[o.length - 1])) P('pass');
  var h = ['# Generated from your blocks']; if (rnd) h.push('import random'); if (tm) h.push('import time'); h.push("sprite = Sprite('Sprite1')", '');
  document.getElementById('py').textContent = h.concat(o).join('\n')
}
var faces = [], camStream = null, camTimer = null, fd = null, prevF = null;
function setFaces(a) { faces = a; var m = document.getElementById('fm'); m.hidden = !a.length; if (a.length) { m.style.left = (50 + a[0].x / 4.8) + '%'; m.style.top = (50 - a[0].y / 3.6) + '%' } }
function aiMsg(s) { document.getElementById('ai').textContent = 'AI: ' + s }
stage.onmousemove = function (e) { if (camStream) return; var r = stage.getBoundingClientRect(); setFaces([{ x: ((e.clientX - r.left) / r.width - .5) * 480, y: (.5 - (e.clientY - r.top) / r.height) * 360 }]); aiMsg('simulated face (mouse over the Stage)') };
stage.onmouseleave = function () { if (!camStream) setFaces([]) };
function camOff() { if (camTimer) clearInterval(camTimer); camTimer = null; if (camStream) camStream.getTracks().forEach(function (t) { t.stop() }); camStream = null; var v = document.getElementById('cam'); v.hidden = true; v.srcObject = null; setFaces([]); aiMsg('camera off') }
function camOn() {
  if (camStream) return; if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) { aiMsg('camera not available here'); return }
  navigator.mediaDevices.getUserMedia({ video: true }).then(function (s) {
    camStream = s; var v = document.getElementById('cam'); v.srcObject = s; v.hidden = false;
    var cv = document.createElement('canvas'); cv.width = 64; cv.height = 48; var cx = cv.getContext('2d', { willReadFrequently: true }); prevF = null; fd = null;
    if (window.FaceDetector) { try { fd = new FaceDetector({ fastMode: true }) } catch (e) { fd = null } }
    aiMsg(fd ? 'camera on · Face Detector API' : 'camera on · no face model in this browser, tracking motion instead');
    camTimer = setInterval(function () {
      if (v.readyState < 2) return;
      if (fd) { fd.detect(v).then(function (r) { setFaces(r.map(function (f) { var b = f.boundingBox; return { x: -((b.x + b.width / 2) / v.videoWidth - .5) * 480, y: (.5 - (b.y + b.height / 2) / v.videoHeight) * 360 } })) }).catch(function () { }); return }
      cx.drawImage(v, 0, 0, 64, 48); var d = cx.getImageData(0, 0, 64, 48).data, sx = 0, sy = 0, n = 0;
      if (prevF) { for (var i = 0; i < d.length; i += 4) { if (Math.abs(d[i] - prevF[i]) + Math.abs(d[i + 1] - prevF[i + 1]) + Math.abs(d[i + 2] - prevF[i + 2]) > 90) { var p = i / 4; sx += p % 64; sy += Math.floor(p / 64); n++ } } }
      prevF = d; setFaces(n > 40 ? [{ x: -(sx / n / 64 - .5) * 480, y: (.5 - sy / n / 48) * 360 }] : [])
    }, 200)
  }).catch(function () { aiMsg('camera blocked or unavailable') })
}
var HW = { led: 0, mot: 0, srv: 90, t: 25, l: 50, d: 100, btn: 0 }, IOT = {}, KN = [], objPos = null, gest = '', gT = 0, hist = [], wr = null, bleChar = null, X = [];
var c64 = document.createElement('canvas'); c64.width = 64; c64.height = 48; var x64 = c64.getContext('2d', { willReadFrequently: true });
var said = document.getElementById('said');
function K(t) { return t.replace(/-?\d+/g, '#') }
function findX(t) { var k = K(t); for (var i = 0; i < X.length; i++)if (X[i].k === k) return X[i] }
function E(c, t, p, r, q) { X.push({ c: c, t: t, k: K(t), p: p, r: r, q: q }) }
function hwLog(s) { document.getElementById('hlog').textContent = 'Hardware: ' + s }
function hwUI() { document.getElementById('hled').className = 'led' + (HW.led ? ' on' : ''); document.getElementById('hmot').textContent = 'Motor ' + HW.mot + '%'; document.getElementById('hsrv').textContent = 'Servo ' + HW.srv + '°' }
function tx(c) { var b = new TextEncoder().encode(c + '\n'); if (wr) wr.write(b).catch(function () { }); if (bleChar) bleChar.writeValue(b).catch(function () { }) }
function hsend(c) { tx(c); hwUI() }
function frame() { var v = document.getElementById('cam'); if (!camStream || v.readyState < 2) { aiMsg('turn the camera on first (Face Detection > camera on)'); return null } x64.drawImage(v, 0, 0, 64, 48); return x64.getImageData(0, 0, 64, 48).data }
function feat() { var d = frame(); if (!d) return null; var f = []; for (var by = 0; by < 12; by++)for (var bx = 0; bx < 16; bx++) { var s = [0, 0, 0]; for (var j = 0; j < 4; j++)for (var i = 0; i < 4; i++) { var p = ((by * 4 + j) * 64 + bx * 4 + i) * 4; s[0] += d[p]; s[1] += d[p + 1]; s[2] += d[p + 2] } f.push(s[0] / 4080, s[1] / 4080, s[2] / 4080) } return f }
function classify(f, skip) { f = f || feat(); if (!f || !KN.length) return '?'; var r = []; KN.forEach(function (s, i) { if (i === skip) return; var d = 0; for (var j = 0; j < f.length; j++) { var e = f[j] - s.f[j]; d += e * e } r.push([d, s.l]) }); r.sort(function (a, b) { return a[0] - b[0] }); var v = {}, best = '?', bn = 0; r.slice(0, 3).forEach(function (e) { v[e[1]] = (v[e[1]] || 0) + 1; if (v[e[1]] > bn) { bn = v[e[1]]; best = e[1] } }); return best }
function addS(l) { var f = feat(); if (f) { KN.push({ f: f, l: l }); aiMsg('dataset: ' + KN.length + ' samples') } }
function train() { if (KN.length < 2) { aiMsg('add at least 2 samples first'); return } var ok = 0; KN.forEach(function (s, i) { if (classify(s.f, i) === s.l) ok++ }); aiMsg('model trained on ' + KN.length + ' samples · leave-one-out accuracy ' + Math.round(ok / KN.length * 100) + '%') }
function findColor(c) { var d = frame(); objPos = null; if (!d) return; var sx = 0, sy = 0, n = 0; for (var i = 0; i < d.length; i += 4) { var r = d[i], g = d[i + 1], b = d[i + 2]; var hit = c === 'red' ? (r > 140 && r > g * 1.6 && r > b * 1.6) : c === 'green' ? (g > 110 && g > r * 1.3 && g > b * 1.3) : (b > 110 && b > r * 1.3 && b > g * 1.2); if (hit) { var p = i / 4; sx += p % 64; sy += Math.floor(p / 64); n++ } } if (n > 25) { objPos = { x: -(sx / n / 64 - .5) * 480, y: (.5 - sy / n / 48) * 360 }; aiMsg('found ' + c + ' object') } else aiMsg('no ' + c + ' object in view') }
function listen() { return new Promise(function (res) { var SR = window.SpeechRecognition || window.webkitSpeechRecognition; if (!SR) { aiMsg('speech recognition not supported here · type in the box instead'); return res() } var r = new SR(); r.lang = 'en-US'; r.onresult = function (e) { said.value = e.results[0][0].transcript.toLowerCase(); aiMsg('heard: ' + said.value) }; r.onend = function () { res() }; r.onerror = function (e) { aiMsg('mic error: ' + e.error + ' · type in the box instead'); res() }; aiMsg('listening...'); try { r.start() } catch (e) { res() } setTimeout(function () { try { r.stop() } catch (e) { } }, 6000) }) }
function senti() { var P = ['good', 'great', 'love', 'happy', 'awesome', 'nice', 'yes', 'thanks', 'cool'], N = ['bad', 'sad', 'hate', 'angry', 'no', 'terrible', 'awful', 'stop'], s = 0; said.value.toLowerCase().split(/\W+/).forEach(function (w) { if (P.indexOf(w) > -1) s++; if (N.indexOf(w) > -1) s-- }); return s }
var ML = 'Machine Learning Environment', HB = 'Hardware|Arduino Uno|ESP32|micro:bit|Quarky|Sensors|Motors & Servos';
E(ML, 'add camera sample to class 1', 'ml.add_sample(#)', function (t, n) { addS('class ' + n) });
E(ML, 'clear dataset', 'ml.clear()', function () { KN = []; aiMsg('dataset cleared') });
E(ML, 'train model', 'ml.train()', train);
E(ML, 'classify camera image', 'print(ml.classify())', function () { var c = classify(); aiMsg('image class: ' + c); say(c) });
E(ML, 'if image class is 1 then', 'if ml.classify() == #:', 0, function (t, n) { return classify() === 'class ' + n });
E('Face Recognition', 'remember face as person 1', 'face.remember(#)', function (t, n) { addS('person ' + n) });
E('Face Recognition', 'if recognized person is 1 then', 'if face.recognize() == #:', 0, function (t, n) { return classify() === 'person ' + n });
['red', 'green', 'blue'].forEach(function (c) { E('Object Detection', 'find ' + c + ' object', 'objects.find(' + JSON.stringify(c) + ')', function () { findColor(c) }) });
E('Object Detection', 'if object found then', 'if objects.found():', 0, function () { return !!objPos });
E('Object Detection', 'glide to object position', 'sprite.goto(*objects.position())', function () { if (objPos) { x = objPos.x; y = objPos.y } });
['left', 'right', 'up', 'down'].forEach(function (d) { E('Hand Gesture', 'if swipe ' + d + ' detected then', 'if gesture.swipe() == ' + JSON.stringify(d) + ':', 0, function () { return gest === d && Date.now() - gT < 1200 }) });
E('Body Tracking', 'follow body motion', 'sprite.goto(*body.position())', function () { if (faces.length) { x = faces[0].x; y = faces[0].y } });
E('Body Tracking', 'if body motion detected then', 'if body.detected():', 0, function () { return faces.length > 0 });
['left', 'right', 'above', 'below'].forEach(function (d) { E('Pose Detection', 'if body is ' + d + ' of center then', 'if pose.is_' + d + '():', 0, function () { return faces.length > 0 && (d === 'left' ? faces[0].x < -60 : d === 'right' ? faces[0].x > 60 : d === 'above' ? faces[0].y > 50 : faces[0].y < -50) }) });
E('Speech Recognition', 'listen and wait', 'speech.listen()', listen);
E('Speech Recognition', 'show what was heard', 'print(speech.text())', function () { say(said.value || '(nothing heard)') });
['hello', 'yes', 'no', 'go', 'stop'].forEach(function (w) { E('Speech Recognition', 'if heard ' + w + ' then', 'if ' + JSON.stringify(w) + ' in speech.text():', 0, function () { return said.value.toLowerCase().indexOf(w) > -1 }) });
E('Natural Language', 'if text is positive then', 'if nlp.sentiment() > 0:', 0, function () { return senti() > 0 });
E('Natural Language', 'if text is negative then', 'if nlp.sentiment() < 0:', 0, function () { return senti() < 0 });
E('Natural Language', 'if text is a question then', 'if nlp.is_question():', 0, function () { return /\?|^(what|who|why|how|when|where)\b/.test(said.value.toLowerCase().trim()) });
E('Natural Language', 'show text word count', 'print(nlp.word_count())', function () { var s = said.value.trim(); say((s ? s.split(/\s+/).length : 0) + ' words') });
E('OCR', 'read text from camera', 'ocr.read()', function () { if (!window.TextDetector) { aiMsg('OCR is not supported in this browser · type in the box instead'); return } if (!camStream) { aiMsg('turn the camera on first'); return } return new TextDetector().detect(document.getElementById('cam')).then(function (r) { said.value = r.map(function (o) { return o.rawValue }).join(' '); aiMsg('read: ' + said.value) }).catch(function () { aiMsg('OCR failed') }) });
E('OCR', 'show recognized text', 'print(ocr.text())', function () { say(said.value || '(no text)') });
E('Text to Speech', 'speak the typed text', 'speaker.say(text)', function () { try { speechSynthesis.speak(new SpeechSynthesisUtterance(said.value)) } catch (e) { } say(said.value) });
E(HB, 'LED on', 'hw.led(1)', function () { HW.led = 1; hsend('LED 1') });
E(HB, 'LED off', 'hw.led(0)', function () { HW.led = 0; hsend('LED 0') });
E(HB, 'blink LED 3 times', 'hw.blink(#)', async function (t, n) { for (var i = 0; i < (n || 1); i++) { HW.led = 1; hsend('LED 1'); await sleep(250); HW.led = 0; hsend('LED 0'); await sleep(250) } });
E(HB, 'set motor speed to 50', 'hw.motor(#)', function (t, n) { HW.mot = Math.max(-100, Math.min(100, n)); hsend('MOTOR ' + HW.mot) });
E(HB, 'stop motor', 'hw.motor(0)', function () { HW.mot = 0; hsend('MOTOR 0') });
E(HB, 'set servo angle to 90', 'hw.servo(#)', function (t, n) { HW.srv = Math.max(0, Math.min(180, n)); hsend('SERVO ' + HW.srv) });
E(HB, 'if button pressed then', 'if hw.button():', 0, function () { return !!HW.btn });
E(HB, 'if temperature > 30 then', 'if hw.temperature() > #:', 0, function (t, n) { return HW.t > n });
E(HB, 'if light level < 40 then', 'if hw.light() < #:', 0, function (t, n) { return HW.l < n });
E(HB, 'if distance < 20 then', 'if hw.distance() < #:', 0, function (t, n) { return HW.d < n });
E(HB, 'show temperature', 'print(hw.temperature())', function () { say(HW.t + ' °C') });
E('Bluetooth', 'send hello over Bluetooth', 'bluetooth.send("hello")', function () { tx('MSG hello'); hwLog(bleChar ? 'sent over Bluetooth' : 'sent (no Bluetooth device connected)') });
E('Bluetooth', 'if Bluetooth connected then', 'if bluetooth.connected():', 0, function () { return !!bleChar });
E('IoT', 'publish sensors to cloud', 'iot.publish(temperature, light, distance)', function () { IOT = { temp: HW.t, light: HW.l, dist: HW.d }; hwLog('simulated cloud: ' + JSON.stringify(IOT)) });
E('IoT', 'show cloud temperature', 'print(iot.get("temperature"))', function () { say(IOT.temp === undefined ? 'no data yet' : IOT.temp + ' °C') });
X.forEach(function (e) { e.c.split('|').forEach(function (c) { (EB[c] = EB[c] || []).push(e.t) }) });
EB['Image Classification'] = EB['Dataset Collection'] = EB['AI Model Training'] = EB[ML];
Object.keys(EB).forEach(function (k) { if (EB[k].some(function (b) { return /^if /.test(b) }) && EB[k].indexOf('end') < 0) EB[k].push('end') });
[['st', 'vt', 't'], ['sl', 'vl', 'l'], ['sd', 'vd', 'd']].forEach(function (a) { var s = document.getElementById(a[0]); s.oninput = function () { HW[a[2]] = +s.value; document.getElementById(a[1]).textContent = s.value } });
var hb = document.getElementById('hbtn'); hb.onpointerdown = function () { HW.btn = 1 }; hb.onpointerup = hb.onpointerleave = function () { HW.btn = 0 };
document.getElementById('hser').onclick = async function () { try { var p = await navigator.serial.requestPort(); await p.open({ baudRate: 9600 }); wr = p.writable.getWriter(); hwLog('USB serial connected, commands like LED 1 are sent') } catch (e) { hwLog('USB serial unavailable: ' + (e.message || e)) } };
document.getElementById('hble').onclick = async function () { var U = '6e400001-b5a3-f393-e0a9-e50e24dcca9e'; try { var d = await navigator.bluetooth.requestDevice({ acceptAllDevices: true, optionalServices: [U] }); var s = await d.gatt.connect(); hwLog('Bluetooth connected: ' + (d.name || 'device')); try { var sv = await s.getPrimaryService(U); bleChar = await sv.getCharacteristic('6e400002-b5a3-f393-e0a9-e50e24dcca9e') } catch (e) { hwLog('connected, but no UART service found, so nothing can be sent') } } catch (e) { hwLog('Bluetooth unavailable: ' + (e.message || e)) } };
setInterval(function () { var now = Date.now(); if (faces.length) hist.push({ x: faces[0].x, y: faces[0].y, t: now }); else hist = []; hist = hist.filter(function (h) { return h.t > now - 900 }); if (hist.length > 3) { var a = hist[0], b = hist[hist.length - 1], dx = b.x - a.x, dy = b.y - a.y; if (Math.abs(dx) > 150 && Math.abs(dx) > Math.abs(dy)) { gest = dx > 0 ? 'right' : 'left' } else if (Math.abs(dy) > 110) { gest = dy > 0 ? 'up' : 'down' } else return; gT = now; hist = [] } }, 150);
hwUI();
var undo = [], redo = [], cur = '[]', busy = 0, trash = [], board = 'Arduino Uno';
var BD = [['evive', '🧩'], ['Quarky', '🔷'], ['Wizbot', '🤖'], ['Arduino Uno', '🟦'], ['Arduino Mega', '🟦'], ['Arduino Nano', '🟦'], ['ESP32', '📶'], ['T-Watch', '⌚'], ['micro:bit', '🔴'], ['TECbits', '🧪'], ['LEGO EV3', '🧱'], ['LEGO BOOST', '🧱']];
var EXS = [['Walk and say hello', [['move 50 steps', '--motion'], ['say Hello! for 2 seconds', '--looks'], ['turn right 15 degrees', '--motion'], ['move 50 steps', '--motion']]], ['Bounce forever', [['forever', '--control'], ['move 10 steps', '--motion'], ['bounce if on edge', '--motion'], ['end', '--control']]], ['Follow my face', [['camera on', '--ext'], ['forever', '--control'], ['glide to face position', '--ext'], ['end', '--control']]], ['Blink an LED', [['blink LED 3 times', '--ext'], ['say Done!', '--looks']]], ['Greet when I say hello', [['listen and wait', '--ext'], ['if heard hello then', '--ext'], ['speak Hello there', '--ext'], ['end', '--control']]]];
function $(i) { return document.getElementById(i) }
function snap() { return JSON.stringify(Array.prototype.map.call(stack.children, function (e) { return { t: txt(e), c: e.dataset.c } })) }
function hist2() { var s = snap(); if (s !== cur) { if (!busy) { undo.push(cur); if (undo.length > 50) undo.shift(); redo = [] } cur = s } }
function setStack(l) { busy = 1; stack.innerHTML = ''; l.forEach(function (b) { add(b.t, b.c) }); hint(); busy = 0 }
function doUndo() { if (inCos()) return cUndo(); if (inSnd()) return sUndo(); if (!undo.length) return aiMsg('nothing to undo'); redo.push(cur); setStack(JSON.parse(undo.pop())) }
function doRedo() { if (inCos()) return cRedo(); if (inSnd()) return sRedo(); if (!redo.length) return aiMsg('nothing to redo'); undo.push(cur); setStack(JSON.parse(redo.pop())) }
function doRestore() { var g = trash.pop(); if (!g) return aiMsg('nothing to restore'); g.forEach(function (b) { add(b.t, b.c) }) }
function doNew() { var g = []; Array.prototype.forEach.call(stack.children, function (e) { g.push({ t: txt(e), c: e.dataset.c }) }); if (g.length) trash.push(g); stack.innerHTML = ''; hint(); stop(); aiMsg('new project (Edit > Restore brings the blocks back)') }
function dlg(t, h, g) { $('dt').textContent = t; $('db').innerHTML = h; $('dlg').className = 'dlg' + (g ? ' g' : ''); $('ov').hidden = false }
function closeDlg() { $('ov').hidden = true }
function projJSON() { return JSON.stringify({ name: $('pname').value, blocks: JSON.parse(snap()) }, null, 1) }
function loadProj(s) { try { var p = JSON.parse(s); if (p.name) $('pname').value = p.name; setStack(p.blocks || []); undo = []; redo = []; aiMsg('project loaded'); closeDlg() } catch (e) { aiMsg('that is not a valid project') } }
function loadEx(i) { setStack(EXS[i][1].map(function (b) { return { t: b[0], c: b[1] } })); undo = []; redo = []; closeDlg() }
function setBoard(i) { board = BD[i][0]; $('bdBtn').title = 'Board: ' + board; Array.prototype.forEach.call(document.querySelectorAll('.info h4'), function (h) { if (/^Hardware/.test(h.textContent)) h.textContent = 'Hardware (' + board + ', virtual)' }); hwLog('board set to ' + board); closeDlg() }
function boardDlg() { dlg('Select Board', '<div class=bg>' + BD.map(function (b, i) { return '<button class="bc' + (b[0] === board ? ' on' : '') + '" data-a=bd data-i=' + i + '><span>' + b[1] + '</span>' + b[0] + '</button>' }).join('') + '</div><p class=mu>Boards are listed for selection and share the virtual board. Real USB or Bluetooth connection is under Connect.</p>', 1) }
function conDlg() { var st = wr ? 'USB serial connected' : bleChar ? 'Bluetooth connected' : 'Not connected (virtual board active)'; dlg('Connect', '<p><b>Board:</b> ' + board + '</p><p><b>Status:</b> ' + st + '</p><button class=pb data-a=usb>Connect via USB</button><button class=pb data-a=ble>Connect via Bluetooth</button><button class=pb data-a=disc>Disconnect</button><p class=mu>USB needs Web Serial and Bluetooth needs Web Bluetooth (Chrome or Edge). If the browser blocks them, the virtual board keeps working.</p>', 1) }
var fi = document.createElement('input'); fi.type = 'file'; fi.accept = '.json'; fi.onchange = function () { var f = fi.files[0]; if (!f) return; var r = new FileReader(); r.onload = function () { loadProj(r.result) }; r.readAsText(f); fi.value = '' };
function act(a, el) {
  var i = el ? +el.getAttribute('data-i') : 0; switch (a) {
    case 'new': doNew(); break; case 'load': fi.click(); break; case 'restore': doRestore(); break; case 'undo': doUndo(); break; case 'redo': doRedo(); break;
    case 'save': dlg('Save to your computer', '<p>Your project is below. Copy it, or try downloading it as a file.</p><textarea id=sv readonly></textarea><button class=pb data-a=copy>Copy</button><button class=pb data-a=dl>Download file</button><p class=mu>Embedded pages can block downloads. If nothing downloads, use Copy and paste it into a .json file.</p>'); $('sv').value = projJSON(); break;
    case 'copy': $('sv').select(); try { document.execCommand('copy'); aiMsg('copied') } catch (e) { } break;
    case 'dl': { var u = URL.createObjectURL(new Blob([projJSON()], { type: 'application/json' })), a2 = document.createElement('a'); a2.href = u; a2.download = ($('pname').value || 'project') + '.json'; a2.click() } break;
    case 'share': dlg('Share', '<p>Link to this page:</p><input id=shl readonly><button class=pb data-a=copyl>Copy link</button><p class=mu>For the public link, use the Share option of the viewer around this page. QR codes are not available in this build.</p>'); $('shl').value = location.href; break;
    case 'copyl': $('shl').select(); try { document.execCommand('copy'); aiMsg('link copied') } catch (e) { } break;
    case 'link': dlg('Open File from Link or QR code', '<p>Paste a saved project here. Loading from web links or scanning QR codes is not available in this build.</p><textarea id=lk></textarea><button class=pb data-a=openpaste>Open</button>'); break;
    case 'openpaste': loadProj($('lk').value); break;
    case 'ml': { var m = Array.prototype.filter.call(document.querySelectorAll('#exts button'), function (x) { return x.textContent.indexOf('Machine Learning') > -1 })[0]; if (m) m.click() } break;
    case 'gs': dlg('Getting Started', '<ol><li>Pick blocks from the palette, or drag them into the scripts area.</li><li>Press the Green flag to run them on the Stage.</li><li>Add an AI or hardware extension from Extensions.</li><li>Use Board and Connect to choose and link a board.</li><li>Press Python to see your blocks as code.</li></ol>'); break;
    case 'tut': dlg('Tutorials', '<p><b>1. Make the cat move</b><br>Stack move, turn and say blocks. <button class=pb data-a=ex data-i=0>Try it</button></p><p><b>2. Loops</b><br>Repeat actions forever. <button class=pb data-a=ex data-i=1>Try it</button></p><p><b>3. AI: follow your face</b><br>Needs the camera. <button class=pb data-a=ex data-i=2>Try it</button></p><p><b>4. Control hardware</b><br>Blink the virtual LED. <button class=pb data-a=ex data-i=3>Try it</button></p>'); break;
    case 'exs': dlg('Examples', '<p>Load a ready-made project:</p>' + EXS.map(function (e, j) { return '<button class=pb data-a=ex data-i=' + j + '>' + e[0] + '</button>' }).join('')); break;
    case 'ex': loadEx(i); break;
    case 'help': dlg('Help', '<ul><li>Drag blocks into the scripts area, or click a block to add it.</li><li>Double-click a block, or drag it back to the palette, to delete it. Edit > Restore brings it back.</li><li>Click numbers inside blocks to change them.</li><li>Camera blocks need permission; hover the Stage to simulate a face if the camera is blocked.</li><li>Board and Connect set up the virtual board or a real one.</li></ul>'); break;
    case 'board': boardDlg(); break; case 'bd': setBoard(i); break;
    case 'connect': conDlg(); break; case 'fw': fwDlg(); break; case 'fwgo': fwGo(); break; case 'bkc': addBackdrop('Colour ' + (BK.length + 1), $('bkc').value); closeDlg(); break; case 'snc': COS.push({ n: 'Snapshot ' + (COS.length + 1), e: '', img: snapU }); cosI = COS.length - 1; showCos(); closeDlg(); aiMsg('snapshot added as a costume'); break; case 'snd': { var sa = document.createElement('a'); sa.href = snapU; sa.download = 'stage.png'; sa.click() } break;
    case 'usb': $('hser').click(); closeDlg(); break; case 'ble': $('hble').click(); closeDlg(); break;
    case 'disc': try { if (wr) wr.releaseLock() } catch (e) { } wr = null; bleChar = null; hwLog('disconnected'); conDlg(); break;
  }
}
document.querySelector('header').addEventListener('click', function (e) { var b = e.target.closest && e.target.closest('[data-a]'); if (!b) return; act(b.getAttribute('data-a'), b); var d = b.closest('.dd'); if (d) { d.style.display = 'none'; setTimeout(function () { d.style.display = '' }, 400) } });
$('db').addEventListener('click', function (e) { var b = e.target.closest('[data-a]'); if (b) act(b.getAttribute('data-a'), b) });
$('dx').onclick = closeDlg; $('ov').onclick = function (e) { if (e.target === this) closeDlg() }; document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeDlg() });
$('mUp').onclick = function () { if (!(wr || bleChar)) { conDlg(); return } $('mUp').className = 'on'; $('mStage').className = ''; aiMsg('Upload mode: commands are sent to the connected board') };
$('mStage').onclick = function () { $('mStage').className = 'on'; $('mUp').className = '' };
setInterval(function () { $('cnBtn').className = 'menu' + (wr || bleChar ? ' on' : '') }, 1000);
var size = 100, cosI = 0, tool = 'brush', cvx = null, pen = null, snapD = null, auds = [], AC = null, vol = 1, pitch = 1, mr = null, chunks = [];
var COS = [{ n: 'Cat', e: '🐱' }, { n: 'Cat walking 1', e: '😺' }, { n: 'Cat walking 2', e: '😸' }, { n: 'Cat walking 3', e: '😻' }, { n: 'Cat mouth', e: '😼' }, { n: 'Cat jump', e: '🙀' }];
var SND = [{ n: 'Meow', f: [600, 900, 500], d: .5, w: 'sawtooth' }, { n: 'Pop', f: [800, 200], d: .12, w: 'sine' }, { n: 'Chirp', f: [1200, 1800], d: .2, w: 'square' }, { n: 'Drum', f: [150, 50], d: .3, w: 'triangle' }, { n: 'Laser', f: [1500, 200], d: .25, w: 'sawtooth' }];
function showCos() { var c = COS[cosI]; sp.textContent = c.img ? '' : c.e; if (c.img) { var im = new Image(); im.src = c.img; im.style.cssText = 'width:64px;height:48px;display:block'; sp.appendChild(im) } }
function nextCos() { cosI = (cosI + 1) % COS.length; showCos(); if (!$('cs').hidden && $('cl')) listCos() }
function listCos() { var L = $('cl'); L.innerHTML = ''; COS.forEach(function (c, i) { var b = document.createElement('button'); b.className = 'ci' + (i === cosI ? ' on' : ''); b.setAttribute('data-a', 'cpick'); b.setAttribute('data-i', i); var th; if (c.img) { th = new Image(); th.src = c.img } else { th = document.createElement('i'); th.textContent = c.e } b.appendChild(document.createTextNode((i + 1) + ' ')); b.appendChild(th); b.appendChild(document.createTextNode(c.n)); L.appendChild(b) }) }
function openCos() { var c = COS[cosI]; cvx = $('cv').getContext('2d'); cvx.globalCompositeOperation = 'source-over'; cvx.clearRect(0, 0, 480, 360); $('cn').value = c.n; if (c.img) { var im = new Image(); im.onload = function () { cvx.drawImage(im, 0, 0, 480, 360); cH = [$('cv').toDataURL()]; cR = [] }; im.src = c.img } else { cvx.font = '220px serif'; cvx.textAlign = 'center'; cvx.textBaseline = 'middle'; cvx.fillText(c.e, 240, 190); cH = [$('cv').toDataURL()]; cR = [] } }
var cH = [], cR = []; function saveCos() { var u = $('cv').toDataURL(); COS[cosI].img = u; cH.push(u); cR = []; showCos(); listCos() }
function wireCv() {
  var cv = $('cv'); function P(e) { var r = cv.getBoundingClientRect(); return [(e.clientX - r.left) * 480 / r.width, (e.clientY - r.top) * 360 / r.height] }
  cv.onpointerdown = function (e) { cv.setPointerCapture(e.pointerId); pen = P(e); var th = +$('cth').value || 4; cvx.lineCap = 'round'; cvx.lineJoin = 'round'; cvx.lineWidth = th; cvx.strokeStyle = $('co').value; cvx.fillStyle = $('cf').value; if (tool === 'fill') { flood(pen[0], pen[1], $('cf').value); saveCos(); pen = null; return } if (tool === 'text') { cvx.fillStyle = $('co').value; cvx.font = (th * 6 + 10) + 'px sans-serif'; cvx.textBaseline = 'middle'; cvx.textAlign = 'left'; cvx.fillText($('ctx').value, pen[0], pen[1]); saveCos(); pen = null; return } snapD = cvx.getImageData(0, 0, 480, 360); if (tool === 'eraser') { cvx.globalCompositeOperation = 'destination-out'; cvx.lineWidth = th * 3 } };
  cv.onpointermove = function (e) { if (!pen) return; var p = P(e); if (tool === 'brush' || tool === 'eraser') { cvx.beginPath(); cvx.moveTo(pen[0], pen[1]); cvx.lineTo(p[0], p[1]); cvx.stroke(); pen = p } else { cvx.putImageData(snapD, 0, 0); cvx.beginPath(); if (tool === 'line') { cvx.moveTo(pen[0], pen[1]); cvx.lineTo(p[0], p[1]) } else if (tool === 'rect') { cvx.rect(pen[0], pen[1], p[0] - pen[0], p[1] - pen[1]) } else { cvx.ellipse((pen[0] + p[0]) / 2, (pen[1] + p[1]) / 2, Math.abs(p[0] - pen[0]) / 2, Math.abs(p[1] - pen[1]) / 2, 0, 0, 6.283) } if (tool !== 'line') cvx.fill(); cvx.stroke() } };
  cv.onpointerup = function () { if (!pen) return; pen = null; cvx.globalCompositeOperation = 'source-over'; saveCos() }
}
function showCostumes() { tool = 'brush'; zoom = 1; $('cs').innerHTML = '<div class=cw><div class=cl id=cl></div><div class=ce><div class=ct>Costume <input id=cn type=text> Fill <input type=color id=cf value=#9966ff> Outline <input type=color id=co value=#000000> Thickness <input type=number id=cth value=4 min=1 max=40 style=width:56px><button data-a=cflipH>Flip Horizontal</button><button data-a=cflipV>Flip Vertical</button><button data-a=cclear>Clear</button><button data-a=cundo>Undo</button><button data-a=credo>Redo</button><button data-a=cclip>Copy</button><button data-a=cpaste>Paste</button><button data-a=ccopy>Duplicate costume</button><button data-a=cdel>Delete</button></div><div class=ctools><button data-t=brush class=on>Brush</button><button data-t=eraser>Eraser</button><button data-t=line>Line</button><button data-t=circle>Circle</button><button data-t=rect>Rectangle</button><button data-t=fill>Fill (bucket)</button><button data-t=text>Text</button><input id=ctx type=text value=Hello style=width:110px><button data-a=zout>-</button><button data-a=zrst>=</button><button data-a=zin>+</button></div><canvas id=cv width=480 height=360></canvas></div></div>'; listCos(); openCos(); wireCv() }
function showSounds() { $('cs').innerHTML = '<div class=ce><h3>Sounds</h3>' + SND.map(function (s, i) { return '<div class=sr><b>' + s.n + '</b><button data-a=splay data-i=' + i + '>Play</button><button data-a=sdel data-i=' + i + '>Delete</button></div>' }).join('') + '<div class=ct style=margin-top:10px>Volume <input type=range id=svol min=0 max=100 value=' + Math.round(vol * 100) + '> Pitch <input type=range id=spit min=50 max=200 value=' + Math.round(pitch * 100) + '><button data-a=srec id=srec>Record</button><button data-a=sstop>Stop all</button></div><p class=mu id=sm>Built-in sounds are synthesized in your browser. Recording needs microphone permission.</p></div>' }
function playS(n) {
  var s = SND.filter(function (q) { return q.n === n })[0]; if (!s) return; if (s.url) { var a = new Audio(s.url); a.volume = vol; a.playbackRate = pitch; auds.push(a); return new Promise(function (r) { a.onended = r; a.onerror = r; a.play().catch(r) }) }
  try { AC = AC || new (window.AudioContext || window.webkitAudioContext)() } catch (e) { return }
  var o = AC.createOscillator(), g = AC.createGain(), t = AC.currentTime; o.type = s.w; o.frequency.setValueAtTime(s.f[0] * pitch, t); s.f.forEach(function (f, i) { if (i) o.frequency.linearRampToValueAtTime(f * pitch, t + s.d * i / (s.f.length - 1)) }); g.gain.setValueAtTime(.3 * vol, t); g.gain.linearRampToValueAtTime(0, t + s.d); o.connect(g); g.connect(AC.destination); o.start(t); o.stop(t + s.d); auds.push(o); return sleep(s.d * 1000)
}
function stopSnd() { auds.forEach(function (a) { try { a.stop ? a.stop() : a.pause() } catch (e) { } }); auds = [] }
function rec() { if (mr) { mr.stop(); return } navigator.mediaDevices.getUserMedia({ audio: true }).then(function (s) { chunks = []; mr = new MediaRecorder(s); mr.ondataavailable = function (e) { chunks.push(e.data) }; mr.onstop = function () { s.getTracks().forEach(function (t) { t.stop() }); SND.push({ n: 'Recording ' + (SND.length + 1), url: URL.createObjectURL(new Blob(chunks)) }); mr = null; showSounds() }; mr.start(); $('srec').textContent = 'Stop recording' }).catch(function () { $('sm').textContent = 'Microphone blocked or unavailable here.' }) }
function SB(t, p, r) { X.push({ c: '', t: t, k: K(t), p: p, r: r }) }
SND.slice(0, 5).forEach(function (s) { SB('play sound ' + s.n + ' until done', 'sound.play_until_done(' + JSON.stringify(s.n) + ')', function () { return playS(s.n) }); SB('start sound ' + s.n, 'sound.play(' + JSON.stringify(s.n) + ')', function () { playS(s.n) }) });
SB('stop all sounds', 'sound.stop_all()', stopSnd); SB('change volume by -10', 'sound.change_volume(#)', function (t, n) { vol = Math.max(0, Math.min(1, vol + n / 100)) }); SB('next costume', 'sprite.next_costume()', nextCos); SB('change size by 10', 'sprite.change_size(#)', function (t, n) { size = Math.max(10, size + n) });
$('cs').addEventListener('click', function (e) {
  var b = e.target.closest('[data-a],[data-t]'); if (!b) return; var t = b.getAttribute('data-t'); if (t) { tool = t; Array.prototype.forEach.call(document.querySelectorAll('.ctools button'), function (x) { x.className = x === b ? 'on' : '' }); return } var a = b.getAttribute('data-a'), i = +b.getAttribute('data-i');
  if (a === 'cpick') { cosI = i; showCos(); listCos(); openCos() }
  else if (a === 'cflipH' || a === 'cflipV') { var tc = document.createElement('canvas'); tc.width = 480; tc.height = 360; var t2 = tc.getContext('2d'); t2.translate(a === 'cflipH' ? 480 : 0, a === 'cflipV' ? 360 : 0); t2.scale(a === 'cflipH' ? -1 : 1, a === 'cflipV' ? -1 : 1); t2.drawImage($('cv'), 0, 0); cvx.clearRect(0, 0, 480, 360); cvx.drawImage(tc, 0, 0); saveCos() }
  else if (a === 'cclear') { cvx.clearRect(0, 0, 480, 360); saveCos() }
  else if (a === 'ccopy') { var c = COS[cosI]; COS.splice(cosI + 1, 0, { n: c.n + ' copy', e: c.e, img: $('cv').toDataURL() }); cosI++; showCos(); listCos(); openCos() }
  else if (a === 'cdel') { if (COS.length > 1) { COS.splice(cosI, 1); cosI = Math.min(cosI, COS.length - 1); showCos(); listCos(); openCos() } }
  else if (a === 'cundo') { if (cH.length > 1) { cR.push(cH.pop()); cDraw(cH[cH.length - 1]) } }
  else if (a === 'credo') { if (cR.length) { var ru = cR.pop(); cH.push(ru); cDraw(ru) } }
  else if (a === 'cclip') { clip = $('cv').toDataURL(); aiMsg('costume copied') }
  else if (a === 'cpaste') { if (clip) { var pi = new Image(); pi.onload = function () { cvx.drawImage(pi, 20, 20, 480, 360); saveCos() }; pi.src = clip } }
  else if (a === 'zin' || a === 'zout' || a === 'zrst') { zoom = a === 'zrst' ? 1 : Math.max(.5, Math.min(3, zoom + (a === 'zin' ? .25 : -.25))); $('cv').style.width = (zoom * 100) + '%'; $('cv').style.maxWidth = (560 * zoom) + 'px' }
  else if (a === 'splay') { playS(SND[i].n) } else if (a === 'sdel') { sDel.push([i, SND.splice(i, 1)[0]]); sRe = []; showSounds() } else if (a === 'srec') rec(); else if (a === 'sstop') stopSnd()
});
$('cs').addEventListener('input', function (e) { var d = e.target.id; if (d === 'cn') { COS[cosI].n = e.target.value; listCos() } if (d === 'svol') vol = e.target.value / 100; if (d === 'spit') pitch = e.target.value / 100 });
function tab(n) { ['tB', 'tP', 'tC', 'tS'].forEach(function (id) { $(id).setAttribute('aria-selected', id === n) }); var code = (n === 'tB' || n === 'tP'); cats.hidden = pal.hidden = wsEl.hidden = !code; $('cs').hidden = code; if (n === 'tP' && !pyOn) $('pymode').click(); if (n === 'tB' && pyOn) $('pymode').click(); if (n === 'tC') showCostumes(); if (n === 'tS') showSounds() }
['tB', 'tP', 'tC', 'tS'].forEach(function (id) { $(id).onclick = function () { tab(id) } });
$('pymode').addEventListener('click', function () { setTimeout(function () { $('tB').setAttribute('aria-selected', !pyOn); $('tP').setAttribute('aria-selected', pyOn) }, 0) });
$('stop').addEventListener('click', function () { stopSnd(); cosI = 0; showCos() });
function fwDlg() { dlg('Upload Firmware', '<p><b>Board:</b> ' + board + '</p><div class=pbar><div id=fwb></div></div><p id=fwm class=mu>Ready to upload.</p><button class=pb data-a=fwgo>Upload</button><p class=mu>Simulated: a web page cannot flash real firmware, but the steps mirror the real process.</p>') }
function fwGo() { var S = ['Checking board...', 'Erasing...', 'Writing firmware...', 'Verifying...', 'Done. Firmware ready (simulated).'], i = 0, iv = setInterval(function () { if ($('fwb')) $('fwb').style.width = (i + 1) * 20 + '%'; if ($('fwm')) $('fwm').textContent = S[i]; i++; if (i >= S.length) clearInterval(iv) }, 600) }
Array.prototype.forEach.call(document.querySelectorAll('.stb [data-s]'), function (b) { b.onclick = function () { if (innerWidth > 820) document.documentElement.style.setProperty('--sw', (+b.getAttribute('data-s') + 60) + 'px') } });
$('sFull').onclick = function () { stage.classList.toggle('fs') };
document.addEventListener('keydown', function (e) { if (e.key === 'Escape') stage.classList.remove('fs') });
function bindN(id, fn) { $(id).oninput = function () { fn(parseFloat(this.value) || 0); upd() } }
bindN('px', function (v) { x = v }); bindN('py2', function (v) { y = v }); bindN('psz', function (v) { size = Math.max(10, v) }); bindN('pdr', function (v) { dir = v });
$('shw').onclick = function () { sp.style.visibility = 'visible'; this.className = 'chip on'; $('hid').className = 'chip' };
$('hid').onclick = function () { sp.style.visibility = 'hidden'; this.className = 'chip on'; $('shw').className = 'chip' };
var _u = upd; upd = function () { _u(); sp.style.transform += ' scale(' + size / 100 + ')';[['px', Math.round(x)], ['py2', Math.round(y)], ['psz', size], ['pdr', dir]].forEach(function (a) { if (document.activeElement !== $(a[0])) $(a[0]).value = a[1] }) };
var clip = null, zoom = 1, snapU = '', BK = [{ n: 'Backdrop1', c: '' }], bki = 0, BKC = ['#cfe8ff', '#d9f7d6', '#ffe9c7', '#f3d6ff', '#1f2a44'], BP = [];
function hex(c) { return [parseInt(c.substr(1, 2), 16), parseInt(c.substr(3, 2), 16), parseInt(c.substr(5, 2), 16)] }
function flood(sx, sy, col) {
  var W = 480, H = 360, im = cvx.getImageData(0, 0, W, H), d = im.data, x0 = Math.floor(sx), y0 = Math.floor(sy), i0 = (y0 * W + x0) * 4, t = [d[i0], d[i0 + 1], d[i0 + 2], d[i0 + 3]], f = hex(col), st = [[x0, y0]], seen = new Uint8Array(W * H);
  function m(i) { return Math.abs(d[i] - t[0]) + Math.abs(d[i + 1] - t[1]) + Math.abs(d[i + 2] - t[2]) + Math.abs(d[i + 3] - t[3]) < 60 }
  if (t[0] === f[0] && t[1] === f[1] && t[2] === f[2] && t[3] === 255) return;
  while (st.length) { var p = st.pop(), px = p[0], py = p[1]; if (px < 0 || py < 0 || px >= W || py >= H) continue; var k = py * W + px; if (seen[k]) continue; seen[k] = 1; var i = k * 4; if (!m(i)) continue; d[i] = f[0]; d[i + 1] = f[1]; d[i + 2] = f[2]; d[i + 3] = 255; st.push([px + 1, py], [px - 1, py], [px, py + 1], [px, py - 1]) }
  cvx.putImageData(im, 0, 0)
}
function cDraw(u) { var im = new Image(); im.onload = function () { cvx.globalCompositeOperation = 'source-over'; cvx.clearRect(0, 0, 480, 360); cvx.drawImage(im, 0, 0, 480, 360); COS[cosI].img = u; showCos(); listCos() }; im.src = u }
function shot() {
  var c = document.createElement('canvas'); c.width = 480; c.height = 360; var g = c.getContext('2d'); g.fillStyle = getComputedStyle(stage).backgroundColor || '#fff'; g.fillRect(0, 0, 480, 360); var v = $('cam'); if (camStream && v.readyState >= 2) { g.save(); g.translate(480, 0); g.scale(-1, 1); g.drawImage(v, 0, 0, 480, 360); g.restore() }
  g.save(); g.translate(240 + x, 180 - y); g.rotate((dir - 90) * Math.PI / 180); g.scale(size / 100, size / 100); var im = sp.querySelector('img'); if (im) g.drawImage(im, -32, -24, 64, 48); else { g.font = '44px serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(sp.textContent, 0, 0) } g.restore(); return c.toDataURL()
}
$('sShot').onclick = function () { snapU = shot(); dlg('Snapshot of the Stage', '<img class=snap id=snimg><p><button class=pb data-a=snc>Add as costume</button><button class=pb data-a=snd>Download</button></p><p class=mu>If the download is blocked, right-click or long-press the image to save it.</p>'); $('snimg').src = snapU };
function listBk() { var r = $('bkr'); r.innerHTML = ''; BK.forEach(function (b, i) { var s = document.createElement('button'); s.className = 'chip' + (i === bki ? ' on' : ''); s.textContent = b.n; s.onclick = function () { bki = i; stage.style.background = b.c; listBk() }; r.appendChild(s) }); var a = document.createElement('button'); a.className = 'chip'; a.textContent = '+ Add backdrop'; a.onclick = function () { var n = BK.length + 1; BK.push({ n: 'Backdrop' + n, c: BKC[(n - 2) % BKC.length] }); bki = BK.length - 1; stage.style.background = BK[bki].c; listBk() }; r.appendChild(a) }
SB('switch backdrop to Backdrop1', 'looks.switch_backdrop(1)', function () { bki = 0; stage.style.background = BK[0].c; listBk() });
listBk();
function eURL(e) { var c = document.createElement('canvas'); c.width = 480; c.height = 360; var g = c.getContext('2d'); g.font = '220px serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(e, 240, 190); return c.toDataURL() }
function listBp() { var r = $('bpr'); r.innerHTML = BP.length ? '' : '<span class=mu>Empty. Save scripts or the current costume here.</span>'; BP.forEach(function (b) { var s = document.createElement('button'); s.className = 'chip'; s.textContent = b.n; s.title = 'Click to add'; s.onclick = function () { if (b.k === 's') JSON.parse(b.d).forEach(function (q) { add(q.t, q.c) }); else { COS.push({ n: b.n, e: '', img: b.d }); cosI = COS.length - 1; showCos(); if (!$('cs').hidden && $('cl')) listCos() } }; r.appendChild(s) }) }
$('bpS').onclick = function () { if (stack.children.length) { BP.push({ k: 's', n: 'Scripts ' + (BP.length + 1), d: snap() }); listBp() } };
$('bpC').onclick = function () { var c = COS[cosI]; BP.push({ k: 'c', n: c.n, d: c.img || eURL(c.e) }); listBp() };
listBp();
var sDel = [], sRe = [];
function inCos() { return !$('cs').hidden && !!$('cv') }
function inSnd() { return !$('cs').hidden && !$('cv') }
function cUndo() { if (cH.length > 1) { cR.push(cH.pop()); cDraw(cH[cH.length - 1]) } else aiMsg('nothing to undo') }
function cRedo() { if (cR.length) { var u = cR.pop(); cH.push(u); cDraw(u) } else aiMsg('nothing to redo') }
function sUndo() { var e = sDel.pop(); if (!e) return aiMsg('nothing to undo (Sounds: undo brings back deleted sounds)'); SND.splice(e[0], 0, e[1]); sRe.push(e); showSounds() }
function sRedo() { var e = sRe.pop(); if (!e) return aiMsg('nothing to redo'); SND.splice(e[0], 1); sDel.push(e); showSounds() }
stack.addEventListener('change', function () { hint() });
document.addEventListener('keydown', function (e) { if (!(e.ctrlKey || e.metaKey)) return; var tg = e.target.tagName || ''; if (tg === 'INPUT' || tg === 'TEXTAREA') return; var k = e.key.toLowerCase(); if (k === 'z' && !e.shiftKey) { e.preventDefault(); doUndo() } else if (k === 'y' || (k === 'z' && e.shiftKey)) { e.preventDefault(); doRedo() } });
var LIB = [['Cat', '🐱', 'Animals'], ['Dog', '🐶', 'Animals'], ['Bear', '🐻', 'Animals'], ['Panda', '🐼', 'Animals'], ['Fox', '🦊', 'Animals'], ['Lion', '🦁', 'Animals'], ['Frog', '🐸', 'Animals'], ['Penguin', '🐧', 'Animals'], ['Dragon', '🐉', 'Fantasy'], ['Unicorn', '🦄', 'Fantasy'], ['Wizard', '🧙', 'Fantasy'], ['Ghost', '👻', 'Fantasy'], ['Robot', '🤖', 'People'], ['Alien', '👽', 'People'], ['Astronaut', '🧑‍🚀', 'People'], ['Girl', '👧', 'People'], ['Boy', '👦', 'People'], ['Apple', '🍎', 'Food'], ['Pizza', '🍕', 'Food'], ['Cake', '🎂', 'Food'], ['Car', '🚗', 'Transportation'], ['Rocket', '🚀', 'Transportation'], ['Plane', '✈️', 'Transportation'], ['Boat', '⛵', 'Transportation'], ['Ball', '⚽', 'Things'], ['Star', '⭐', 'Things'], ['Heart', '❤️', 'Things'], ['Tree', '🌳', 'Things']];
var BL = [['Blue Sky', 'linear-gradient(#8ec9ff,#e6f4ff)', 'Outdoors'], ['Sunset', 'linear-gradient(#ff9a5a,#6a4c93)', 'Outdoors'], ['Grass', 'linear-gradient(#cfeaff 55%,#7bd36b 55%)', 'Outdoors'], ['Beach', 'linear-gradient(#bfe8ff 50%,#ffe6a8 50%)', 'Outdoors'], ['Night Sky', 'radial-gradient(#243b6b,#0a1024)', 'Space'], ['Galaxy', 'radial-gradient(circle at 30% 30%,#7b3fe4,#0b0b2a)', 'Space'], ['Moon', 'linear-gradient(#0b0b2a,#3b3b6b)', 'Space'], ['Classroom', 'linear-gradient(#f4e3c1 70%,#c9a26a 70%)', 'Indoors'], ['Bedroom', 'linear-gradient(#e8d9ff 70%,#b79ae6 70%)', 'Indoors'], ['Stripes', 'repeating-linear-gradient(90deg,#fff,#fff 20px,#d9e6ff 20px,#d9e6ff 40px)', 'Patterns'], ['Grid', 'linear-gradient(#cfd8ee 1px,transparent 1px) 0 0/30px 30px,linear-gradient(90deg,#cfd8ee 1px,transparent 1px) 0 0/30px 30px,#fff', 'Patterns'], ['Sports Field', 'repeating-linear-gradient(90deg,#4caf50,#4caf50 40px,#43a047 40px,#43a047 80px)', 'Sports'], ['Court', 'linear-gradient(#e8a25b,#c9823a)', 'Sports'], ['Underwater', 'linear-gradient(#8de3ff,#0a6fb0)', 'Nature'], ['Forest', 'linear-gradient(#c8f0c0,#3b8f4a)', 'Nature'], ['Desert', 'linear-gradient(#ffe2a8,#e0a95b)', 'Nature']];
var spi = 0, SP = [{ n: 'Sprite1', x: 0, y: 0, dir: 90, size: 100, COS: COS, cosI: 0, blocks: '[]', el: sp }], lk = 's', lcat = 'All', fuK = 's';
function loadSprite(i) { var o = SP[i]; spi = i; x = o.x; y = o.y; dir = o.dir; size = o.size; COS = o.COS; cosI = o.cosI; sp = o.el; setStack(JSON.parse(o.blocks)); undo = []; redo = []; $('spn').value = o.n; showCos(); upd(); listSp(); if (!$('cs').hidden && $('cv')) showCostumes() }
function selSprite(i) { var o = SP[spi]; o.x = x; o.y = y; o.dir = dir; o.size = size; o.COS = COS; o.cosI = cosI; o.blocks = snap(); loadSprite(i) }
function delSprite(i) { if (SP.length < 2) return; SP[i].el.remove(); SP.splice(i, 1); if (i === spi) loadSprite(0); else { if (i < spi) spi--; listSp() } }
function listSp() { var r = $('sprl'); r.innerHTML = ''; SP.forEach(function (o, i) { var ci = i === spi ? cosI : o.cosI, c = o.COS[ci], b = document.createElement('button'); b.className = 'chip' + (i === spi ? ' on' : ''); b.textContent = (c.e || '🖼') + ' ' + o.n; b.onclick = function () { if (i !== spi) selSprite(i) }; if (SP.length > 1 && i === spi) { var d = document.createElement('span'); d.textContent = ' ✕'; d.title = 'Delete sprite'; d.onclick = function (e) { e.stopPropagation(); delSprite(i) }; b.appendChild(d) } r.appendChild(b) }) }
function addSprite(n, e, img) { var el = document.createElement('div'); el.className = 'sprite'; stage.appendChild(el); var nm = n, k = 2; while (SP.some(function (o) { return o.n === nm })) nm = n + (k++); SP.push({ n: nm, x: 0, y: 0, dir: 90, size: 100, COS: [{ n: n, e: e, img: img }], cosI: 0, blocks: '[]', el: el }); selSprite(SP.length - 1) }
function addBackdrop(n, c) { BK.push({ n: n, c: c }); bki = BK.length - 1; stage.style.background = c; listBk() }
function listBk() { var r = $('bkr'); r.innerHTML = ''; BK.forEach(function (b, i) { var s = document.createElement('button'); s.className = 'chip' + (i === bki ? ' on' : ''); s.textContent = b.n; s.onclick = function () { bki = i; stage.style.background = b.c; listBk() }; r.appendChild(s) }) }
function blank() { var c = document.createElement('canvas'); c.width = 480; c.height = 360; return c.toDataURL() }
function renderLib() { var D = lk === 's' ? LIB : BL, q = $('lq').value.toLowerCase(), cs = ['All']; D.forEach(function (d) { if (cs.indexOf(d[2]) < 0) cs.push(d[2]) }); var c = $('lc'); c.innerHTML = ''; cs.forEach(function (n) { var b = document.createElement('button'); b.className = 'chip' + (n === lcat ? ' on' : ''); b.textContent = n; b.onclick = function () { lcat = n; renderLib() }; c.appendChild(b) }); var g = $('lg'); g.innerHTML = ''; D.forEach(function (d) { if ((lcat !== 'All' && d[2] !== lcat) || d[0].toLowerCase().indexOf(q) < 0) return; var b = document.createElement('button'); b.className = 'bc'; var s = document.createElement('span'); if (lk === 's') s.textContent = d[1]; else { s.className = 'sw'; s.style.background = d[1] } b.appendChild(s); b.appendChild(document.createTextNode(d[0])); b.onclick = function () { if (lk === 's') addSprite(d[0], d[1]); else addBackdrop(d[0], d[1]); closeDlg() }; g.appendChild(b) }) }
function libDlg(k) { lk = k; lcat = 'All'; dlg(k === 's' ? 'Choose a Sprite' : 'Choose a Backdrop', '<input id=lq type=text placeholder=Search><div class=row id=lc></div><div class=bg id=lg></div>'); $('lq').oninput = renderLib; renderLib() }
function bpDlg() { dlg('Choose from Backpack', '<div class=bg id=bpg></div>'); var g = $('bpg'), L = BP.filter(function (b) { return b.k === 'c' }); if (!L.length) { g.outerHTML = '<p class=mu>No costumes in the Backpack yet. Use + Costume in the Backpack section.</p>'; return } L.forEach(function (b) { var t = document.createElement('button'); t.className = 'bc'; var im = new Image(); im.src = b.d; im.style.cssText = 'width:64px;height:48px'; t.appendChild(im); t.appendChild(document.createTextNode(b.n)); t.onclick = function () { addSprite(b.n, '', b.d); closeDlg() }; g.appendChild(t) }) }
var fu = document.createElement('input'); fu.type = 'file'; fu.accept = 'image/*'; fu.onchange = function () { var f = fu.files[0]; if (!f) return; var r = new FileReader(); r.onload = function () { var nm = f.name.replace(/\.[^.]+$/, ''); if (fuK === 's') addSprite(nm, '', r.result); else addBackdrop(nm, 'url(' + r.result + ') center/cover') }; r.readAsDataURL(f); fu.value = '' };
function rnd(a) { return a[Math.floor(Math.random() * a.length)] }
function mkFab(id, items) { var w = $(id), m = document.createElement('div'); m.className = 'fabm'; items.forEach(function (it) { var b = document.createElement('button'); b.textContent = it[0]; b.setAttribute('data-l', it[1]); b.setAttribute('aria-label', it[1]); b.onclick = function () { if (document.activeElement) document.activeElement.blur(); it[2]() }; m.appendChild(b) }); w.insertBefore(m, w.firstChild) }
mkFab('fwS', [['⬆', 'Upload Sprite', function () { fuK = 's'; fu.click() }], ['✨', 'Surprise', function () { var d = rnd(LIB); addSprite(d[0], d[1]) }], ['🖌', 'Paint', function () { addSprite('Sprite', '', blank()); tab('tC') }], ['🎒', 'Choose from Backpack', bpDlg], ['🔍', 'Choose a Sprite', function () { libDlg('s') }]]);
mkFab('fwB', [['⬆', 'Upload Backdrop', function () { fuK = 'b'; fu.click() }], ['✨', 'Surprise', function () { var d = rnd(BL); addBackdrop(d[0], d[1]) }], ['🖌', 'Paint', function () { dlg('Paint a Backdrop', '<p>Pick a colour for the backdrop:</p><input type=color id=bkc value=#cfe8ff><button class=pb data-a=bkc>Use colour</button>') }], ['🔍', 'Choose a Backdrop', function () { libDlg('b') }]]);
$('spn').oninput = function () { SP[spi].n = this.value; listSp() };
listBk(); listSp();
var chosen = false, z = 1;
var ARD = ['set digital pin 13 to HIGH', 'set digital pin 13 to LOW', 'read digital pin 2', 'set PWM pin 9 to 128', 'read analog pin 0', 'set servo pin 9 to 90', 'play tone on pin 8 for 1 seconds', 'if digital pin 2 is HIGH then', 'end'], ESP = ['connect to Wi-Fi', 'set GPIO 2 to HIGH', 'set GPIO 2 to LOW', 'read touch pin 4', 'read analog pin 34', 'set servo pin 18 to 90', 'send data to cloud', 'if Wi-Fi connected then', 'end'], MB = ['show icon happy', 'show text Hello', 'clear display', 'read light level', 'read temperature', 'if button A pressed then', 'if button B pressed then', 'end'], QK = ['show emotion happy', 'move forward at speed 50', 'move backward at speed 50', 'stop robot', 'rotate robot left 90 degrees', 'read distance sensor', 'if obstacle detected then', 'end'], WZ = ['drive forward at speed 50', 'drive backward at speed 50', 'stop robot', 'rotate robot right 90 degrees', 'read line sensor', 'if obstacle detected then', 'end'], EV = ['set digital pin 13 to HIGH', 'set digital pin 13 to LOW', 'set servo pin 9 to 90', 'read potentiometer', 'read analog pin 0', 'show text on display Hello', 'if button pressed then', 'end'], TW = ['show text on screen Hello', 'read battery level', 'vibrate for 1 seconds', 'set backlight to 100', 'if touch detected then', 'end'], LG = ['run motor A forward at speed 50', 'stop motor A', 'read color sensor', 'read distance sensor', 'play sound beep', 'if touch sensor pressed then', 'end'], TEC = ['set LED on', 'set LED off', 'read light level', 'if button pressed then', 'end'];
var BG = { 'Arduino Uno': ARD, 'Arduino Mega': ARD, 'Arduino Nano': ARD, 'ESP32': ESP, 'micro:bit': MB, 'Quarky': QK, 'Wizbot': WZ, 'evive': EV, 'T-Watch': TW, 'LEGO EV3': LG, 'LEGO BOOST': LG, 'TECbits': TEC };
function BE(t) {
  if (t === 'end' || findX(t)) return; var b = t.replace(/-?\d+/g, '').replace(/[^a-zA-Z ]/g, '').trim().toLowerCase().replace(/ +/g, '_'), hasN = /\d/.test(t), isIf = /^if /.test(t);
  X.push({
    c: '', t: t, k: K(t), p: isIf ? 'if board.' + b.replace(/^if_/, '').replace(/_then$/, '') + '():' : 'board.' + b + (hasN ? '(#)' : '()'),
    r: isIf ? 0 : function (t2, n) { var u = t2.toUpperCase(); if (/^READ/.test(u)) { say(String(/TEMP/.test(u) ? HW.t : /DIST|OBSTACLE|LINE/.test(u) ? HW.d : /LIGHT|ANALOG|POTENT|BATTERY|COLOR/.test(u) ? Math.round(HW.l * 10.23) : HW.btn ? 1 : 0)); return } hsend(u.replace(/ /g, '_')); if (/PIN 13|LED|MATRIX|EMOTION|ICON|SCREEN|DISPLAY/.test(u)) HW.led = /LOW|OFF|CLEAR/.test(u) ? 0 : 1; if (/FORWARD/.test(u)) HW.mot = n || 50; if (/BACKWARD/.test(u)) HW.mot = -(n || 50); if (/STOP/.test(u)) HW.mot = 0; if (/SERVO/.test(u)) HW.srv = Math.max(0, Math.min(180, n)); hwUI(); hwLog(board + ': ' + t2) },
    q: isIf ? function (t2) { return /OBSTACLE|DISTANCE|LINE|SENSOR/i.test(t2) ? HW.d < 20 : /Wi-Fi/.test(t2) ? true : /DARK/i.test(t2) ? HW.l < 40 : !!HW.btn } : 0
  })
}
Object.keys(BG).forEach(function (k) { BG[k].forEach(BE) });
function connStatus() { return wr ? 'Connected via USB' : bleChar ? 'Connected via Bluetooth' : 'Not connected (virtual board)' }
function mkBlk(t, v) { var b = document.createElement('button'); b.className = 'blk'; b.style.background = col(v); b.textContent = t; b.draggable = true; b.ondragstart = function (e) { drag = { t: t, c: v, el: null }; e.dataTransfer.setData('text/plain', t); e.dataTransfer.effectAllowed = 'copyMove' }; b.onclick = function () { add(t, v) }; return b }
function pill() { Array.prototype.forEach.call(pal.querySelectorAll('.blk'), function (b) { b.innerHTML = b.textContent.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/(-?\d+)/g, '<span class=pill>$1</span>') }) }
var _s2 = show; show = function (n) { _s2(n); if (chosen && n === board && C[n]) { var d = document.createElement('div'); d.className = 'bnr'; d.innerHTML = '<b>Board:</b> ' + board + '<br><span id=bst>' + connStatus() + '</span><br><button>Connect</button>'; d.querySelector('button').onclick = conDlg; pal.insertBefore(d, pal.children[1]) } pill() };
function useBoard(n) { Array.prototype.forEach.call(cats.querySelectorAll('[data-b]'), function (e) { delete C[e.dataset.n]; e.remove() }); C[n] = ['--ext', BG[n]]; var b = document.createElement('button'); b.dataset.n = n; b.setAttribute('data-b', 1); b.innerHTML = '<span class=dot style=background:var(--ext)></span>' + n; b.onclick = function () { show(n) }; cats.insertBefore(b, $('addExt')); show(n); b.scrollIntoView() }
var _sb = setBoard; setBoard = function (i) { _sb(i); chosen = true; useBoard(BD[i][0]) };
var sb = document.createElement('button'); sb.dataset.n = 'Search'; sb.innerHTML = '<span class=dot style="background:#e8ebf2;line-height:30px">🔍</span>Search'; sb.onclick = function () { pal.innerHTML = '<h3>Search</h3><input id=sq placeholder="Search blocks"><div id=sr2></div>'; function r() { var q = $('sq').value.toLowerCase(), o = $('sr2'); o.innerHTML = ''; if (!q) return; Object.keys(C).forEach(function (k) { C[k][1].forEach(function (t) { if (t.toLowerCase().indexOf(q) > -1) o.appendChild(mkBlk(t, C[k][0])) }) }); pill() } $('sq').oninput = r; $('sq').focus() }; cats.insertBefore(sb, cats.firstChild);
var ae = document.createElement('button'); ae.id = 'addExt'; ae.title = 'Add Extension'; ae.textContent = '➕'; cats.appendChild(ae);
ae.onclick = function () { dlg('Choose an Extension', '<div class=bg id=eg></div>'); Array.prototype.forEach.call(document.querySelectorAll('#exts button'), function (c) { var b = document.createElement('button'); b.className = 'bc'; b.innerHTML = '<span>🧩</span>' + c.textContent.replace('+ ', ''); b.onclick = function () { c.click(); closeDlg() }; $('eg').appendChild(b) }) };
var zc = document.createElement('div'); zc.className = 'zc';[['+', .15], ['-', -.15], ['=', 0]].forEach(function (a) { var b = document.createElement('button'); b.textContent = a[0]; b.onclick = function () { z = a[1] ? Math.max(.5, Math.min(2, z + a[1])) : 1; stack.style.transform = 'scale(' + z + ')'; stack.style.transformOrigin = '0 0' }; zc.appendChild(b) }); document.body.appendChild(zc);
wsEl.insertAdjacentHTML('afterbegin', '<div class=wm>🐱</div>');
var bpb = document.createElement('div'); bpb.className = 'bpbar'; bpb.textContent = 'Backpack'; bpb.onclick = function () { dlg('Backpack', '<div class=row id=bpa></div>'); if (!BP.length) $('bpa').innerHTML = '<span class=mu>Empty. Use + Scripts or + Costume in the sprite panel.</span>'; BP.forEach(function (b) { var s = document.createElement('button'); s.className = 'chip'; s.textContent = b.n; s.onclick = function () { if (b.k === 's') JSON.parse(b.d).forEach(function (q) { add(q.t, q.c) }); else addSprite(b.n, '', b.d); closeDlg() }; $('bpa').appendChild(s) }) }; document.querySelector('main').after(bpb);
function listSp() { var r = $('sprl'); r.innerHTML = ''; SP.forEach(function (o, i) { var c = o.COS[i === spi ? cosI : o.cosI], b = document.createElement('button'); b.className = 'scard' + (i === spi ? ' on' : ''); var t; if (c.img) { t = new Image(); t.src = c.img } else { t = document.createElement('i'); t.textContent = c.e } b.appendChild(t); var n = document.createElement('b'); n.textContent = o.n; b.appendChild(n); b.onclick = function () { if (i !== spi) selSprite(i) }; if (SP.length > 1 && i === spi) { var d = document.createElement('span'); d.className = 'x'; d.textContent = '✕'; d.title = 'Delete sprite'; d.onclick = function (e) { e.stopPropagation(); delSprite(i) }; b.appendChild(d) } r.appendChild(b) }) }
var tn = { tB: '🧩 Blocks', tP: '🐍 Python', tC: '🖌 Costumes', tS: '🔊 Sounds' }; Object.keys(tn).forEach(function (k) { $(k).textContent = tn[k] });
$('go').textContent = '⚑'; $('go').title = 'Green flag'; $('stop').textContent = ''; $('stop').title = 'Stop'; $('pymode').style.display = 'none';
document.querySelector('.tabs').appendChild(document.querySelector('.run'));
$('cnBtn').insertAdjacentHTML('afterend', '<span class=cst id=cst></span>');
document.querySelector('header').insertAdjacentHTML('beforeend', '<div class=hr><button class=hi id=hTr title=Achievements>🏆</button><button class=hi id=hSet title=Settings>⚙</button><button class=hi id=hLang title=Language>🌐 ▾</button><button class=sign id=hSign>🐻 Sign In</button></div>');
setInterval(function () { $('cst').textContent = '🔌 ' + (chosen ? board : 'No board selected') + ' · ' + (wr ? 'USB connected' : bleChar ? 'Bluetooth connected' : 'not connected'); var b = $('bst'); if (b) b.textContent = connStatus() }, 1000);
$('hTr').onclick = function () { var B = [['Placed your first block', stack.children.length > 0], ['Added a second sprite', SP.length > 1], ['Trained an AI model', KN.length > 1], ['Picked a board', chosen], ['Connected a real board', !!(wr || bleChar)]]; dlg('Achievements', '<ul>' + B.map(function (b) { return '<li>' + (b[1] ? '✅ ' : '🔒 ') + b[0] + '</li>' }).join('') + '</ul>') };
$('hSet').onclick = function () { dlg('Settings', '<p>Theme</p><button class=pb data-q=thL>Light</button><button class=pb data-q=thD>Dark</button><button class=pb data-q=thA>Auto</button>') };
$('hLang').onclick = function () { dlg('Language', '<p class=mu>Interface translation is not available yet. Blocks stay in English.</p>' + ['English', 'Hindi', 'Urdu', 'Spanish', 'French', 'Chinese'].map(function (l) { return '<button class=pb data-q=lang' + l + '>' + l + '</button>' }).join('')) };
$('hSign').onclick = function () { dlg('Sign In', '<p>Enter a name for this session.</p><input id=sn type=text placeholder=Name><button class=pb data-q=sign>Continue</button><p class=mu>Local only. There are no accounts in this build.</p>') };
$('db').addEventListener('click', function (e) { var b = e.target.closest('[data-q]'); if (!b) return; var q = b.getAttribute('data-q'), R = document.documentElement; if (q === 'thL') R.setAttribute('data-theme', 'light'); else if (q === 'thD') R.setAttribute('data-theme', 'dark'); else if (q === 'thA') R.removeAttribute('data-theme'); else if (q === 'sign') { var n = $('sn').value.trim(); if (n) $('hSign').textContent = '🐻 ' + n; closeDlg() } else if (q.indexOf('lang') === 0) { $('hLang').textContent = '🌐 ' + q.slice(4, 6) + ' ▾'; closeDlg() } });
function landing() { var l = $('land'); if (!l) { l = document.createElement('div'); l.id = 'land'; document.body.appendChild(l) } l.hidden = false; l.innerHTML = '<div class=lh>Block Studio</div><div class=lm><h1>Learn coding, AI and robotics</h1><p>Block coding, Python, machine learning and hardware, all in one place.</p><div class=lb><button class=lp data-l=new>Create New Project</button><button data-l=open>Open Project</button><button data-l=ex>Examples</button><button data-l=tut>Tutorials</button></div><div class=lc><button data-l=blk><i>🧩</i><b>Block coding</b><span>Drag and drop blocks to build programs.</span></button><button data-l=py><i>🐍</i><b>Python coding</b><span>See your blocks as code.</span></button><button data-l=ai><i>🤖</i><b>AI and ML</b><span>Train models with your camera.</span></button><button data-l=rob><i>🔌</i><b>Robotics</b><span>Pick a board and program it.</span></button></div></div>' }
document.addEventListener('click', function (e) { var b = e.target.closest && e.target.closest('[data-l]'); if (!b) return; var k = b.getAttribute('data-l'); $('land').hidden = true; if (k === 'new') doNew(); else if (k === 'open') fi.click(); else if (k === 'ex') act('exs'); else if (k === 'tut') act('tut'); else if (k === 'blk') tab('tB'); else if (k === 'py') tab('tP'); else if (k === 'ai') act('ml'); else if (k === 'rob') boardDlg() });
function setMode(j) { Array.prototype.forEach.call(cats.children, function (b) { var n = b.dataset && b.dataset.n; b.hidden = j && !(n && ['Motion', 'Looks', 'Sound', 'Events', 'Control'].indexOf(n) > -1) }); document.body.classList.toggle('jr', j) }
function landing() {
  var l = $('land'); if (!l) { l = document.createElement('div'); l.id = 'land'; document.body.appendChild(l) } l.hidden = false;
  l.innerHTML = '<div class=lt><div class=lh>Block Studio</div><div class=hr><button class=hi data-w=tr title=Achievements>🏆</button><button class=hi data-w=set title=Settings>⚙</button><button class=hi data-w=lang>🌐 ▾</button><button class=sign data-w=sign>' + $('hSign').textContent + '</button></div></div>' +
    '<div class=wc><h2>What would you like to do?</h2>' +
    '<div class=ws><div class=wg4><h4 class=hs>Block Coding</h4><h4 class=hs>Python Coding</h4>' +
    '<button class=wd data-w=jr><em>Ages 4+</em><i>🏁</i><b>Junior Blocks</b><span>Code by stacking puzzle-shaped blocks</span></button>' +
    '<button class=wd data-w=bl><em>Ages 7+</em><i>🧱</i><b>Blocks</b><span>Code with playful puzzle-shaped blocks</span></button>' +
    '<button class=wd data-w=pe><em>Ages 12+</em><i>🐍</i><b>Py Editor</b><span>Code with text based coding in Python.</span></button>' +
    '<button class=wd data-w=pn><em>Ages 12+</em><i>📓</i><b>Py Notebook</b><span>Code with text based coding in Notebook interface.</span></button></div></div>' +
    '<div class=ws><div class=wg2><button class=wd data-w=ml><em>Ages 12+</em><i>🧠</i><b>Machine Learning Environment</b><span>Train ML models for image, object, face, pose (hand and body), sound, NLP, and numbers</span></button>' +
    '<button class=wd data-w=xr><em>Ages 12+</em><i>📦</i><b>3D and XR Studio</b><span>Create interactive 3D projects in AR/VR with animations, physics, trackers, filters, and much more</span></button></div></div>' +
    '<div class=ws><h4>More Tools</h4><div class=wg2 style=grid-template-columns:1fr><button class=wd data-w=pt><div class=wp><i>🎨</i><div><b>Paint</b><span>Draw, color, and create designs</span></div></div></button></div></div></div>'
}
document.addEventListener('click', function (e) {
  var b = e.target.closest && e.target.closest('[data-w]'); if (!b) return; var k = b.getAttribute('data-w'), m = { tr: 'hTr', set: 'hSet', lang: 'hLang', sign: 'hSign' }; if (m[k]) { $(m[k]).click(); return }
  if (k === 'pn' || k === 'xr') { dlg(k === 'pn' ? 'Py Notebook' : '3D and XR Studio', '<p>This tool is not built in Block Studio yet. Block coding, the Python view, the ML environment and Paint are available.</p>'); return }
  $('land').hidden = true; setMode(k === 'jr'); if (k === 'pe') tab('tP'); else if (k === 'pt') tab('tC'); else { tab('tB'); if (k === 'ml') act('ml'); else show('Motion') }
});
stage.onmousemove = null; stage.onmouseleave = null; setFaces([]);
var dg = null;
stage.addEventListener('pointerdown', function (e) { var t = e.target.closest('.sprite'); if (!t) return; var i = SP.findIndex(function (o) { return o.el === t }); if (i < 0) return; if (i !== spi) selSprite(i); var r = stage.getBoundingClientRect(); dg = { dx: ((e.clientX - r.left) / r.width - .5) * 480 - x, dy: (.5 - (e.clientY - r.top) / r.height) * 360 - y }; sp.style.transition = 'none'; try { stage.setPointerCapture(e.pointerId) } catch (_) { } e.preventDefault() });
stage.addEventListener('pointermove', function (e) { if (!dg) return; var r = stage.getBoundingClientRect(); x = Math.max(-240, Math.min(240, ((e.clientX - r.left) / r.width - .5) * 480 - dg.dx)); y = Math.max(-180, Math.min(180, (.5 - (e.clientY - r.top) / r.height) * 360 - dg.dy)); upd() });
function endDrag() { if (dg) { dg = null; sp.style.transition = '' } }
stage.addEventListener('pointerup', endDrag); stage.addEventListener('pointercancel', endDrag);
var TR = {}, lastLabel = '', MK = 'image', aCtx = null, MLM = { image: { c: [{ n: 'Class 1', s: [] }, { n: 'Class 2', s: [] }] }, text: { c: [{ n: 'Class 1', s: [] }, { n: 'Class 2', s: [] }] }, audio: { c: [{ n: 'Class 1', s: [] }, { n: 'Class 2', s: [] }] }, num: { mode: 'classify', txt: '' } };
var MT = [['image', 'Image Classifier', '🖼'], ['obj', 'Object Detection', '📦'], ['pose', 'Pose Classifier', '🧍'], ['hand', 'Hand Pose Classifier', '🖐'], ['audio', 'Audio Classifier', '🎙'], ['text', 'Text Classifier', '💬'], ['num', 'Number Classification and Regression', '🔢']];
function words(s) { return s.toLowerCase().split(/\W+/).filter(Boolean) }
function fImg(el) { x64.drawImage(el, 0, 0, 64, 48); var d = x64.getImageData(0, 0, 64, 48).data, f = []; for (var by = 0; by < 12; by++)for (var bx = 0; bx < 16; bx++) { var s = [0, 0, 0]; for (var j = 0; j < 4; j++)for (var i = 0; i < 4; i++) { var p = ((by * 4 + j) * 64 + bx * 4 + i) * 4; s[0] += d[p]; s[1] += d[p + 1]; s[2] += d[p + 2] } f.push(s[0] / 4080, s[1] / 4080, s[2] / 4080) } return f }
function knn(f, S, skip) { var r = []; S.forEach(function (s, i) { if (i === skip) return; var d = 0; for (var j = 0; j < f.length; j++) { var e = f[j] - s.f[j]; d += e * e } r.push([d, s.l]) }); r.sort(function (a, b) { return a[0] - b[0] }); var k = r.slice(0, 3), v = {}; k.forEach(function (e) { v[e[1]] = (v[e[1]] || 0) + 1 }); return Object.keys(v).map(function (l) { return [l, v[l] / k.length] }).sort(function (a, b) { return b[1] - a[1] }) }
function nbTrain(C) { var V = {}, cl = [], N = 0; C.forEach(function (c) { var cnt = {}, t = 0; c.s.forEach(function (s) { words(s).forEach(function (w) { cnt[w] = (cnt[w] || 0) + 1; t++; V[w] = 1 }) }); N += c.s.length; cl.push({ n: c.n, cnt: cnt, t: t, m: c.s.length }) }); return { cl: cl, V: Object.keys(V).length || 1, N: N } }
function nbPred(M, s) { var w = words(s), L = M.cl.map(function (c) { var lp = Math.log(c.m / M.N); w.forEach(function (x) { lp += Math.log(((c.cnt[x] || 0) + 1) / (c.t + M.V)) }); return lp }), mx = Math.max.apply(null, L), E = L.map(function (v) { return Math.exp(v - mx) }), Z = E.reduce(function (a, b) { return a + b }, 0); return M.cl.map(function (c, i) { return [c.n, E[i] / Z] }).sort(function (a, b) { return b[1] - a[1] }) }
function parseNum(t, reg) { var R = []; t.split('\n').forEach(function (l) { var p = l.split(',').map(function (s) { return s.trim() }).filter(function (s) { return s !== '' }); if (p.length < 2) return; var y = p.pop(), f = p.map(parseFloat); if (f.some(isNaN)) return; R.push({ f: f, y: reg ? parseFloat(y) : y }) }); return R.filter(function (r) { return !reg || !isNaN(r.y) }) }
function stats(R) { var d = R[0].f.length, n = R.length, mu = [], sd = []; for (var j = 0; j < d; j++) { var m = 0; R.forEach(function (r) { m += r.f[j] }); m /= n; var v = 0; R.forEach(function (r) { v += Math.pow(r.f[j] - m, 2) }); mu.push(m); sd.push(Math.sqrt(v / n) || 1) } return { mu: mu, sd: sd } }
function fitLin(R) { var n = R.length, st = stats(R), d = st.mu.length, w = new Array(d + 1).fill(0); for (var it = 0; it < 4000; it++) { var g = new Array(d + 1).fill(0); R.forEach(function (r) { var p = w[d]; for (var j = 0; j < d; j++)p += w[j] * (r.f[j] - st.mu[j]) / st.sd[j]; var e = p - r.y; for (var j = 0; j < d; j++)g[j] += e * (r.f[j] - st.mu[j]) / st.sd[j]; g[d] += e }); for (var j = 0; j <= d; j++)w[j] -= .05 * g[j] / n } return { w: w, mu: st.mu, sd: st.sd } }
function linPred(M, f) { var d = M.mu.length, p = M.w[d]; for (var j = 0; j < d; j++)p += M.w[j] * (f[j] - M.mu[j]) / M.sd[j]; return p }
function recAudio() { return navigator.mediaDevices.getUserMedia({ audio: true }).then(function (s) { aCtx = aCtx || new (window.AudioContext || window.webkitAudioContext)(); var an = aCtx.createAnalyser(); an.fftSize = 512; aCtx.createMediaStreamSource(s).connect(an); var buf = new Uint8Array(an.frequencyBinCount), acc = new Array(16).fill(0), n = 0; return new Promise(function (res) { var iv = setInterval(function () { an.getByteFrequencyData(buf); for (var b = 0; b < 16; b++) { var t = 0; for (var k = 0; k < 16; k++)t += buf[b * 16 + k]; acc[b] += t / 16 / 255 } n++ }, 50); setTimeout(function () { clearInterval(iv); s.getTracks().forEach(function (t) { t.stop() }); res(acc.map(function (v) { return v / n })) }, 1000) }) }) }
function setL(P) { lastLabel = P[0][0]; aiMsg('model says ' + lastLabel + ' (' + Math.round(P[0][1] * 100) + '%)') }
function showP(P) { setL(P); $('mout').innerHTML = '<h3>Result: ' + lastLabel + '</h3>' + P.map(function (p) { return '<div class=pr><span>' + p[0] + '</span><i style=width:' + Math.round(p[1] * 100) + '%></i>' + Math.round(p[1] * 100) + '%</div>' }).join('') }
function mlEnv() { var o = $('mle'); if (!o) { o = document.createElement('div'); o.id = 'mle'; document.body.appendChild(o); o.addEventListener('click', mlClick); o.addEventListener('input', function (e) { var t = e.target, m = t.dataset.m; if (m === 'ren') MLM[MK].c[+t.dataset.i].n = t.value; if (m === 'numtxt') MLM.num.txt = t.value }); o.addEventListener('change', function (e) { var t = e.target; if (t.dataset.m !== 'file') return; var i = +t.dataset.i, fs = [].slice.call(t.files), n = 0; fs.forEach(function (f) { var r = new FileReader(); r.onload = function () { var im = new Image(); im.onload = function () { MLM.image.c[i].s.push(fImg(im)); if (++n === fs.length) mlDraw() }; im.src = r.result }; r.readAsDataURL(f) }) }) } o.hidden = false; mlDraw() }
function mlDraw() {
  var k = MK, o = $('mle'), h = '<div class=mh><b>Machine Learning Environment</b><button data-m=close>Close</button></div><div class=mt>' + MT.map(function (t) { return '<button data-m=tab data-k=' + t[0] + (t[0] === k ? ' class=on' : '') + '>' + t[2] + ' ' + t[1] + '</button>' }).join('') + '</div><div class=mb>';
  if (k === 'obj' || k === 'pose' || k === 'hand') { var nm = MT.filter(function (t) { return t[0] === k })[0][1]; h += '<div class=mp><h3>' + nm + '</h3><p>This model type needs a pretrained neural network (TensorFlow.js: COCO-SSD for objects, MoveNet for body pose, Hand Pose for hands) whose files are downloaded from the internet. The hosted preview blocks those downloads, so it is not available here yet.</p><p>Planned flow: collect labelled camera examples, extract keypoints or boxes with the pretrained network, train a small classifier on top, then use it from blocks, the same way the models on the other tabs work.</p></div>' }
  else if (k === 'num') { h += '<div class=mp><h3>Data</h3><button data-m=mode data-v=classify' + (MLM.num.mode === 'classify' ? ' class=on' : '') + '>Classification</button><button data-m=mode data-v=reg' + (MLM.num.mode === 'reg' ? ' class=on' : '') + '>Regression</button><p class=mu>One row per line. Values separated by commas, the last value is the answer: a label for classification (for example 5,3,small) or a number for regression (for example 2,4,10).</p><textarea data-m=numtxt rows=10></textarea></div><div class=mp><h3>Train and test</h3><button class=mtr data-m=train>Train model</button><div id=mres></div><p>Test values (commas, no answer):</p><input id=mni type=text value=3,4><button data-m=pred>Predict</button><div id=mout></div><button data-m=use>Use in blocks</button></div>' }
  else {
    var tl = function (i) { return k === 'image' ? '<button data-m=snap data-i=' + i + '>📷 Camera sample</button><label class=upl>⬆ Upload<input type=file multiple accept=image/* data-m=file data-i=' + i + ' style=display:none></label>' : k === 'text' ? '<div class=mu>One example per line</div><textarea data-i=' + i + '></textarea><button data-m=addtxt data-i=' + i + '>Add examples</button>' : '<button data-m=rec data-i=' + i + '>🎙 Record 1 sec</button>' };
    h += '<div class=mp><h3>Classes</h3>' + MLM[k].c.map(function (c, i) { return '<div class=mc><div class=mch><input type=text data-m=ren data-i=' + i + '> <span>' + c.s.length + ' samples</span><button data-m=del data-i=' + i + '>✕</button></div>' + tl(i) + '</div>' }).join('') + '<button data-m=addc>+ Add class</button></div><div class=mp><h3>Train and test</h3>' + (k === 'image' ? '<button data-m=cam>Turn camera on</button><video id=mv autoplay muted playsinline></video>' : '') + '<button class=mtr data-m=train>Train model</button><div id=mres></div>' + (k === 'text' ? '<p>Type a sentence to test:</p><input id=mti type=text value=Hello>' : '') + '<button data-m=pred>' + (k === 'image' ? 'Predict from camera' : k === 'audio' ? '🎙 Record and predict' : 'Predict') + '</button><div id=mout></div><button data-m=use>Use in blocks</button></div>'
  }
  o.innerHTML = h + '</div>';
  Array.prototype.forEach.call(o.querySelectorAll('[data-m=ren]'), function (i) { i.value = MLM[k].c[+i.dataset.i].n }); var nt = o.querySelector('[data-m=numtxt]'); if (nt) nt.value = MLM.num.txt; var mv = $('mv'); if (mv && camStream) mv.srcObject = camStream
}
function mlClick(e) {
  var b = e.target.closest('[data-m]'); if (!b) return; var m = b.dataset.m, i = +b.dataset.i, o = $('mle');
  if (m === 'close') o.hidden = true; else if (m === 'tab') { MK = b.dataset.k; mlDraw() }
  else if (m === 'addc') { MLM[MK].c.push({ n: 'Class ' + (MLM[MK].c.length + 1), s: [] }); mlDraw() }
  else if (m === 'del') { if (MLM[MK].c.length > 2) { MLM[MK].c.splice(i, 1); mlDraw() } }
  else if (m === 'cam') { camOn(); setTimeout(function () { if (MK === 'image' && !o.hidden) mlDraw() }, 1500) }
  else if (m === 'snap') { if (!camStream) { aiMsg('turn the camera on first'); return } MLM.image.c[i].s.push(fImg($('cam'))); mlDraw() }
  else if (m === 'addtxt') { var ta = o.querySelectorAll('textarea')[i]; ta.value.split('\n').forEach(function (l) { if (l.trim()) MLM.text.c[i].s.push(l.trim()) }); mlDraw() }
  else if (m === 'rec') { recAudio().then(function (f) { MLM.audio.c[i].s.push(f); mlDraw() }).catch(function () { aiMsg('microphone blocked or unavailable') }) }
  else if (m === 'mode') { MLM.num.mode = b.dataset.v; mlDraw() }
  else if (m === 'train') mlTrain(); else if (m === 'pred') mlPredict();
  else if (m === 'use') { o.hidden = true; exportBlocks(); show('AI Models') }
}
function mlTrain() {
  var k = MK, o = $('mres'), ok = 0, msg = '';
  if (k === 'image' || k === 'audio') { var S = []; MLM[k].c.forEach(function (c) { c.s.forEach(function (f) { S.push({ f: f, l: c.n }) }) }); var cn = {}; S.forEach(function (s) { cn[s.l] = 1 }); if (S.length < 2 || Object.keys(cn).length < 2) { o.textContent = 'Add samples to at least 2 classes first.'; return } TR[k] = { S: S }; S.forEach(function (s, i) { if (knn(s.f, S, i)[0][0] === s.l) ok++ }); msg = 'Trained on ' + S.length + ' samples. Leave-one-out accuracy: ' + Math.round(ok / S.length * 100) + '%.' }
  else if (k === 'text') { var C = MLM.text.c.filter(function (c) { return c.s.length }); if (C.length < 2) { o.textContent = 'Add examples to at least 2 classes first.'; return } TR.text = nbTrain(C); var n = 0; C.forEach(function (c) { c.s.forEach(function (s) { n++; if (nbPred(TR.text, s)[0][0] === c.n) ok++ }) }); msg = 'Trained on ' + n + ' examples. Training accuracy: ' + Math.round(ok / n * 100) + '%.' }
  else if (k === 'num') { var reg = MLM.num.mode === 'reg', R = parseNum(MLM.num.txt, reg); if (R.length < 3) { o.textContent = 'Add at least 3 valid rows first.'; return } if (reg) { var M = fitLin(R), se = 0, sm = 0, my = 0; R.forEach(function (r) { my += r.y }); my /= R.length; R.forEach(function (r) { se += Math.pow(linPred(M, r.f) - r.y, 2); sm += Math.pow(r.y - my, 2) }); TR.num = { reg: 1, M: M }; msg = 'Linear regression fitted on ' + R.length + ' rows. R squared: ' + (sm ? (1 - se / sm).toFixed(3) : 'n/a') + '.' } else { var st = stats(R), S2 = R.map(function (r) { return { f: r.f.map(function (v, j) { return (v - st.mu[j]) / st.sd[j] }), l: r.y } }); S2.forEach(function (s, i) { if (knn(s.f, S2, i)[0][0] === s.l) ok++ }); TR.num = { reg: 0, st: st, S: S2 }; msg = 'Trained on ' + R.length + ' rows. Leave-one-out accuracy: ' + Math.round(ok / R.length * 100) + '%.' } }
  o.textContent = msg + ' Press Use in blocks to add it to your project.'; exportBlocks()
}
function mlPredict() {
  var k = MK; if (!TR[k]) { $('mout').textContent = 'Train the model first.'; return }
  if (k === 'image') { if (!camStream) { $('mout').textContent = 'Turn the camera on first.'; return } showP(knn(fImg($('cam')), TR.image.S)) }
  else if (k === 'text') showP(nbPred(TR.text, $('mti').value));
  else if (k === 'audio') recAudio().then(function (f) { showP(knn(f, TR.audio.S)) }).catch(function () { $('mout').textContent = 'Microphone blocked or unavailable.' });
  else numPredict($('mni').value, function (P, v) { if (v !== null) { lastLabel = String(v); $('mout').innerHTML = '<h3>Predicted value: ' + v + '</h3>' } else showP(P) })
}
function numPredict(txt, cb) { var f = (txt.match(/-?\d+\.?\d*/g) || []).map(parseFloat), T = TR.num; if (!T || !f.length) return cb([['?', 1]], null); if (T.reg) { var v = Math.round(linPred(T.M, f) * 1000) / 1000; lastLabel = String(v); return cb(null, v) } cb(knn(f.map(function (x, j) { return (x - T.st.mu[j]) / T.st.sd[j] }), T.S), null) }
function reg(t, p, r, q) { if (!findX(t)) X.push({ c: '', t: t, k: K(t), p: p, r: r, q: q }) }
function exportBlocks() {
  var L = [], cl = []; function add2(n) { if (cl.indexOf(n) < 0) cl.push(n) }
  if (TR.image) { L.push('classify image with my model'); TR.image.S.forEach(function (s) { add2(s.l) }) }
  if (TR.text) { L.push('classify typed text with my model'); TR.text.cl.forEach(function (c) { add2(c.n) }) }
  if (TR.audio) { L.push('classify sound with my model'); TR.audio.S.forEach(function (s) { add2(s.l) }) }
  if (TR.num) { L.push('predict number from typed values'); if (!TR.num.reg) TR.num.S.forEach(function (s) { add2(s.l) }) }
  L.push('show model answer'); cl.forEach(function (n) { L.push('if model says ' + n + ' then') }); L.push('end'); C['AI Models'] = ['--ext', L];
  reg('classify image with my model', 'model.classify_image()', function () { if (!camStream) { aiMsg('turn the camera on first'); return } if (!TR.image) { aiMsg('train the image model first'); return } setL(knn(fImg($('cam')), TR.image.S)) });
  reg('classify typed text with my model', 'model.classify_text()', function () { if (!TR.text) { aiMsg('train the text model first'); return } setL(nbPred(TR.text, said.value)) });
  reg('classify sound with my model', 'model.classify_sound()', function () { if (!TR.audio) { aiMsg('train the audio model first'); return } return recAudio().then(function (f) { setL(knn(f, TR.audio.S)) }).catch(function () { aiMsg('microphone blocked or unavailable') }) });
  reg('predict number from typed values', 'model.predict_number()', function () { numPredict(said.value, function (P, v) { if (v !== null) aiMsg('predicted ' + v); else setL(P) }) });
  reg('show model answer', 'print(model.answer())', function () { say(lastLabel || '(no answer yet)') });
  reg('if model says Class 1 then', 'if model.answer() == "Class 1":', 0, function (t2) { return lastLabel === t2.replace(/^if model says /, '').replace(/ then$/, '') });
  cl.forEach(function (n) { reg('if model says ' + n + ' then', 'if model.answer() == ' + JSON.stringify(n) + ':', 0, function (t2) { return lastLabel === t2.replace(/^if model says /, '').replace(/ then$/, '') }) });
  if (!cats.querySelector('[data-ai]')) { var b = document.createElement('button'); b.dataset.n = 'AI Models'; b.setAttribute('data-ai', 1); b.innerHTML = '<span class=dot style=background:var(--ext)></span>AI Models'; b.onclick = function () { show('AI Models') }; cats.insertBefore(b, $('addExt')) }
}
var _act = act; act = function (a, el) { if (a === 'ml') { mlEnv(); return } return _act(a, el) };
document.querySelector('.logo').onclick = landing;
show('Motion'); landing();
showCos(); upd();
stack.oninput = function () { if (pyOn) render() };
document.getElementById('pymode').onclick = function () { pyOn = !pyOn; this.textContent = pyOn ? 'Blocks' : 'Python'; stack.hidden = pyOn; document.getElementById('py').hidden = !pyOn; hint() };
document.getElementById("go").onclick = go;
document.getElementById("stop").onclick = function () { stop(); camOff(); x = 0; y = 0; dir = 90; sp.style.visibility = "visible"; sp.textContent = "🐱"; upd() };
show("Motion"); upd();
