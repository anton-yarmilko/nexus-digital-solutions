"""Extract supplied Figma vector groups unchanged; no redrawn artwork."""
import base64
import copy
import re
import shutil
import xml.etree.ElementTree as ET
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'public/assets'
OUT.mkdir(parents=True, exist_ok=True)
REF = ROOT / 'references'
REF.mkdir(exist_ok=True)
for name in ['Desktop.png', 'Desktop.svg', 'Mobile.png', 'Mobile.svg', 'Mobile - Menu Open.png']:
    shutil.copy2(Path.home() / 'Downloads' / name, REF / name)
NS = 'http://www.w3.org/2000/svg'
XL = 'http://www.w3.org/1999/xlink'
ET.register_namespace('', NS)
ET.register_namespace('xlink', XL)
root = ET.parse(REF / 'Desktop.svg').getroot()
ids = {e.get('id'): e for e in root.iter() if e.get('id')}

def extract(name, ident, box):
    element = copy.deepcopy(ids[ident])
    refs = set()
    def dependencies(node):
        for el in node.iter():
            for key, value in el.attrib.items():
                found = re.findall(r'url\(#([^)]*)\)', value)
                if key.endswith('href') and value.startswith('#'):
                    found.append(value[1:])
                for item in found:
                    if item not in refs:
                        refs.add(item)
                        dependencies(ids[item])
    dependencies(element)
    svg = ET.Element(f'{{{NS}}}svg', {'viewBox': ' '.join(map(str, box)), 'width': str(box[2]), 'height': str(box[3]), 'fill': 'none'})
    svg.append(element)
    defs = ET.SubElement(svg, f'{{{NS}}}defs')
    for ident in sorted(refs):
        defs.append(copy.deepcopy(ids[ident]))
    ET.ElementTree(svg).write(OUT / f'{name}.svg', encoding='utf-8', xml_declaration=True)

for args in [
    ('logo', 'Logo', (110, 41, 138, 34)),
    ('hero-projects', 'images', (875, 290, 264, 221)),
    ('call-note', 'UI-element: Arrow  15min call', (260, 500, 115, 50)),
    ('avatars', 'Avatars', (1266, 504, 74, 32)),
    ('case-formora', 'Project Cover', (453, 1233, 907, 420)),
    ('case-automation', 'Project Cover_2', (80, 1653, 907, 420)),
    ('users', 'Users', (100, 771, 32, 32)),
    ('codepen', 'Codepen', (420, 771, 32, 32)),
    ('monitor', 'Monitor', (740, 771, 32, 32)),
    ('hash', 'Hash', (1060, 771, 32, 32)),
    ('arrow', 'arrow', (92, 688, 20, 20)),
    ('star', 'Vector_2', (1146, 519, 16, 16)),
    ('corner', 'Vector 1', (371, 770, 10, 10)),
    ('slideshow', 'Slideshow', (50.5, 2802.23, 470, 49)),
    ('vision-card', 'image_5', (736.038, 2210, 145, 108)),
]:
    extract(*args)

# The original dot texture, retained from the Figma pattern definition.
extract('dots', 'pattern6_2_5_inner', (0, 0, 35, 35))
mobile = ET.parse(REF / 'Mobile.svg').getroot()
menu = next(e for e in mobile.iter() if e.get('d', '').startswith('M330 42H340'))
ids['menu-icon'] = menu
extract('menu', 'menu-icon', (320, 36, 24, 24))
print(f'Extracted original source assets to {OUT}')
