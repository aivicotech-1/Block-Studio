import importlib.util
import types
import unittest
from pathlib import Path


class CooperativeExecutionTests(unittest.IsolatedAsyncioTestCase):
    def setUp(self):
        spec=importlib.util.spec_from_file_location('studio_execution',Path(__file__).parents[1]/'python-execution.py')
        self.helper=importlib.util.module_from_spec(spec)
        spec.loader.exec_module(self.helper)

    async def test_top_level_input_and_expression_results(self):
        async def answer(prompt):
            self.assertEqual(prompt,'Name? ')
            return 'Ada'
        self.helper._studio_input=answer
        scope={}
        await self.helper._studio_execute("name = input('Name? ')\nmessage = 'Hello ' + name",'Stage.py',scope)
        self.assertEqual(scope['message'],'Hello Ada')
        self.assertEqual(await self.helper._studio_execute('21 * 2','<console>',scope,True),42)

    async def test_input_in_regular_and_transitive_functions(self):
        async def answer(prompt): return 'Grace'
        self.helper._studio_input=answer
        scope={}
        await self.helper._studio_execute("def read_name():\n    return input('Name:')\ndef greet():\n    return 'Hello ' + read_name()\nresult = greet()",'Sprite1.py',scope)
        self.assertEqual(scope['result'],'Hello Grace')

    async def test_time_sleep_yields_instead_of_blocking_the_worker(self):
        calls=[]
        async def sleep(seconds): calls.append(seconds)
        self.helper._asyncio=types.SimpleNamespace(sleep=sleep)
        await self.helper._studio_execute('import time\nfor i in range(3):\n    time.sleep(0.02)','Stage.py',{})
        self.assertEqual(calls,[.02,.02,.02])

    async def test_explicit_await_input_is_not_wrapped_twice(self):
        async def answer(prompt):return '42'
        self.helper._studio_input=answer
        scope={}
        await self.helper._studio_execute("value = await input('value')",'Stage.py',scope)
        self.assertEqual(scope['value'],'42')

    async def test_errors_keep_the_original_filename_and_line_number(self):
        try:
            await self.helper._studio_execute('x = 1\nx / 0','Sprite1.py',{})
        except ZeroDivisionError as error:
            trace=error.__traceback__
            while trace.tb_next: trace=trace.tb_next
            self.assertEqual(trace.tb_frame.f_code.co_filename,'Sprite1.py')
            self.assertEqual(trace.tb_lineno,2)
        else:self.fail('Expected ZeroDivisionError')


if __name__=='__main__':unittest.main()
