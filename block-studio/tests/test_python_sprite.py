"""Exercise the exact Python Sprite bootstrap embedded in the browser worker."""
import builtins
import json
import re
import sys
import types
import unittest
from pathlib import Path
from unittest.mock import patch


class SpriteBridgeTests(unittest.TestCase):
    def setUp(self):
        source = (Path(__file__).parents[1] / 'python-worker.js').read_text(encoding='utf-8')
        bootstrap = re.search(r'await py\.runPythonAsync\(`([\s\S]*?)`\);', source).group(1)
        self.messages = []
        js = types.ModuleType('js')
        js.postMessage = self.messages.append
        js.Object = types.SimpleNamespace(fromEntries=lambda value: value)
        ffi = types.ModuleType('pyodide.ffi')
        ffi.to_js = lambda value, **kwargs: value
        scope = {'_studio_sprites': json.dumps([{'n': 'Cat', 'x': 0, 'y': 0, 'dir': 90}])}
        old_input, old_path, old_bytecode = builtins.input, sys.path[:], sys.dont_write_bytecode
        modules = patch.dict(sys.modules, {'js': js, 'pyodide.ffi': ffi})
        modules.start()
        self.addCleanup(modules.stop)
        try:
            with patch('os.chdir'):
                exec(compile(bootstrap, 'python-worker bootstrap', 'exec'), scope)
        finally:
            builtins.input = old_input
            sys.path[:] = old_path
            sys.dont_write_bytecode = old_bytecode
        self.Sprite = scope['Sprite']

    def test_instances_share_position_and_direction(self):
        one, two = self.Sprite('Cat'), self.Sprite('Cat')
        one.goto(80, 30)
        self.assertEqual((two.x, two.y), (80, 30))
        two.turn(90)
        self.assertEqual(one.direction, 180)
        two.x = 12
        self.assertEqual(one.x, 12)
        self.assertEqual(self.messages[-1]['args'], [12.0, 30.0])

    def test_move_uses_shared_direction(self):
        sprite = self.Sprite('Cat')
        sprite.move(10)
        sprite.turn(90)
        sprite.move(10)
        self.assertAlmostEqual(sprite.x, 10)
        self.assertAlmostEqual(sprite.y, -10)
        self.assertEqual([m['action'] for m in self.messages], ['goto', 'turn', 'goto'])

    def test_visibility_speech_and_costume_commands(self):
        sprite = self.Sprite('Cat')
        sprite.hide()
        sprite.show()
        sprite.say('hello')
        sprite.next_costume()
        sprite.set_size(120)
        self.assertEqual([m['action'] for m in self.messages], ['hide', 'show', 'say', 'costume', 'size'])

    def test_unknown_sprite_is_an_explicit_error(self):
        with self.assertRaisesRegex(ValueError, 'Unknown sprite'):
            self.Sprite('missing')


if __name__ == '__main__':
    unittest.main()
