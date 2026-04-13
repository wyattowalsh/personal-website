import re

with open("components/landing-title/arcane.module.css", "r") as f:
    content = f.read()

start_marker = "/* ─── Scene body layout overrides ──────────────────────────────────────── */"
end_marker = "/* ─── Scene body / title block ─────────────────────────────────────────── */"

new_css = """/* ─── Scene body layout overrides ──────────────────────────────────────── */

/* Scene grids focus entirely on visual impact */
.sceneBody {
  display: grid;
  align-items: center;
  min-height: 16rem; /* Enlarge slightly to let design shine */
  gap: 2rem;
}

/* Scene column sizing for visual balance */
.sceneSorcerer .sceneBody { grid-template-columns: 1fr 1.5fr; }
.sceneMage .sceneBody { grid-template-columns: 1fr 1.5fr; }
.sceneWeaver .sceneBody { grid-template-columns: 1.5fr 1fr; }
.sceneConjurer .sceneBody { grid-template-columns: 1fr 1.5fr; }
.sceneMystic .sceneBody { grid-template-columns: 1.5fr 1fr; }
.sceneOracle .sceneBody { grid-template-columns: 1.5fr 1fr; }

/* In sorcerer, mage, conjurer: text is second element in code, rig is first */
.sceneSorcerer .titleBlock,
.sceneMage .titleBlock,
.sceneConjurer .titleBlock {
  order: 2;
}

.sceneSorcerer .sceneRig,
.sceneMage .sceneRig,
.sceneConjurer .sceneRig {
  order: 1;
}

"""
pattern = re.compile(re.escape(start_marker) + r".*?" + re.escape(end_marker), re.DOTALL)
content = pattern.sub(new_css + end_marker, content)

with open("components/landing-title/arcane.module.css", "w") as f:
    f.write(content)
