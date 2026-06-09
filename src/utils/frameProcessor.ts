import type { Frame, Caption, CropConfig, Transform2D } from '@/types';
import { cloneImageData, cropImageData, resizeImageData } from './imageUtils';
import { applyTransformToCanvas } from './keyframeInterpolator';

export function renderCaptionOnImageData(
  imageData: ImageData,
  captions: Caption[],
  frameIndex: number
): ImageData {
  const relevantCaptions = captions.filter(
    (c) => frameIndex >= c.frameRange[0] && frameIndex <= c.frameRange[1]
  );

  if (relevantCaptions.length === 0) return imageData;

  const canvas = document.createElement('canvas');
  canvas.width = imageData.width;
  canvas.height = imageData.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return imageData;

  ctx.putImageData(imageData, 0, 0);

  for (const caption of relevantCaptions) {
    ctx.font = `${caption.fontSize}px ${caption.fontFamily}`;
    ctx.textAlign = caption.align;
    ctx.textBaseline = 'top';

    if (caption.strokeWidth > 0) {
      ctx.strokeStyle = caption.strokeColor;
      ctx.lineWidth = caption.strokeWidth;
      ctx.strokeText(caption.text, caption.x, caption.y);
    }

    ctx.fillStyle = caption.color;
    ctx.fillText(caption.text, caption.x, caption.y);
  }

  return ctx.getImageData(0, 0, canvas.width, canvas.height);
}

export function processFrame(
  frame: Frame,
  captions: Caption[],
  frameIndex: number,
  crop: CropConfig,
  exportWidth?: number,
  exportHeight?: number
): ImageData {
  let result = cloneImageData(frame.imageData);

  result = renderCaptionOnImageData(result, captions, frameIndex);

  if (crop.enabled && crop.width > 0 && crop.height > 0) {
    result = cropImageData(result, crop.x, crop.y, crop.width, crop.height);
  }

  if (exportWidth && exportHeight && (result.width !== exportWidth || result.height !== exportHeight)) {
    result = resizeImageData(result, exportWidth, exportHeight);
  }

  return result;
}

export function processAllFrames(
  frames: Frame[],
  captions: Caption[],
  crop: CropConfig,
  exportWidth?: number,
  exportHeight?: number
): { imageData: ImageData; delay: number }[] {
  return frames.map((frame, index) => ({
    imageData: processFrame(frame, captions, index, crop, exportWidth, exportHeight),
    delay: frame.delay,
  }));
}

export function renderFrameWithTransform(
  ctx: CanvasRenderingContext2D,
  imageData: ImageData,
  transform: Transform2D | null
) {
  const canvas = ctx.canvas;
  canvas.width = imageData.width;
  canvas.height = imageData.height;

  ctx.save();
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (transform) {
    applyTransformToCanvas(ctx, transform);
  }

  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = imageData.width;
  tempCanvas.height = imageData.height;
  const tempCtx = tempCanvas.getContext('2d');
  if (tempCtx) {
    tempCtx.putImageData(imageData, 0, 0);
  }

  ctx.drawImage(tempCanvas, 0, 0);
  ctx.restore();
}
