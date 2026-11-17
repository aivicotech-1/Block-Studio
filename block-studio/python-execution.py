"""Cooperative execution helpers used by the browser worker."""
import ast as _ast
import asyncio as _asyncio
import inspect as _inspect


def _studio_is_blocking_call(node, names):
    if not isinstance(node, _ast.Call):
        return False
    fn = node.func
    return (isinstance(fn, _ast.Name) and (fn.id == 'input' or fn.id in names)) or (
        isinstance(fn, _ast.Attribute) and isinstance(fn.value, _ast.Name)
        and fn.value.id == 'time' and fn.attr == 'sleep')


def _studio_needs_await(statements, names):
    class Detector(_ast.NodeVisitor):
        found = False
        def visit_Call(self, node):
            if _studio_is_blocking_call(node, names): self.found = True
            self.generic_visit(node)
        def visit_FunctionDef(self, node): pass
        def visit_AsyncFunctionDef(self, node): pass
        def visit_ClassDef(self, node): pass
    visitor = Detector()
    for statement in statements: visitor.visit(statement)
    return visitor.found


def _studio_compile(code, filename, capture_last=False):
    tree = _ast.parse(code, filename=filename)
    if capture_last and tree.body and isinstance(tree.body[-1], _ast.Expr):
        last = tree.body[-1]
        tree.body[-1] = _ast.copy_location(_ast.Assign(targets=[_ast.Name(id='_studio_last_value', ctx=_ast.Store())], value=last.value), last)
    definitions = [node for node in _ast.walk(tree) if isinstance(node, _ast.FunctionDef)]
    names = set()
    while True:
        found = {node.name for node in definitions if _studio_needs_await(node.body, names)}
        if found <= names: break
        names.update(found)

    class Cooperative(_ast.NodeTransformer):
        def visit_Await(self, node):
            # Explicit await input()/await time.sleep() must not be wrapped twice.
            if isinstance(node.value, _ast.Call):
                call = node.value
                call.args = [self.visit(arg) for arg in call.args]
                if isinstance(call.func, _ast.Name) and call.func.id == 'input':
                    call.func = _ast.Name(id='_studio_input', ctx=_ast.Load())
                elif isinstance(call.func, _ast.Attribute) and isinstance(call.func.value, _ast.Name) and call.func.value.id == 'time' and call.func.attr == 'sleep':
                    call.func = _ast.Attribute(value=_ast.Name(id='_asyncio', ctx=_ast.Load()), attr='sleep', ctx=_ast.Load())
                return node
            return self.generic_visit(node)
        def visit_Call(self, node):
            node = self.generic_visit(node)
            if not _studio_is_blocking_call(node, names): return node
            if isinstance(node.func, _ast.Name) and node.func.id == 'input':
                node.func = _ast.Name(id='_studio_input', ctx=_ast.Load())
            elif isinstance(node.func, _ast.Attribute):
                node.func = _ast.Attribute(value=_ast.Name(id='_asyncio', ctx=_ast.Load()), attr='sleep', ctx=_ast.Load())
            return _ast.copy_location(_ast.Await(value=node), node)
        def visit_FunctionDef(self, node):
            node = self.generic_visit(node)
            if node.name not in names: return node
            if node.name.startswith('__'):
                raise SyntaxError('Interactive input/time.sleep in special methods is unsupported; use a regular function.')
            return _ast.copy_location(_ast.AsyncFunctionDef(name=node.name, args=node.args, body=node.body,
                decorator_list=node.decorator_list, returns=node.returns, type_comment=node.type_comment), node)

    tree = Cooperative().visit(tree)
    _ast.fix_missing_locations(tree)
    return compile(tree, filename, 'exec', flags=_ast.PyCF_ALLOW_TOP_LEVEL_AWAIT)


async def _studio_input(prompt=''):
    from js import studioInput
    return str(await studioInput(str(prompt)))


async def _studio_execute(code, filename, scope, capture_last=False):
    scope['_studio_input'] = _studio_input
    scope['_asyncio'] = _asyncio
    scope.pop('_studio_last_value', None)
    result = eval(_studio_compile(code, filename, capture_last), scope)
    if _inspect.isawaitable(result): await result
    return scope.pop('_studio_last_value', None)
