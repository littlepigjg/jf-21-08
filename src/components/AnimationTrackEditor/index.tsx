import { useState } from 'react';
import {
  Plus,
  Trash2,
  Play,
  Pause,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronUp,
  Move,
  RotateCw,
  Maximize2,
  Sparkles,
} from 'lucide-react';
import { useEditorStore } from '@/stores/editorStore';
import type { AnimationTrack, EasingPreset, Transform2D } from '@/types';
import {
  EASING_PRESET_LABELS,
  getTrackBezier,
} from '@/utils/keyframeInterpolator';
import { cn } from '@/lib/utils';
import BezierEditor from '@/components/BezierEditor';

interface TransformInputsProps {
  label: string;
  tone: 'green' | 'red';
  transform: Transform2D;
  onChange: (transform: Partial<Transform2D>) => void;
  canvasWidth: number;
  canvasHeight: number;
}

function TransformInputs({
  label,
  tone,
  transform,
  onChange,
  canvasWidth,
  canvasHeight,
}: TransformInputsProps) {
  const colorClasses = {
    green: {
      container: 'border-green-500/30 bg-green-500/5',
      dot: 'bg-green-400',
      text: 'text-green-300',
    },
    red: {
      container: 'border-red-500/30 bg-red-500/5',
      dot: 'bg-red-400',
      text: 'text-red-300',
    },
  }[tone];

  return (
    <div className={cn('rounded-lg p-3 border', colorClasses.container)}>
      <div className="flex items-center gap-1.5 mb-2">
        <div className={cn('w-2 h-2 rounded-full', colorClasses.dot)} />
        <span className={cn('text-xs font-medium', colorClasses.text)}>{label}</span>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Move className="w-3.5 h-3.5 text-slate-500" />
          <div className="grid grid-cols-2 gap-1.5 flex-1">
            <div>
              <label className="text-[10px] text-slate-500 block">X</label>
              <input
                type="number"
                value={Math.round(transform.x)}
                onChange={(e) => onChange({ x: Number(e.target.value) })}
                className="w-full px-2 py-1 bg-slate-900 border border-slate-700 rounded text-xs text-white focus:outline-none focus:border-violet-500"
                min={-canvasWidth}
                max={canvasWidth * 2}
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-500 block">Y</label>
              <input
                type="number"
                value={Math.round(transform.y)}
                onChange={(e) => onChange({ y: Number(e.target.value) })}
                className="w-full px-2 py-1 bg-slate-900 border border-slate-700 rounded text-xs text-white focus:outline-none focus:border-violet-500"
                min={-canvasHeight}
                max={canvasHeight * 2}
              />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <RotateCw className="w-3.5 h-3.5 text-slate-500" />
          <div className="flex-1">
            <label className="text-[10px] text-slate-500 block">旋转 (°)</label>
            <input
              type="number"
              value={Math.round(transform.rotation)}
              onChange={(e) => onChange({ rotation: Number(e.target.value) })}
              className="w-full px-2 py-1 bg-slate-900 border border-slate-700 rounded text-xs text-white focus:outline-none focus:border-violet-500"
              min={-360}
              max={360}
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Maximize2 className="w-3.5 h-3.5 text-slate-500" />
          <div className="grid grid-cols-2 gap-1.5 flex-1">
            <div>
              <label className="text-[10px] text-slate-500 block">缩放 X</label>
              <input
                type="number"
                value={transform.scaleX.toFixed(2)}
                step={0.05}
                onChange={(e) => onChange({ scaleX: Number(e.target.value) })}
                className="w-full px-2 py-1 bg-slate-900 border border-slate-700 rounded text-xs text-white focus:outline-none focus:border-violet-500"
                min={0}
                max={5}
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-500 block">缩放 Y</label>
              <input
                type="number"
                value={transform.scaleY.toFixed(2)}
                step={0.05}
                onChange={(e) => onChange({ scaleY: Number(e.target.value) })}
                className="w-full px-2 py-1 bg-slate-900 border border-slate-700 rounded text-xs text-white focus:outline-none focus:border-violet-500"
                min={0}
                max={5}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface TrackItemProps {
  track: AnimationTrack;
  isSelected: boolean;
  onSelect: () => void;
  isExpanded: boolean;
  onToggleExpand: () => void;
}

function TrackItem({
  track,
  isSelected,
  onSelect,
  isExpanded,
  onToggleExpand,
}: TrackItemProps) {
  const {
    deleteAnimationTrack,
    setTrackEnabled,
    updateAnimationTrack,
    setKeyframeTransform,
    setEasingPreset,
    setCustomBezier,
    setTrackFrameRange,
    frames,
    canvasWidth,
    canvasHeight,
  } = useEditorStore();

  const maxFrame = Math.max(0, frames.length - 1);
  const bezier = getTrackBezier(track);

  return (
    <div
      className={cn(
        'rounded-lg border transition-all',
        isSelected ? 'border-violet-500 bg-violet-500/10' : 'border-slate-700 bg-slate-800/30'
      )}
    >
      <div
        className={cn(
          'flex items-center gap-2 px-3 py-2 cursor-pointer',
          isSelected && 'bg-violet-500/5'
        )}
        onClick={onSelect}
      >
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleExpand();
          }}
          className="p-0.5 hover:bg-slate-700 rounded text-slate-400 hover:text-white transition-colors"
        >
          {isExpanded ? (
            <ChevronUp className="w-3.5 h-3.5" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5" />
          )}
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            setTrackEnabled(track.id, !track.enabled);
          }}
          className={cn(
            'p-1 rounded transition-colors',
            track.enabled
              ? 'text-emerald-400 hover:bg-emerald-500/20'
              : 'text-slate-500 hover:bg-slate-700 hover:text-slate-300'
          )}
        >
          {track.enabled ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
        </button>

        <input
          type="text"
          value={track.name}
          onChange={(e) => updateAnimationTrack(track.id, { name: e.target.value })}
          onClick={(e) => e.stopPropagation()}
          className="flex-1 px-2 py-1 bg-transparent border border-transparent hover:border-slate-600 focus:border-violet-500 rounded text-sm text-white focus:outline-none transition-colors"
        />

        <span className="text-[10px] text-slate-500 font-mono">
          {track.startFrame + 1}-{track.endFrame + 1}
        </span>

        <button
          onClick={(e) => {
            e.stopPropagation();
            deleteAnimationTrack(track.id);
          }}
          className="p-1 hover:bg-red-500/20 text-slate-400 hover:text-red-400 rounded transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {isExpanded && (
        <div className="px-3 pb-3 space-y-3 border-t border-slate-700/50 pt-3">
          <div>
            <label className="text-xs text-slate-400 block mb-1.5">
              帧范围: {track.startFrame + 1} - {track.endFrame + 1}
            </label>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min={0}
                max={maxFrame}
                value={track.startFrame}
                onChange={(e) =>
                  setTrackFrameRange(
                    track.id,
                    Number(e.target.value),
                    Math.max(Number(e.target.value), track.endFrame)
                  )
                }
                className="flex-1 h-1 bg-slate-700 rounded-full appearance-none cursor-pointer accent-green-500"
              />
              <input
                type="range"
                min={0}
                max={maxFrame}
                value={track.endFrame}
                onChange={(e) =>
                  setTrackFrameRange(
                    track.id,
                    Math.min(track.startFrame, Number(e.target.value)),
                    Number(e.target.value)
                  )
                }
                className="flex-1 h-1 bg-slate-700 rounded-full appearance-none cursor-pointer accent-red-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-2">
            <TransformInputs
              label="起始关键帧"
              tone="green"
              transform={track.startKeyframe.transform}
              onChange={(t) => setKeyframeTransform(track.id, 'start', t)}
              canvasWidth={canvasWidth}
              canvasHeight={canvasHeight}
            />
            <TransformInputs
              label="结束关键帧"
              tone="red"
              transform={track.endKeyframe.transform}
              onChange={(t) => setKeyframeTransform(track.id, 'end', t)}
              canvasWidth={canvasWidth}
              canvasHeight={canvasHeight}
            />
          </div>

          <div>
            <label className="text-xs text-slate-400 block mb-1.5 flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              缓动函数
            </label>
            <select
              value={track.easingPreset}
              onChange={(e) => setEasingPreset(track.id, e.target.value as EasingPreset)}
              className="w-full px-2 py-1.5 bg-slate-900 border border-slate-700 rounded text-sm text-white focus:outline-none focus:border-violet-500"
            >
              {(Object.keys(EASING_PRESET_LABELS) as EasingPreset[]).map((preset) => (
                <option key={preset} value={preset}>
                  {EASING_PRESET_LABELS[preset]}
                </option>
              ))}
            </select>
          </div>

          {track.easingPreset === 'custom' && (
            <div>
              <label className="text-xs text-slate-400 block mb-1.5">自定义贝塞尔曲线</label>
              <BezierEditor
                value={track.customBezier}
                onChange={(b) => setCustomBezier(track.id, b)}
                width={248}
                height={180}
              />
            </div>
          )}

          {track.easingPreset !== 'custom' && (
            <div className="flex items-center justify-center py-2 bg-slate-900/50 rounded border border-slate-700/50">
              <div className="text-[10px] text-slate-500 font-mono">
                bezier({bezier.x1.toFixed(2)}, {bezier.y1.toFixed(2)}, {bezier.x2.toFixed(2)}, {bezier.y2.toFixed(2)})
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function AnimationTrackEditor() {
  const {
    animationTracks,
    selectedTrackId,
    setSelectedTrackId,
    addAnimationTrack,
    showPathPreview,
    setShowPathPreview,
    frames,
    isPlaying,
    setIsPlaying,
  } = useEditorStore();

  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <button
          onClick={() => addAnimationTrack()}
          disabled={frames.length === 0}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          添加动画轨道
        </button>
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          disabled={frames.length === 0}
          className={cn(
            'p-2 rounded-lg transition-colors',
            isPlaying
              ? 'bg-amber-500/20 text-amber-400 hover:bg-amber-500/30'
              : 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30',
            frames.length === 0 && 'opacity-50 cursor-not-allowed'
          )}
        >
          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
        </button>
        <button
          onClick={() => setShowPathPreview(!showPathPreview)}
          className={cn(
            'p-2 rounded-lg transition-colors',
            showPathPreview
              ? 'bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30'
              : 'bg-slate-700/50 text-slate-400 hover:bg-slate-700 hover:text-white'
          )}
          title="显示/隐藏路径预览"
        >
          {showPathPreview ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
        </button>
      </div>

      {animationTracks.length === 0 ? (
        <div className="py-8 text-center border border-dashed border-slate-700 rounded-lg">
          <div className="text-3xl mb-2">✨</div>
          <p className="text-xs text-slate-500">
            {frames.length === 0 ? '请先导入素材' : '点击上方按钮添加动画轨道'}
          </p>
        </div>
      ) : (
        <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1">
          {animationTracks.map((track) => (
            <TrackItem
              key={track.id}
              track={track}
              isSelected={selectedTrackId === track.id}
              onSelect={() => setSelectedTrackId(track.id)}
              isExpanded={expandedIds.has(track.id)}
              onToggleExpand={() => toggleExpand(track.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
