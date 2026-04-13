import re

with open('components/landing-title/arcane.module.css', 'r') as f:
    content = f.read()

# Make arcane rigs have the same exact centering and flex properties as systems and crafted
# if they don't already have it
content = re.sub(
    r'\.sceneRig \{\s*min-height: 16rem;\s*flex-shrink: 0;\s*\}',
    '.sceneRig {\n  min-height: 16rem;\n  flex-shrink: 0;\n  position: relative;\n}',
    content
)

with open('components/landing-title/arcane.module.css', 'w') as f:
    f.write(content)
