"""Capability metadata remains meaningful when normal state attributes disappear."""
import importlib.util
from pathlib import Path
import unittest

ROOT = Path(__file__).parents[1] / "custom_components/recuair"
spec = importlib.util.spec_from_file_location("role_mixin", ROOT / "entity.py")
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)


class Base:
    @property
    def capability_attributes(self):
        return self.capabilities


class Entity(module.RecuairRoleMixin, Base):
    _recuair_role = "light"


class RoleTest(unittest.TestCase):
    def test_base_capabilities_are_preserved(self):
        entity = Entity()
        entity.capabilities = {"supported_color_modes": ["rgb"], "options": ["auto", "off"]}
        actual = entity.capability_attributes
        self.assertEqual(actual, {**entity.capabilities, "recuair_role": "light"})
        self.assertNotIn("recuair_role", entity.capabilities)

    def test_unavailable_state_can_keep_role_without_extra_attributes(self):
        entity = Entity()
        entity.capabilities = None
        # HA always includes capabilities, but omits extra attributes when unavailable.
        state = {"state": "unavailable", "attributes": entity.capability_attributes}
        self.assertEqual(state["attributes"]["recuair_role"], "light")

    def test_every_platform_uses_capability_mixin(self):
        import ast
        for name in ("light", "select", "number", "button", "binary_sensor", "sensor", "update"):
            tree = ast.parse((ROOT / (name + ".py")).read_text(encoding="utf-8"))
            for node in tree.body:
                if isinstance(node, ast.ClassDef):
                    bases = [base.id for base in node.bases if isinstance(base, ast.Name)]
                    if "CoordinatorEntity" in bases:
                        self.assertIn("RecuairRoleMixin", bases, node.name)
