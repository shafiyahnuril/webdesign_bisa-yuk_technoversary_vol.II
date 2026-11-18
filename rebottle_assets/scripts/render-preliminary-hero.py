"""Render the standalone PET asset. Run with Blender 3.4+ in background mode."""
import math
import sys
from pathlib import Path

import bpy
from mathutils import Vector

OUTPUT = Path(sys.argv[sys.argv.index("--") + 1]).resolve()
OUTPUT.mkdir(parents=True, exist_ok=True)

PROFILE = [
    (0, 0), (.190, 0), (.255, .018), (.300, .060), (.322, .140),
    (.328, .240), (.318, .300), (.328, .360), (.328, .520),
    (.320, .580), (.328, .640), (.328, 1.150), (.322, 1.250),
    (.300, 1.380), (.240, 1.540), (.170, 1.660), (.132, 1.740),
    (.130, 1.790), (.160, 1.800), (.160, 1.830), (.130, 1.840), (.126, 1.900),
]

def rgb(hexadecimal):
    values = (int(hexadecimal[i:i+2], 16) / 255 for i in (0, 2, 4))
    return tuple(v / 12.92 if v <= .04045 else ((v + .055) / 1.055) ** 2.4 for v in values)

def material(name, color, roughness, transmission=0, ior=1.45):
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    shader = mat.node_tree.nodes.get("Principled BSDF")
    shader.inputs["Base Color"].default_value = (*rgb(color), 1)
    shader.inputs["Roughness"].default_value = roughness
    shader.inputs["IOR"].default_value = ior
    slot = shader.inputs.get("Transmission Weight") or shader.inputs.get("Transmission")
    slot.default_value = transmission
    return mat

def revolve(name, profile, mat, n=128, ripple=0, closed=True):
    vertices = []
    rings = []
    faces = []
    for r, z in profile:
        ring = []
        for i in range(n if r else 1):
            theta = i * math.tau / n
            rr = r + ripple * math.cos(theta * 40) if r else 0
            ring.append(len(vertices))
            vertices.append((rr * math.cos(theta), rr * math.sin(theta), z))
        rings.append(ring)
    pairs = list(zip(rings, rings[1:]))
    if closed and len(rings[0]) == n and len(rings[-1]) == n:
        pairs.append((rings[-1], rings[0]))
    for lower, upper in pairs:
        for i in range(n):
            j = (i + 1) % n
            if len(lower) == 1:
                faces.append((lower[0], upper[j], upper[i]))
            elif len(upper) == 1:
                faces.append((lower[i], lower[j], upper[0]))
            else:
                faces.append((lower[i], lower[j], upper[j], upper[i]))
    mesh = bpy.data.meshes.new(name)
    mesh.from_pydata(vertices, [], faces)
    mesh.update()
    obj = bpy.data.objects.new(name, mesh)
    bpy.context.collection.objects.link(obj)
    obj.data.materials.append(mat)
    for polygon in mesh.polygons:
        polygon.use_smooth = True
    return obj

def aim(obj, point):
    obj.rotation_euler = (Vector(point) - obj.location).to_track_quat("-Z", "Y").to_euler()

def light(name, location, target, energy, color, size, size_y):
    source = bpy.data.lights.new(name, "AREA")
    source.shape = "RECTANGLE"
    source.energy = energy
    source.color = color
    source.size = size
    source.size_y = size_y
    obj = bpy.data.objects.new(name, source)
    bpy.context.collection.objects.link(obj)
    obj.location = location
    aim(obj, target)

def make_drop(mat):
    curve = bpy.data.curves.new("Droplet path", "CURVE")
    curve.dimensions = "2D"
    curve.resolution_u = 24
    curve.fill_mode = "BOTH"
    shape = curve.splines.new("BEZIER")
    points = [(0, .105), (.067, -.017), (0, -.079), (-.067, -.017)]
    shape.bezier_points.add(len(points) - 1)
    for point, (x, y) in zip(shape.bezier_points, points):
        point.co = (x, y, 0)
        point.handle_left_type = point.handle_right_type = "AUTO"
    shape.bezier_points[0].handle_left_type = shape.bezier_points[0].handle_right_type = "VECTOR"
    shape.use_cyclic_u = True
    obj = bpy.data.objects.new("Ink droplet", curve)
    bpy.context.collection.objects.link(obj)
    obj.location = (0, -.335, .801)
    obj.rotation_euler.x = math.pi / 2
    obj.data.materials.append(mat)

bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene
scene.render.engine = "CYCLES"
scene.cycles.samples = 280
scene.cycles.use_denoising = False
scene.cycles.max_bounces = 10
scene.cycles.transmission_bounces = 8
scene.render.threads_mode = "FIXED"
scene.render.threads = 6
scene.render.film_transparent = True
scene.view_settings.view_transform = "Standard"
scene.render.image_settings.color_mode = "RGBA"

world = bpy.data.worlds.new("Cobalt studio")
world.use_nodes = True
world.node_tree.nodes.get("Background").inputs[0].default_value = (*rgb("5279BD"), 1)
world.node_tree.nodes.get("Background").inputs[1].default_value = .7
scene.world = world

pet = material("PET", "F1F8FF", .062, .99, 1.45)
inner = [(max(0, r-.018), z+.014) if r else (0, .018) for r, z in PROFILE[:4]]
inner += [(r-.018, z) for r, z in PROFILE[4:]]
revolve("Bottle wall", PROFILE + list(reversed(inner)), pet)
revolve("Ribbed ice blue cap", [(0,1.90),(.14,1.90),(.148,1.912),(.148,2.082),(.139,2.10),(0,2.10)],
        material("Cap", "BFE7FF", .45), 160, .003)
water_profile = [(0,.046)] + [(r-.019,z+.013) for r,z in PROFILE[2:] if z <= 1.38]
water_profile += [(.260,1.445),(.257,1.452),(0,1.449)]
revolve("Water and meniscus", water_profile, material("Water", "DDF2FF", .045, 1, 1.333))
label = material("Paper label", "E6EAF2", .68)
blue_line = material("Top and bottom trim", "8FD3FF", .68)
revolve("Label", [(.332,.55),(.332,1.05)], label, closed=False)
for edge in (.55, 1.033):
    revolve("Label trim", [(.3326,edge),(.3326,edge+.017)], blue_line, closed=False)
make_drop(material("Droplet ink", "0B2B80", .72))

light("Cool key", (-2.8,-3.4,4.4), (0,0,1.0), 240, (.79,.89,1.0), 2.5, 4.0)
light("Cyan rim", (2.0,1.1,2.9), (0,0,1.1), 260, (.43,.77,1.0), .65, 3.6)
light("Window rim", (-1.8,.9,2.0), (0,0,1.0), 130, (.64,.78,1.0), .50, 2.8)
light("Cap and shoulder", (.2,-.5,4.7), (0,0,1.0), 60, (.75,.9,1.0), 2, 1.5)

camera = bpy.data.cameras.new("Asset camera")
camera.type = "ORTHO"
camera.ortho_scale = 2.83
obj = bpy.data.objects.new("Asset camera", camera)
bpy.context.collection.objects.link(obj)
obj.location = (1.38, -7.2, 1.57)
aim(obj, (0,0,1.045))
scene.camera = obj
scene.render.resolution_x = 760
scene.render.resolution_y = 980
scene.render.resolution_percentage = 100
scene.render.filepath = str(OUTPUT / "pet-isolated.png")
bpy.ops.render.render(write_still=True)
