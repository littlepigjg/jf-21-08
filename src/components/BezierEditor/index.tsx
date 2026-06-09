import { useEffect, useRef, useState, useCallback } from 'react';
import type { BezierControlPoints } from '@/types';
import { getBezierPoints } from '@/utils/keyframeInterpolator';

interface BezierEditorProps {
  value: BezierControlPoints;
  onChange: (value: BezierControlPoints) => void;
  width?: number;
  height?: number;
}

type DraggingPoint = 'p1' | 'p2' | null;

export default function BezierEditor({
  value,
  onChange,
  width = 240,
  height = 200,
}: BezierEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dragging, setDragging] = useState<DraggingPoint>(null);
  const padding = 20;

  const plotWidth = width - padding * 2;
  const plotHeight = height - padding * 2;

  const toCanvasX = useCallback(
    (t: number) => padding + t * plotWidth,
    [plotWidth]
  );
  const toCanvasY = useCallback(
    (v: number) => padding + (1 - v) * plotHeight,
    [plotHeight]
  );
  const fromCanvasX = useCallback(
    (x: number) => Math.max(0, Math.min(1, (x - padding) / plotWidth)),
    [plotWidth]
  );
  const fromCanvasY = useCallback(
    (y: number) => Math.max(-0.5, Math.min(1.5, 1 - (y - padding) / plotHeight)),
    [plotHeight]
  );

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, width, height);

    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, width, height);

    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const t = i / 4;
      ctx.beginPath();
      ctx.moveTo(toCanvasX(t), padding);
      ctx.lineTo(toCanvasX(t), height - padding);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(padding, toCanvasY(t));
      ctx.lineTo(width - padding, toCanvasY(t));
      ctx.stroke();
    }

    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(toCanvasX(0), toCanvasY(0));
    ctx.lineTo(toCanvasX(1), toCanvasY(1));
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(toCanvasX(0), toCanvasY(0));
    ctx.lineTo(toCanvasX(value.x1), toCanvasY(value.y1));
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(toCanvasX(1), toCanvasY(1));
    ctx.lineTo(toCanvasX(value.x2), toCanvasY(value.y2));
    ctx.stroke();

    const points = getBezierPoints(value, 100);
    ctx.strokeStyle = '#8b5cf6';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    points.forEach((p, i) => {
      const x = toCanvasX(p.x);
      const y = toCanvasY(p.y);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    ctx.fillStyle = '#1e293b';
    ctx.strokeStyle = '#22c55e';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(toCanvasX(0), toCanvasY(0), 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#1e293b';
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(toCanvasX(1), toCanvasY(1), 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#22c55e';
    ctx.beginPath();
    ctx.arc(toCanvasX(value.x1), toCanvasY(value.y1), 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#16a34a';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(toCanvasX(value.x2), toCanvasY(value.y2), 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#dc2626';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#94a3b8';
    ctx.font = '10px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('0', toCanvasX(0), height - 5);
    ctx.fillText('1', toCanvasX(1), height - 5);
    ctx.textAlign = 'right';
    ctx.fillText('0', padding - 4, toCanvasY(0) + 3);
    ctx.fillText('1', padding - 4, toCanvasY(1) + 3);
  }, [value, width, height, toCanvasX, toCanvasY]);

  useEffect(() => {
    draw();
  }, [draw]);

  const getMousePos = (e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    const pos = getMousePos(e);
    const p1x = toCanvasX(value.x1);
    const p1y = toCanvasY(value.y1);
    const p2x = toCanvasX(value.x2);
    const p2y = toCanvasY(value.y2);

    const dist1 = Math.hypot(pos.x - p1x, pos.y - p1y);
    const dist2 = Math.hypot(pos.x - p2x, pos.y - p2y);

    if (dist1 < 12) {
      setDragging('p1');
    } else if (dist2 < 12) {
      setDragging('p2');
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragging) return;
    const pos = getMousePos(e);
    const x = fromCanvasX(pos.x);
    const y = fromCanvasY(pos.y);

    if (dragging === 'p1') {
      onChange({ ...value, x1: x, y1: y });
    } else {
      onChange({ ...value, x2: x, y2: y });
    }
  };

  const handleMouseUp = () => {
    setDragging(null);
  };

  useEffect(() => {
    const handleGlobalUp = () => setDragging(null);
    window.addEventListener('mouseup', handleGlobalUp);
    return () => window.removeEventListener('mouseup', handleGlobalUp);
  }, []);

  return (
    <div className="inline-block">
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className="rounded-lg cursor-crosshair border border-slate-700"
        style={{ userSelect: 'none' }}
      />
      <div className="flex items-center justify-between mt-2 text-xs text-slate-400 font-mono">
        <div>
          <span className="text-green-400">●</span> P1: ({value.x1.toFixed(2)}, {value.y1.toFixed(2)})
        </div>
        <div>
          <span className="text-red-400">●</span> P2: ({value.x2.toFixed(2)}, {value.y2.toFixed(2)})
        </div>
      </div>
    </div>
  );
}
