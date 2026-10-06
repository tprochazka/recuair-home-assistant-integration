"""Build a reproducible HACS and manual-install ZIP package."""
from __future__ import annotations

import argparse
import hashlib
import json
from pathlib import Path
from zipfile import ZIP_DEFLATED, ZipFile, ZipInfo

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "custom_components/recuair"
INTEGRATION_SUFFIXES = {".py", ".json", ".yaml", ".svg", ".png", ".js"}


def write_zip(destination: Path, files: list[tuple[Path, str]]) -> None:
    with ZipFile(destination, "w") as archive:
        for source, name in sorted(files, key=lambda item: item[1]):
            info = ZipInfo(name, date_time=(1980, 1, 1, 0, 0, 0))
            info.create_system = 3
            info.external_attr = 0o100644 << 16
            info.compress_type = ZIP_DEFLATED
            archive.writestr(info, source.read_bytes(), compresslevel=9)
    with ZipFile(destination) as archive:
        if archive.testzip() is not None:
            raise RuntimeError(f"Corrupt package: {destination}")


def build(output: Path) -> list[Path]:
    manifest = json.loads((SOURCE / "manifest.json").read_text(encoding="utf-8"))
    if manifest.get("domain") != "recuair" or not manifest.get("version"):
        raise ValueError("Missing Recuair package identity/version")
    sources = sorted(path for path in SOURCE.rglob("*")
                     if path.is_file() and path.suffix in INTEGRATION_SUFFIXES
                     and not any(part.startswith(".") or part == "__pycache__"
                                 for part in path.relative_to(SOURCE).parts))
    files = [(path, path.relative_to(SOURCE).as_posix()) for path in sources]
    output.mkdir(parents=True, exist_ok=True)
    integration = output / "recuair.zip"
    write_zip(integration, files)
    (output / "SHA256SUMS.txt").write_text(
        f"{hashlib.sha256(integration.read_bytes()).hexdigest()}  {integration.name}\n",
        encoding="utf-8")
    return [integration]



if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--output-dir", type=Path, default=ROOT / "dist")
    for package in build(parser.parse_args().output_dir):
        print(package)
