import bpy

from collections import namedtuple

Vertex = namedtuple("Vertex", "x y z")
Quaternion = namedtuple("Quaternion", "x y z w")
Box = namedtuple("Box", "w h d")

def v_blender_to_three(x, y, z):
    return Vertex(x, z, -y)

def q_blender_to_three(w, x, y, z):
    return Quaternion(*v_blender_to_three(x, y, z), w)

def b_blender_to_three(w, d, h):
    return Box(*tuple(d / 2 for d in (w, h, d)))

with open('./out.txt', 'w') as f:
    print('generating physics bodies')
    for obj in bpy.context.selected_objects:

        s = b_blender_to_three(*tuple(round(c, 2) for c in obj.dimensions))
        v = v_blender_to_three(*tuple(round(c, 2) for c in obj.location))
        q = q_blender_to_three(*tuple(obj.rotation_quaternion))
        data = '\n'.join([
            "new CANNON.Body({",
            "\ttype: CANNON.Body.STATIC,",
            f"\tshape: new CANNON.Box(new CANNON.Vec3({s.w}, {s.h}, {s.d})),",
            f"\tposition: new CANNON.Vec3({v.x}, {v.y}, {v.z}),",
            f"\tquaternion: new CANNON.Quaternion({q.x}, {q.y}, {q.z}, {q.w})",
            "}),",
            ""
        ])
        f.write(data)
