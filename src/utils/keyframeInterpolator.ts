import type { Transform2D, BezierControlPoints, EasingPreset, AnimationTrack } from '@/types';

export const EASING_PRESETS: Record<EasingPreset, BezierControlPoints> = {
  linear: { x1: 0, y1: 0, x2: 1, y2: 1 },
  easeInQuad: { x1: 0.55, y1: 0.085, x2: 0.68, y2: 0.53 },
  easeOutQuad: { x1: 0.25, y1: 0.46, x2: 0.45, y2: 0.94 },
  easeInOutQuad: { x1: 0.455, y1: 0.03, x2: 0.515, y2: 0.955 },
  easeInCubic: { x1: 0.55, y1: 0.055, x2: 0.675, y2: 0.19 },
  easeOutCubic: { x1: 0.215, y1: 0.61, x2: 0.355, y2: 1 },
  easeInOutCubic: { x1: 0.645, y1: 0.045, x2: 0.355, y2: 1 },
  easeInElastic: { x1: 0.6, y1: -0.28, x2: 0.735, y2: 0.045 },
  easeOutElastic: { x1: 0.175, y1: 0.885, x2: 0.32, y2: 1.275 },
  easeInBounce: { x1: 0.6, y1: 0.04, x2: 0.98, y2: 0.335 },
  easeOutBounce: { x1: 0.075, y1: 0.82, x2: 0.165, y2: 1 },
  custom: { x1: 0.25, y1: 0.1, x2: 0.25, y2: 1 },
};

export const EASING_PRESET_LABELS: Record<EasingPreset, string> = {
  linear: '线性',
  easeInQuad: '缓入二次方',
  easeOutQuad: '缓出二次方',
  easeInOutQuad: '缓入缓出二次方',
  easeInCubic: '缓入三次方',
  easeOutCubic: '缓出三次方',
  easeInOutCubic: '缓入缓出三次方',
  easeInElastic: '缓入弹性',
  easeOutElastic: '缓出弹性',
  easeInBounce: '缓入弹跳',
  easeOutBounce: '缓出弹跳',
  custom: '自定义',
};

function cubicBezier(t: number, p0: number, p1: number, p2: number, p3: number): number {
  const mt = 1 - t;
  return mt * mt * mt * p0 + 3 * mt * mt * t * p1 + 3 * mt * t * t * p2 + t * t * t * p3;
}

function cubicBezierDerivative(t: number, p0: number, p1: number, p2: number, p3: number): number {
  const mt = 1 - t;
  return 3 * mt * mt * (p1 - p0) + 6 * mt * t * (p2 - p1) + 3 * t * t * (p3 - p2);
}

export function getEasingProgress(
  normalizedTime: number,
  bezier: BezierControlPoints
): number {
  const t = Math.max(0, Math.min(1, normalizedTime));
  if (t <= 0) return 0;
  if (t >= 1) return 1;

  const { x1, y1, x2, y2 } = bezier;

  if (x1 === y1 && x2 === y2) {
    return t;
  }

  let x = t;
  for (let i = 0; i < 8; i++) {
    const currentX = cubicBezier(x, 0, x1, x2, 1) - t;
    if (Math.abs(currentX) < 1e-6) break;
    const derivative = cubicBezierDerivative(x, 0, x1, x2, 1);
    if (Math.abs(derivative) < 1e-6) break;
    x -= currentX / derivative;
  }

  return cubicBezier(x, 0, y1, y2, 1);
}

