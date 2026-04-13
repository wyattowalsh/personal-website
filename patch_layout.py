import re

with open("components/landing-title/crafted.module.css", "r") as f:
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

.sceneAlchemist .sceneBody { grid-template-columns: 1fr 1.5fr; }
.sceneDigitalSculptor .sceneBody { grid-template-columns: 1fr 1.5fr; }
.sceneHolographicSculptor .sceneBody { grid-template-columns: 1fr 1.5fr; }
.sceneCyberDefense .sceneBody { grid-template-columns: 1fr 1.5fr; }
.sceneBlockchain .sceneBody { grid-template-columns: 1.5fr 1fr; }
.sceneFrontier .sceneBody { grid-template-columns: 1fr 1.5fr; }

/* In blockchain: text is second element in code, rig is first */
.sceneBlockchain .titleBlock {
  order: 2;
}

.sceneBlockchain .sceneRig {
  order: 1;
}

"""
pattern = re.compile(re.escape(start_marker) + r".*?" + re.escape(end_marker), re.DOTALL)
content = pattern.sub(new_css + end_marker, content)

with open("components/landing-title/crafted.module.css", "w") as f:
    f.write(content)
