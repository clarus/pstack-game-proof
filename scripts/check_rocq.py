"""Compile curriculum examples with the pinned local Rocq; leave no build artifacts."""

from pathlib import Path
import re
import shutil
import subprocess
import sys
import tempfile


def main():
    root = Path(__file__).resolve().parents[1]
    rocq = shutil.which("rocq")
    if rocq is None:
        raise RuntimeError("Rocq 9.0.1 is required on PATH; no checks ran.")
    version = subprocess.run(
        [rocq, "--version"], check=True, capture_output=True, text=True, timeout=30
    ).stdout
    if not re.search(r"version 9\.0\.1(?:\s|$)", version):
        raise RuntimeError(f"Expected Rocq 9.0.1; found {version.strip()}")
    print(version.splitlines()[0], flush=True)
    with tempfile.TemporaryDirectory(prefix="proof-quest-rocq-") as directory:
        scratch = Path(directory)
        shutil.copyfile(root / "verification/rocq/Curriculum.v", scratch / "Curriculum.v")
        subprocess.run(
            [rocq, "compile", "-q", "Curriculum.v"], cwd=scratch, check=True, timeout=120
        )
        (scratch / "Invalid.v").write_text(
            "Theorem invalid_conjunction : forall A B : Prop, A -> A /\\ B.\n"
            "Proof. intros A B HA. split. exact HA. exact HA. Qed.\n",
            encoding="utf-8",
        )
        rejected = subprocess.run(
            [rocq, "compile", "-q", "Invalid.v"], cwd=scratch,
            capture_output=True, text=True, timeout=30,
        )
        if rejected.returncode == 0:
            raise RuntimeError("Invalid conjunction proof unexpectedly compiled.")
        diagnostic = rejected.stdout + rejected.stderr
        if 'expected to have type "B"' not in diagnostic:
            raise RuntimeError(f"Negative check failed for an unexpected reason:\n{diagnostic}")
    print("PASS: curriculum examples compile; invalid conjunction proof rejected.")
    print("Scope: sample proofs only; no game transitions or X delivery checked.")


if __name__ == "__main__":
    try:
        main()
    except (RuntimeError, OSError, subprocess.SubprocessError) as error:
        print(f"FAIL: {error}", file=sys.stderr)
        sys.exit(1)
