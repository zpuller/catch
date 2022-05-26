from PIL import Image

dir = 'frontend/static/textures/environmentMaps/staging/'
out_dir = dir + 'out/'

outs = [
    'nx',
    'ny',
    'nz',
    'px',
    'py',
    'pz',
]

with Image.open(dir + 'map.png') as im:
    w, h = im.size
    # ims = im.resize((2048, 1536)) if w > 2048 else im
    ims = im
    w, h = ims.size
    bw, bh = w // 4, h // 3

    boxes = [
        # l, u, r, d
        (0, bh, bw, 2 * bh),
        (bw, 2 * bh, 2 * bw, 3 * bh),
        (3 * bw, bh, 4 * bw, 2 * bh),
        (2 * bw, bh, 3 * bw, 2 * bh),
        (bw, 0, 2 * bw, bh),
        (bw, bh, 2 * bw, 2 * bh),
    ]

    for i in range(len(boxes)):
        ims.crop(boxes[i]).convert('RGB').save(out_dir + outs[i] + '.jpg')
