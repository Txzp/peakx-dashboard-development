// Client helper: center-crop an image file to w×h and return a compressed WebP data URL.
export async function resizeImage(file: File, w: number, h: number, quality = 0.85) {
  const img = await createImageBitmap(file)
  const c = document.createElement('canvas')
  c.width = w; c.height = h
  const s = Math.max(w / img.width, h / img.height)
  c.getContext('2d')!.drawImage(img, (w - img.width * s) / 2, (h - img.height * s) / 2, img.width * s, img.height * s)
  return c.toDataURL('image/webp', quality)
}
