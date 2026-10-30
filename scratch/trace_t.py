from PIL import Image, ImageFilter
import numpy as np

# Load original transparent T icon
img = Image.open('public/temfyla-icon.png').convert('RGBA')
arr = np.array(img)
alpha = arr[:, :, 3]

# Let's create two awesome versions:
# Version 1: The letter T with its rich purple/violet ribbon gradient AND a crisp glowing purple contour stroke (no black background anywhere)
# Version 2: Only the purple contour (outline) of the letter T with transparent interior

# Let's create Version 1:
# The original icon is filled with gradient:
# Let's add an explicit smooth purple outline/contour around the T:
mask = (alpha > 40).astype(np.uint8) * 255
mask_img = Image.fromarray(mask, mode='L')

# Dilate mask by 4px for outer contour
dilated = mask_img.filter(ImageFilter.MaxFilter(7))
arr_dilated = np.array(dilated)

# Contour area = dilated minus mask
contour_mask = np.clip(arr_dilated.astype(int) - mask.astype(int), 0, 255).astype(np.uint8)
# Blur slightly for beautiful antialiasing
contour_smooth = Image.fromarray(contour_mask, mode='L').filter(ImageFilter.GaussianBlur(1.0))
arr_contour = np.array(contour_smooth)

# Combine original T with glowing purple contour
h, w = arr.shape[:2]
out1 = np.copy(arr)
# Where contour is present, blend purple #9333ea (147, 51, 234)
contour_norm = arr_contour.astype(float) / 255.0
for c, val in enumerate([147, 51, 234]):
    # outer contour
    out1[:, :, c] = np.where(alpha < 40, (val * contour_norm).astype(np.uint8), out1[:, :, c])
out1[:, :, 3] = np.maximum(alpha, arr_contour)

Image.fromarray(out1).save('public/temfyla-icon-purple-contour.png')
print('Saved public/temfyla-icon-purple-contour.png')

# Version 2: ONLY the contour (outline) of the letter T in rich purple
# Inner edge + outer edge
eroded = mask_img.filter(ImageFilter.MinFilter(7))
outline_mask = np.clip(arr_dilated.astype(int) - np.array(eroded).astype(int), 0, 255).astype(np.uint8)
outline_smooth = Image.fromarray(outline_mask, mode='L').filter(ImageFilter.GaussianBlur(1.2))
arr_outline = np.array(outline_smooth)

out2 = np.zeros((h, w, 4), dtype=np.uint8)
for y in range(h):
    # gradient from #c084fc to #7c3aed
    ratio = y / h
    out2[y, :, 0] = int(192 * (1 - ratio) + 124 * ratio)
    out2[y, :, 1] = int(132 * (1 - ratio) + 58 * ratio)
    out2[y, :, 2] = int(252 * (1 - ratio) + 237 * ratio)
out2[:, :, 3] = arr_outline

Image.fromarray(out2).save('public/temfyla-t-outline-only.png')
print('Saved public/temfyla-t-outline-only.png')
