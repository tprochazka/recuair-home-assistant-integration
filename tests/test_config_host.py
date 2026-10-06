"""Test the host matcher without requiring a running HA installation."""
import ast
from pathlib import Path
import types
import unittest


class ConfigHostTest(unittest.TestCase):
    def setUp(self):
        path = Path(__file__).parents[1] / "custom_components/recuair/config_flow.py"
        tree = ast.parse(path.read_text(encoding="utf-8"))
        flow = next(node for node in tree.body if isinstance(node, ast.ClassDef) and node.name == "RecuairConfigFlow")
        method = next(node for node in flow.body if isinstance(node, ast.FunctionDef) and node.name == "_entry_for_host")
        namespace = {"CONF_HOST": "host"}
        exec(compile(ast.Module(body=[method], type_ignores=[]), str(path), "exec"), namespace)
        self.match = namespace["_entry_for_host"]

    def test_old_address_is_free_after_options_change(self):
        entry = types.SimpleNamespace(data={"host": "old"}, options={"host": "new"})
        flow = types.SimpleNamespace(_async_current_entries=lambda: [entry])
        self.assertIsNone(self.match(flow, "old"))
        self.assertIs(self.match(flow, "new"), entry)

    def test_original_address_is_used_without_override(self):
        entry = types.SimpleNamespace(data={"host": "original"}, options={"scan_interval": 10})
        flow = types.SimpleNamespace(_async_current_entries=lambda: [entry])
        self.assertIs(self.match(flow, "original"), entry)

    def test_another_unit_can_claim_released_address(self):
        moved = types.SimpleNamespace(data={"host": "old"}, options={"host": "new"})
        added = types.SimpleNamespace(data={"host": "old"}, options={})
        flow = types.SimpleNamespace(_async_current_entries=lambda: [moved, added])
        self.assertIs(self.match(flow, "old"), added)
