"""Browser-backed extension modules. Loaded only for enabled project extensions."""
import types as _types


async def _studio_bridge(action, *args):
    from js import studioBridge
    return json.loads(str(await studioBridge(action, json.dumps(args))))


def _studio_module(name, values):
    module = _types.ModuleType(name)
    module.__dict__.update(values)
    sys.modules[name] = module
    return module


class Stage:
    def next_backdrop(self): _emit('', 'stage_next')
    def switch_backdrop(self, name): _emit('', 'stage_backdrop', str(name))
    def set_color(self, color): _emit('', 'stage_color', str(color))
    def clear(self): _emit('', 'pen_clear')


_studio_module('sprite', {'Sprite': Sprite})
_studio_module('stage', {'Stage': Stage})
_studio_scope['Stage'] = Stage

if 'pen' in _studio_extension_ids:
    class Pen:
        def __init__(self):
            self.x, self.y, self.direction = 0.0, 0.0, 90.0
            self.color, self.width, self.is_down = '#652080', 2.0, False
        def down(self): self.is_down = True
        def up(self): self.is_down = False
        def set_color(self, color): self.color = str(color)
        def set_size(self, width): self.width = max(0.5, min(100, float(width)))
        def goto(self, x, y):
            x, y = float(x), float(y)
            if self.is_down: _emit('', 'pen_line', self.x, self.y, x, y, self.color, self.width)
            self.x, self.y = x, y
        def move(self, steps):
            angle = math.radians(self.direction - 90)
            self.goto(self.x + float(steps) * math.cos(angle), self.y - float(steps) * math.sin(angle))
        def turn(self, degrees): self.direction = (self.direction + float(degrees)) % 360
        def clear(self): _emit('', 'pen_clear')
    _studio_module('pen', {'Pen': Pen})

if 'music' in _studio_extension_ids:
    _tempo = 120.0
    def set_tempo(bpm):
        global _tempo
        _tempo = max(20.0, min(400.0, float(bpm)))
    async def play_note(note, beats=1):
        await _studio_bridge('music_note', float(note), max(0.01, float(beats)) * 60 / _tempo)
    async def rest(beats=1): await __import__('asyncio').sleep(float(beats) * 60 / _tempo)
    def stop_music(): _emit('', 'music_stop')
    _studio_module('music', {'set_tempo': set_tempo, 'play_note': play_note, 'rest': rest, 'stop': stop_music})

if 'speech' in _studio_extension_ids:
    async def speak(text, rate=1, language='en-US'):
        return await _studio_bridge('speak', str(text), float(rate), str(language))
    def stop_speech(): _emit('', 'speech_stop')
    _studio_module('speech', {'speak': speak, 'stop': stop_speech})

if 'sensing' in _studio_extension_ids:
    _sensing_start = time.monotonic()
    def _sensing_state():
        from js import studioInputState
        return json.loads(str(studioInputState))
    def key_pressed(key): return str(key).lower() in _sensing_state().get('keys', [])
    def mouse_position():
        state = _sensing_state()
        return (state.get('mouseX', 0), state.get('mouseY', 0))
    def mouse_down(): return bool(_sensing_state().get('mouseDown', False))
    def timer(): return time.monotonic() - _sensing_start
    def reset_timer():
        global _sensing_start
        _sensing_start = time.monotonic()
    _studio_module('sensing', {'key_pressed': key_pressed, 'mouse_position': mouse_position,
        'mouse_down': mouse_down, 'timer': timer, 'reset_timer': reset_timer})

if 'camera' in _studio_extension_ids:
    class Camera:
        async def start(self): return await _studio_bridge('camera_start')
        async def capture(self): return await _studio_bridge('camera_capture')
        async def stop(self): return await _studio_bridge('camera_stop')
    _studio_module('camera', {'Camera': Camera})

if 'ml' in _studio_extension_ids:
    async def classify_text(text): return await _studio_bridge('ml_text', str(text))
    async def predict_number(values): return await _studio_bridge('ml_number', list(values))
    _studio_module('studio_ml', {'classify_text': classify_text, 'predict_number': predict_number})

if 'board' in _studio_extension_ids:
    class VirtualBoard:
        def led(self, value): _emit('', 'board_led', bool(value))
        def motor(self, speed): _emit('', 'board_motor', max(-100, min(100, float(speed))))
        def servo(self, angle): _emit('', 'board_servo', max(0, min(180, float(angle))))
        async def sensors(self): return await _studio_bridge('board_sensors')
        async def write(self, text): return await _studio_bridge('board_write', str(text))
    _studio_module('board', {'VirtualBoard': VirtualBoard})

if 'plots' in _studio_extension_ids:
    import matplotlib
    matplotlib.use('Agg')
    import matplotlib.pyplot as _plt
    def _studio_show(*args, **kwargs):
        import io, base64
        for number in _plt.get_fignums():
            output = io.BytesIO()
            _plt.figure(number).savefig(output, format='png', bbox_inches='tight')
            _emit('', 'figure', 'data:image/png;base64,' + base64.b64encode(output.getvalue()).decode('ascii'))
        _plt.close('all')
    _plt.show = _studio_show
