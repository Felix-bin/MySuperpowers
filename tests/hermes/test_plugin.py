import importlib.util
import shutil
import tempfile
import unittest
from pathlib import Path
from unittest.mock import Mock

ROOT = Path(__file__).resolve().parents[2]


def load_plugin(path):
    spec = importlib.util.spec_from_file_location('superpowers', path)
    plugin = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(plugin)
    return plugin


class PluginTests(unittest.TestCase):
    def test_registers_skills_without_context_hooks(self):
        plugin = load_plugin(ROOT / '.hermes-plugin/__init__.py')
        ctx = Mock()
        plugin.register(ctx)
        expected = {p.parent.name for p in (ROOT / 'skills').glob('*/SKILL.md')}
        actual = {call.args[0] for call in ctx.register_skill.call_args_list}
        self.assertEqual(actual, expected)
        ctx.register_hook.assert_not_called()
        self.assertNotIn('using-superpowers', actual)
        self.assertNotIn('diagnosing-superpowers', actual)
        self.assertIn('writing-plans', actual)
        for call in ctx.register_skill.call_args_list:
            self.assertIsInstance(call.args[1], Path)
            self.assertTrue(call.args[1].is_file())

    def test_flattened_install_layout(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            shutil.copy(ROOT / '.hermes-plugin/__init__.py', root / '__init__.py')
            skill = root / 'skills/writing-plans/SKILL.md'
            skill.parent.mkdir(parents=True)
            skill.write_text('test', encoding='utf-8')
            plugin = load_plugin(root / '__init__.py')
            self.assertEqual(Path(plugin._skills_dir()), root / 'skills')


if __name__ == '__main__':
    unittest.main()
