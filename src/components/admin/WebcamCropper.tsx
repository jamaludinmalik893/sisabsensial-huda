
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
  const [videoDims, setVideoDims] = useState({ width: 640, height: 480 });
  const [crop, setCrop] = useState({
    x: 100, y: 60, width: 240, height: 240,
    dragging: false,
    relX: 0, relY: 0,
    resizing: false,
    resizeDir: "" as "br"|"tl"|"",
  });

  // After video loaded, sync dimension
  useEffect(() => {
    const vid = videoRef.current;
    if (!vid) return;
    const handleLoaded = () => {
      setVideoDims({ width: vid.videoWidth, height: vid.videoHeight });
      setCrop((c) => ({
        ...c,
        x: Math.max(0, vid.videoWidth/2-vid.videoHeight/2),
        y: 0,
        width: Math.min(vid.videoWidth, vid.videoHeight),
        height: Math.min(vid.videoWidth, vid.videoHeight)
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

  // Drag crop
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    setCrop(c => ({
      ...c,
      dragging: true,
      relX: e.clientX - c.x,
      relY: e.clientY - c.y
    }));
  };
  const handleMouseUp = () => setCrop(c => ({ ...c, dragging: false, resizing: false, resizeDir: "" }));
  const handleMouseMove = (e: MouseEvent) => {
    setCrop(c => {
      if (c.dragging) {
        // move crop box
        let nx = e.clientX - c.relX;
        let ny = e.clientY - c.relY;
        nx = Math.max(0, Math.min(nx, videoDims.width - c.width));
        ny = Math.max(0, Math.min(ny, videoDims.height - c.height));
        return { ...c, x: nx, y: ny };
      }
      if (c.resizing && c.resizeDir === 'br') {
        // resize crop from bottom-right
        let nw = Math.max(MIN_SIZE, Math.min(e.clientX - c.x, videoDims.width - c.x));
        let nh = Math.max(MIN_SIZE, Math.min(e.clientY - c.y, videoDims.height - c.y));
        // constrain to square
        let side = Math.min(nw, nh, videoDims.width - c.x, videoDims.height - c.y);
        return { ...c, width: side, height: side };
      }
      if (c.resizing && c.resizeDir === 'tl') {
        // resize from top-left (optional)
        return c;
      }
      return c;
    });
  };
  // handle resize on bottom-right corner
  const handleResizeDown = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    setCrop(c => ({ ...c, resizing: true, resizeDir: "br" }));
  };
  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
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

  return (
    <div className="relative w-full flex flex-col items-center" style={{height: videoDims.height}}>
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        className="rounded-lg"
        style={{
          width: videoDims.width,
          height: videoDims.height,
          background: '#111'
        }}
      />
      {/* Crop overlay */}
      <div
        className="absolute border-4 border-yellow-400 bg-yellow-200/10"
        role="presentation"
        style={{
          left: crop.x,
          top: crop.y,
          width: crop.width,
          height: crop.height,
          cursor: crop.dragging ? 'grabbing' : 'grab',
          borderRadius: 10,
          boxShadow: '0 0 0 150vw rgba(0,0,0,0.4) inset'
        }}
        onMouseDown={handleMouseDown}
      >
        {/* Resize handle: bottom right */}
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
      <Button className="mt-4 w-full" onClick={handleCapture} disabled={loading}>
        {loading ? "Mengupload..." : "Ambil & Crop Foto"}
      </Button>
      <div className="text-xs text-gray-500 mt-2">Geser kotak kuning untuk memilih area wajah, lalu klik "Ambil &amp; Crop Foto".</div>
    </div>
  );
};

export default WebcamCropper;
