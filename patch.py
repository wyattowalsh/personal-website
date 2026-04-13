import re

with open("components/landing-title/crafted.module.css", "r") as f:
    content = f.read()

# Replace Scene body to descriptor with the new stuff
start_marker = "/* ─── Scene body / title block ─────────────────────────────────────────── */"
end_marker = "/* ─── Rig base ─────────────────────────────────────────────────────────── */"

new_css = """/* ─── Scene body / title block ─────────────────────────────────────────── */

.titleBlock {
  display: flex;
  flex-direction: column;
  justify-content: center;
  z-index: 2;
}

.headlineWrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 1.5rem;
}

/* Adjustments for layouts with rig left/right */
.sceneAlchemist .headlineWrap,
.sceneCyberDefense .headlineWrap,
.sceneBlockchain .headlineWrap {
  align-items: flex-start;
  text-align: left;
}

.sceneDigitalSculptor .headlineWrap,
.sceneHolographicSculptor .headlineWrap,
.sceneFrontier .headlineWrap {
  align-items: flex-start;
  text-align: left;
}

.iconBadge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 4.5rem; /* much larger */
  height: 4.5rem;
  border-radius: 1.25rem;
  border: 1px solid var(--craft-edge);
  background:
    linear-gradient(160deg, var(--craft-fill-strong), var(--craft-fill)),
    var(--craft-gradient);
  box-shadow: 0 24px 48px var(--craft-glow-soft);
  margin-bottom: 0.5rem;
}

.icon {
  width: 2.2rem;
  height: 2.2rem;
  color: #fff;
  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
}

.titleLockup {
  display: flex;
  flex-direction: column;
}

.title {
  margin: 0;
  font-size: clamp(2rem, 4.5vw, 3.2rem); /* Significantly enlarged */
  line-height: 1.05;
  letter-spacing: -0.04em;
  text-wrap: balance;
  text-shadow: 0 10px 30px var(--craft-glow-soft), 0 2px 4px rgba(0,0,0,0.5); /* Glowing and poppy text */
  font-weight: 800;
  background: linear-gradient(to bottom right, #fff, var(--craft-edge));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

"""

pattern = re.compile(re.escape(start_marker) + r".*?" + re.escape(end_marker), re.DOTALL)
content = pattern.sub(new_css + end_marker, content)

with open("components/landing-title/crafted.module.css", "w") as f:
    f.write(content)