export function getBezierPoints(
  bezier: BezierControlPoints,
  samples: number = 100
): { x: number; y: number }[] {
  const points: { x: number; y: number }[] = [];
  for (let i = 0; i <= samples; i++) {
    const t = i / samples;
    points.push({
      x: cubicBezier(t, 0, bezier.x1, bezier.x2, 1),
      y: cubicBezier(t, 0, bezier.y1, bezier.y2, 1),
    });
  }
  return points;
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function lerpAngle(a: number, b: number, t: number): number {
  let diff = b - a;
  while (diff > 180) diff -= 360;
  while (diff < -180) diff += 360;
  return a + diff * t;
}

export function interpolateTransform(
  start: Transform2D,
  end: Transform2D,
  progress: number
): Transform2D {
  const t = Math.max(0, Math.min(1, progress));
  return {
    x: lerp(start.x, end.x, t),
    y: lerp(start.y, end.y, t),
    rotation: lerpAngle(start.rotation, end.rotation, t),
    scaleX: lerp(start.scaleX, end.scaleX, t),
    scaleY: lerp(start.scaleY, end.scaleY, t),
  };
}

export function getTrackBezier(track: AnimationTrack): BezierControlPoints {
  if (track.easingPreset === 'custom') {
    return track.customBezier;
  }
  return EASING_PRESETS[track.easingPreset];
}

export function getTrackProgress(
  track: AnimationTrack,
  currentFrame: number
): number {
  const { startFrame, endFrame } = track;
  if (endFrame <= startFrame) return 0;
  if (currentFrame <= startFrame) return 0;
  if (currentFrame >= endFrame) return 1;
  return (currentFrame - startFrame) / (endFrame - startFrame);
}

export function evaluateTrack(
  track: AnimationTrack,
  currentFrame: number
): Transform2D | null {
  if (!track.enabled) return null;
  const { startKeyframe, endKeyframe } = track;
  const rawProgress = getTrackProgress(track, currentFrame);
  const bezier = getTrackBezier(track);
  const easedProgress = getEasingProgress(rawProgress, bezier);
  return interpolateTransform(startKeyframe.transform, endKeyframe.transform, easedProgress);
}

export function evaluateTracks(
  tracks: AnimationTrack[],
  currentFrame: number
): Transform2D | null {
  const enabledTracks = tracks.filter((t) => t.enabled);
  if (enabledTracks.length === 0) return null;

  let result: Transform2D | null = null;
  for (const track of enabledTracks) {
    const transform = evaluateTrack(track, currentFrame);
    if (transform) {
      if (!result) {
        result = { ...transform };
      } else {
        result.x += transform.x;
        result.y += transform.y;
        result.rotation += transform.rotation;
        result.scaleX *= transform.scaleX;
        result.scaleY *= transform.scaleY;
      }
    }
  }
  return result;
}

export function generatePathPreview(
  track: AnimationTrack,
  samples: number = 50
): { x: number; y: number; progress: number }[] {
  const points: { x: number; y: number; progress: number }[] = [];
  const { startKeyframe, endKeyframe } = track;
  const bezier = getTrackBezier(track);

  for (let i = 0; i <= samples; i++) {
    const rawProgress = i / samples;
    const easedProgress = getEasingProgress(rawProgress, bezier);
    const transform = interpolateTransform(
      startKeyframe.transform,
      endKeyframe.transform,
      easedProgress
    );
    points.push({
      x: transform.x,
      y: transform.y,
      progress: rawProgress,
    });
  }
  return points;
}

export function applyTransformToCanvas(
  ctx: CanvasRenderingContext2D,
  transform: Transform2D,
  originX: number = 0.5,
  originY: number = 0.5
) {
  const { x, y, rotation, scaleX, scaleY } = transform;
  const ox = ctx.canvas.width * originX;
  const oy = ctx.canvas.height * originY;

  ctx.translate(x, y);
  ctx.rotate((rotation * Math.PI) / 180);
  ctx.scale(scaleX, scaleY);
  ctx.translate(-ox, -oy);
}

export function createDefaultTransform(canvasWidth: number, canvasHeight: number): Transform2D {
  return {
    x: canvasWidth / 2,
    y: canvasHeight / 2,
    rotation: 0,
    scaleX: 1,
    scaleY: 1,
  };
}
