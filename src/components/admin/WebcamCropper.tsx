
import React, { useRef, useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";

interface WebcamCropperProps {
  stream: MediaStream | null;
  onCapture: (croppedDataUrl: string) => void;
  loading?: boolean;
}
const MIN_SIZE = 160;

const WebcamCropper: React.FC<WebcamCropperProps> = ({
  stream, onCapture, loading
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [videoDims, setVideoDims] = useState({ width: 640, height: 480 });
  const [crop, setCrop] = useState({
    x: 100, y: 60, width: 240, height: 240,
    dragging: false,
    relX: 0, relY: 0,
    resizing: false,
    resizeDir: "" as "br"|"tl"|"",
    // koord mouse relatif crop
    mouseStartX: 0,
    mouseStartY: 0,
    cropStartX: 0,
    cropStartY: 0,
    cropStartW: 0,
    cropStartH: 0,
  });

  // After video loaded, sync dimension
  useEffect(() => {
    const vid = videoRef.current;
    if (!vid) return;
    const handleLoaded = () => {
      const w = vid.videoWidth;
      const h = vid.videoHeight;
      setVideoDims({ width: w, height: h });
      setCrop((c) => ({
        ...c,
        x: Math.max(0, w/2-h/2),
        y: 0,
        width: Math.min(w, h),
        height: Math.min(w, h)
      }));
    };
    vid.addEventListener('loadedmetadata', handleLoaded);
    return () => {
      vid.removeEventListener('loadedmetadata', handleLoaded);
    };
  }, [stream]);

  // Attach stream to video
  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
      videoRef.current.play();
    }
  }, [stream]);

  // --- New: handle crop movement/resize with proporsional container ---
  const getOffsetInContainer = (clientX: number, clientY: number) => {
    const container = containerRef.current;
    if (!container) return { x: 0, y: 0 };
    const rect = container.getBoundingClientRect();
    return {
      x: ((clientX - rect.left) / rect.width) * videoDims.width,
      y: ((clientY - rect.top) / rect.height) * videoDims.height
    };
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    // Kotak utama (geser)
    e.preventDefault();
    e.stopPropagation();
    const point = getOffsetInContainer(e.clientX, e.clientY);
    setCrop(c => ({
      ...c,
      dragging: true,
      relX: point.x - c.x,
      relY: point.y - c.y,
      mouseStartX: point.x,
      mouseStartY: point.y,
      cropStartX: c.x,
      cropStartY: c.y,
      cropStartW: c.width,
      cropStartH: c.height,
    }));
  };

  const handleResizeDown = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    const point = getOffsetInContainer(e.clientX, e.clientY);
    setCrop(c => ({
      ...c,
      resizing: true,
      resizeDir: "br",
      mouseStartX: point.x,
      mouseStartY: point.y,
      cropStartW: c.width,
      cropStartH: c.height,
      cropStartX: c.x,
      cropStartY: c.y,
    }));
  };

  useEffect(() => {
    function onMouseMove(e: MouseEvent) {
      // Pastikan container selalu ada
      if (!containerRef.current) return;
      const point = getOffsetInContainer(e.clientX, e.clientY);
      setCrop(c => {
        // Resize sudut kanan bawah
        if (c.resizing && c.resizeDir === 'br') {
          let delta = Math.min(point.x - c.cropStartX, point.y - c.cropStartY);
          let newSize = Math.max(MIN_SIZE, Math.min(delta, videoDims.width - c.cropStartX, videoDims.height - c.cropStartY));
          return {
            ...c,
            width: newSize,
            height: newSize,
          };
        }
        // Drag kotak crop
        if (c.dragging) {
          let nx = point.x - c.relX;
          let ny = point.y - c.relY;
          nx = Math.max(0, Math.min(nx, videoDims.width - c.width));
          ny = Math.max(0, Math.min(ny, videoDims.height - c.height));
          return {
            ...c,
            x: nx,
            y: ny,
          };
        }
        return c;
      });
    }

    function onMouseUp() {
      setCrop(c => ({
        ...c,
        dragging: false,
        resizing: false,
        resizeDir: ""
      }));
    }

    // Attach to window for consistent drag/resize
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
    // eslint-disable-next-line
  }, [videoDims]);

  // Capture area
  const handleCapture = useCallback(() => {
    if (!videoRef.current) return;
    const c = crop;
    const canvas = document.createElement("canvas");
    canvas.width = c.width;
    canvas.height = c.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(videoRef.current, c.x, c.y, c.width, c.height, 0, 0, c.width, c.height);
    const url = canvas.toDataURL("image/jpeg", 0.95);
    onCapture(url);
  }, [crop, onCapture]);

  // Responsive max width for preview, auto aspect ratio
  const aspect = videoDims.width && videoDims.height
    ? (videoDims.width / videoDims.height)
    : (4 / 3);

  return (
    <div
      ref={containerRef}
      className="relative w-full max-w-lg mx-auto flex flex-col items-center touch-none select-none"
      style={{
        aspectRatio: `${videoDims.width} / ${videoDims.height}`,
        background: "#222",
        userSelect: "none"
      }}
    >
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        className="rounded-lg object-contain w-full h-full"
        style={{
          width: "100%",
          height: "100%",
          display: stream ? "block" : "none",
          objectFit: "contain",
          aspectRatio: `${videoDims.width} / ${videoDims.height}`,
          background: "#222"
        }}
      />
      {/* Crop overlay */}
      {stream && (
        <div
          className="absolute border-4 border-yellow-400 bg-yellow-200/10 transition-none"
          role="presentation"
          style={{
            left: `${(crop.x / videoDims.width) * 100}%`,
            top: `${(crop.y / videoDims.height) * 100}%`,
            width: `${(crop.width / videoDims.width) * 100}%`,
            height: `${(crop.height / videoDims.height) * 100}%`,
            cursor: crop.dragging ? 'grabbing' : 'grab',
            borderRadius: 10,
            boxShadow: '0 0 0 200vw rgba(0,0,0,0.4) inset',
            transition: 'none',
            userSelect: "none"
          }}
          onMouseDown={handleMouseDown}
        >
          <div
            style={{
              position: 'absolute',
              right: -10,
              bottom: -10,
              width: 22,
              height: 22,
              background: 'rgba(255,255,0,0.9)',
              borderRadius: '50%',
              border: '2px solid #f59e42',
              cursor: 'nwse-resize',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            onMouseDown={handleResizeDown}
          >
            <svg width="12" height="12"><rect width="12" height="12" rx="2" fill="#FEF08A" stroke="#a16207" strokeWidth="1"/></svg>
          </div>
        </div>
      )}
      <Button className="mt-4 w-full" onClick={handleCapture} disabled={loading}>
        {loading ? "Mengupload..." : "Ambil & Crop Foto"}
      </Button>
      <div className="text-xs text-gray-500 mt-2 text-center">Geser kotak kuning untuk memilih area wajah, lalu klik "Ambil &amp; Crop Foto".</div>
    </div>
  );
};

export default WebcamCropper;

