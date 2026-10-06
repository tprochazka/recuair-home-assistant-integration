"""Check the archives users install rather than only the build script syntax."""
import hashlib
import importlib.util
from pathlib import Path
import tempfile
import unittest
from zipfile import ZipFile

ROOT = Path(__file__).parents[1]
spec = importlib.util.spec_from_file_location("package_builder", ROOT / "scripts/build_package.py")
builder = importlib.util.module_from_spec(spec)
spec.loader.exec_module(builder)


class PackageTest(unittest.TestCase):
    def test_install_layout_and_required_files(self):
        with tempfile.TemporaryDirectory() as directory:
            output = Path(directory)
            integration, = builder.build(output)
            with ZipFile(integration) as archive:
                names = set(archive.namelist())
                for required in ("manifest.json", "__init__.py", "entity.py", "repairs.py", "update.py", "translations/cs.json", "translations/en.json"):
                    self.assertIn(required, names)
                self.assertFalse(any("__pycache__" in name or name.endswith(".pyc") for name in names))
                self.assertFalse(any(name.startswith("custom_components/") for name in names))
                self.assertEqual(archive.read("frontend/recuair-dashboard.js"), (ROOT / "custom_components/recuair/frontend/recuair-dashboard.js").read_bytes())
            checksums = (output / "SHA256SUMS.txt").read_text(encoding="utf-8")
            for package in (integration,):
                self.assertIn(hashlib.sha256(package.read_bytes()).hexdigest() + "  " + package.name, checksums)

    def test_repeated_build_is_reproducible(self):
        with tempfile.TemporaryDirectory() as directory:
            first = builder.build(Path(directory) / "first")
            second = builder.build(Path(directory) / "second")
            for a, b in zip(first, second):
                self.assertEqual(a.read_bytes(), b.read_bytes())
