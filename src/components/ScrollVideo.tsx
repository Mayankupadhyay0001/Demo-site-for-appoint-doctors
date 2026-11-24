import React, { useEffect, useRef, useState } from 'react';
import { HERO_VIDEO_URL, SANCTUARY_IMAGE } from '../data/initialData';

interface ScrollVideoProps {
  dimmed?: boolean;
}

export const ScrollVideo: React.FC<ScrollVideoProps> = ({ dimmed = false }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const framesRef = useRef<ImageBitmap[]>([]);
  const targetProgressRef = useRef(0);
  const smoothedProgressRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const lastDrawnFrameRef = useRef<number>(-1);

  const [hasVideoFrame, setHasVideoFrame] = useState(false);
  const [framesReady, setFramesReady] = useState(false);

  // Track scroll progress 0..1
  useEffect(() => {
    const updateTarget = () => {
      const maxScroll = Math.max(
        1,
        document.documentElement.scrollHeight - window.innerHeight
      );
      const raw = window.scrollY / maxScroll;
      targetProgressRef.current = Math.min(1, Math.max(0, raw));
    };

    updateTarget();
    window.addEventListener('scroll', updateTarget, { passive: true });
    window.addEventListener('resize', updateTarget, { passive: true });
    return () => {
      window.removeEventListener('scroll', updateTarget);
      window.removeEventListener('resize', updateTarget);
    };
  }, []);

  // Extract frame cache offscreen after visible video loads data + 300ms yield
  useEffect(() => {
    let cancelled = false;
    let yieldTimer: number | null = null;
    const offscreen = document.createElement('video');
    offscreen.crossOrigin = 'anonymous';
    offscreen.muted = true;
    offscreen.playsInline = true;
    offscreen.preload = 'auto';

    const startExtraction = () => {
      if (cancelled) return;
      offscreen.src = HERO_VIDEO_URL;
      offscreen.load();
    };

    const handleVisibleLoaded = () => {
      setHasVideoFrame(true);
      yieldTimer = window.setTimeout(startExtraction, 300);
    };

    const visibleVideo = videoRef.current;
    if (visibleVideo) {
      if (visibleVideo.readyState >= 2) {
        handleVisibleLoaded();
      } else {
        visibleVideo.addEventListener('loadeddata', handleVisibleLoaded, { once: true });
      }
    }

    const extractFrames = async () => {
      const duration = offscreen.duration;
      if (!duration || !isFinite(duration)) return;

      const totalFrames = Math.min(90, Math.max(24, Math.round(duration * 12)));
      const sourceW = offscreen.videoWidth || 1280;
      const sourceH = offscreen.videoHeight || 720;
      const scale = Math.min(1, 960 / sourceW);
      const targetW = Math.round(sourceW * scale);
      const targetH = Math.round(sourceH * scale);

      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = targetW;
      tempCanvas.height = targetH;
      const tempCtx = tempCanvas.getContext('2d');
      if (!tempCtx) return;

      const bitmaps: ImageBitmap[] = [];
      try {
        for (let i = 0; i < totalFrames; i++) {
          if (cancelled) break;
          const time = (i / Math.max(1, totalFrames - 1)) * Math.max(0.05, duration - 0.05);
          offscreen.currentTime = time;
          await new Promise<void>((resolve) => {
            const onSeeked = () => {
              offscreen.removeEventListener('seeked', onSeeked);
              resolve();
            };
            offscreen.addEventListener('seeked', onSeeked, { once: true });
            window.setTimeout(resolve, 250);
          });
          if (cancelled) break;
          tempCtx.drawImage(offscreen, 0, 0, targetW, targetH);
          const bmp = await createImageBitmap(tempCanvas);
          bitmaps.push(bmp);
        }

        if (!cancelled && bitmaps.length > 8) {
          framesRef.current.forEach((b) => b.close?.());
          framesRef.current = bitmaps;
          setFramesReady(true);
        } else {
          bitmaps.forEach((b) => b.close?.());
        }
      } catch {
        // Fallback smoothly to native video seeking if CORS taints canvas
        bitmaps.forEach((b) => b.close?.());
      }
    };

    offscreen.addEventListener('loadeddata', extractFrames, { once: true });

    return () => {
      cancelled = true;
      if (yieldTimer) window.clearTimeout(yieldTimer);
      visibleVideo?.removeEventListener('loadeddata', handleVisibleLoaded);
      offscreen.removeEventListener('loadeddata', extractFrames);
      offscreen.src = '';
    };
  }, []);

  // Animation loop: lerp smoothed progress and draw canvas or seek video
  useEffect(() => {
    const drawCover = (
      ctx: CanvasRenderingContext2D,
      source: ImageBitmap,
      cw: number,
      ch: number
    ) => {
      const sw = source.width;
      const sh = source.height;
      const scale = Math.max(cw / sw, ch / sh);
      const dw = sw * scale;
      const dh = sh * scale;
      const dx = (cw - dw) / 2;
      const dy = (ch - dh) / 2;
      ctx.drawImage(source, dx, dy, dw, dh);
    };

    const tick = () => {
      const target = targetProgressRef.current;
      smoothedProgressRef.current += (target - smoothedProgressRef.current) * 0.12;
      const smoothed = smoothedProgressRef.current;

      const frames = framesRef.current;
      const canvas = canvasRef.current;

      if (framesReady && frames.length > 0 && canvas) {
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const w = Math.floor(window.innerWidth * dpr);
        const h = Math.floor(window.innerHeight * dpr);
        if (canvas.width !== w || canvas.height !== h) {
          canvas.width = w;
          canvas.height = h;
        }
        const frameIdx = Math.min(
          frames.length - 1,
          Math.max(0, Math.round(smoothed * (frames.length - 1)))
        );
        if (frameIdx !== lastDrawnFrameRef.current) {
          const ctx = canvas.getContext('2d');
          if (ctx) {
            drawCover(ctx, frames[frameIdx], w, h);
            lastDrawnFrameRef.current = frameIdx;
          }
        }
      } else {
        const video = videoRef.current;
        if (video && video.duration && isFinite(video.duration) && !video.seeking) {
          const desired = smoothed * Math.max(0.05, video.duration - 0.05);
          if (Math.abs(video.currentTime - desired) > 0.04) {
            video.currentTime = desired;
          }
        }
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [framesReady]);

  return (
    <div
      className="fixed inset-0 z-0 overflow-hidden bg-[#0a0a0a] pointer-events-none select-none"
      aria-hidden="true"
    >
      {/* Layer 1: Poster fallback image */}
      <img
        src={SANCTUARY_IMAGE}
        alt=""
        referrerPolicy="no-referrer"
        className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${
          hasVideoFrame || framesReady ? 'opacity-0' : 'opacity-65'
        }`}
      />

      {/* Layer 2: Scroll-scrubbed video fallback */}
      <video
        ref={videoRef}
        src={HERO_VIDEO_URL}
        muted
        playsInline
        preload="auto"
        crossOrigin="anonymous"
        className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${
          hasVideoFrame && !framesReady ? 'opacity-100' : 'opacity-0'
        }`}
      />

      {/* Layer 3: High-FPS ImageBitmap canvas scrub layer */}
      <canvas
        ref={canvasRef}
        className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${
          framesReady ? 'opacity-100' : 'opacity-0'
        }`}
      />

      {/* Contrast & Portal Dimming Scrim */}
      <div
        className={`absolute inset-0 transition-opacity duration-500 ${
          dimmed
            ? 'bg-[#0a0a0a]/92 backdrop-blur-2xl'
            : 'bg-gradient-to-b from-black/55 via-black/35 to-[#0a0a0a]/90'
        }`}
      />
    </div>
  );
};
