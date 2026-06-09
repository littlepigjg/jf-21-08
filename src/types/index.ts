export interface Frame {
  id: string;
  imageData: ImageData;
  delay: number;
  width: number;
  height: number;
  disposalMethod: number;
}

export interface Caption {
  id: string;
  text: string;
  frameRange: [number, number];
  x: number;
  y: number;
  fontSize: number;
  fontFamily: string;
  color: string;
  strokeColor: string;
  strokeWidth: number;
  align: 'left' | 'center' | 'right';
}

export interface CropConfig {
  enabled: boolean;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ExportConfig {
  colors: number;
  quality: number;
  fps: number;
  dither: boolean;
  repeat: number;
  width: number;
  height: number;
}

export interface Transform2D {
  x: number;
  y: number;
  rotation: number;
  scaleX: number;
  scaleY: number;
}

export interface Keyframe {
  id: string;
  frameIndex: number;
  transform: Transform2D;
}

export interface BezierControlPoints {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export type EasingPreset =
  | 'linear'
  | 'easeInQuad'
  | 'easeOutQuad'
  | 'easeInOutQuad'
  | 'easeInCubic'
  | 'easeOutCubic'
  | 'easeInOutCubic'
  | 'easeInElastic'
  | 'easeOutElastic'
  | 'easeInBounce'
  | 'easeOutBounce'
  | 'custom';

export interface AnimationTrack {
  id: string;
  name: string;
  enabled: boolean;
  startKeyframe: Keyframe;
  endKeyframe: Keyframe;
  startFrame: number;
  endFrame: number;
  easingPreset: EasingPreset;
  customBezier: BezierControlPoints;
}

export interface EditorState {
  frames: Frame[];
  selectedFrameIndex: number;
  captions: Caption[];
  crop: CropConfig;
  exportConfig: ExportConfig;
  isPlaying: boolean;
  playbackSpeed: number;
  currentFrameIndex: number;
  canvasWidth: number;
  canvasHeight: number;
  animationTracks: AnimationTrack[];
  selectedTrackId: string | null;
  showPathPreview: boolean;
}
