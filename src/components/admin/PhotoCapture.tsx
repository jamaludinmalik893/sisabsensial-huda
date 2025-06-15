
import React, { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Camera, Upload, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface PhotoCaptureProps {
  onPhotoCapture: (photoUrl: string) => void;
  currentPhotoUrl?: string;
}

const PhotoCapture: React.FC<PhotoCaptureProps> = ({ onPhotoCapture, currentPhotoUrl }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isCamera, setIsCamera] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const startCamera = useCallback(async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 640, height: 480 } 
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setIsCamera(true);
    } catch (error) {
      console.error('Error accessing camera:', error);
      toast({
        title: "Error",
        description: "Tidak dapat mengakses kamera",
        variant: "destructive"
      });
    }
  }, [toast]);

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsCamera(false);
    setCapturedPhoto(null);
  }, [stream]);

  const capturePhoto = useCallback(() => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0);
        const photoDataUrl = canvas.toDataURL('image/jpeg', 0.8);
        setCapturedPhoto(photoDataUrl);
      }
    }
  }, []);

  const uploadPhoto = useCallback(async (file: File | string, fileName: string) => {
    setUploading(true);
    try {
      let fileToUpload: File;
      
      if (typeof file === 'string') {
        // Convert base64 to blob
        const response = await fetch(file);
        const blob = await response.blob();
        fileToUpload = new File([blob], fileName, { type: 'image/jpeg' });
      } else {
        fileToUpload = file;
      }

      const fileExt = fileToUpload.name.split('.').pop();
      const filePath = `${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('student-photos')
        .upload(filePath, fileToUpload);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('student-photos')
        .getPublicUrl(filePath);

      onPhotoCapture(data.publicUrl);
      setIsOpen(false);
      stopCamera();
      
      toast({
        title: "Sukses",
        description: "Foto berhasil diupload",
      });
    } catch (error) {
      console.error('Error uploading photo:', error);
      toast({
        title: "Error",
        description: "Gagal mengupload foto",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  }, [onPhotoCapture, stopCamera, toast]);

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      uploadPhoto(file, file.name);
    }
  }, [uploadPhoto]);

  const handleClose = useCallback(() => {
    setIsOpen(false);
    stopCamera();
  }, [stopCamera]);

  return (
    <>
      <div className="flex items-center gap-2">
        {currentPhotoUrl && (
          <img 
            src={currentPhotoUrl} 
            alt="Current photo" 
            className="w-16 h-16 rounded-full object-cover border"
          />
        )}
        <Button type="button" variant="outline" onClick={() => setIsOpen(true)}>
          <Camera className="h-4 w-4 mr-2" />
          {currentPhotoUrl ? 'Ganti Foto' : 'Tambah Foto'}
        </Button>
      </div>

      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Tambah Foto Siswa</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {!isCamera && !capturedPhoto && (
              <div className="space-y-3">
                <Button 
                  onClick={startCamera} 
                  className="w-full"
                  disabled={uploading}
                >
                  <Camera className="h-4 w-4 mr-2" />
                  Gunakan Kamera
                </Button>
                
                <Button 
                  variant="outline" 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full"
                  disabled={uploading}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Pilih File
                </Button>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>
            )}

            {isCamera && !capturedPhoto && (
              <div className="space-y-3">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full rounded-lg"
                />
                <canvas ref={canvasRef} className="hidden" />
                <div className="flex gap-2">
                  <Button onClick={capturePhoto} className="flex-1">
                    <Camera className="h-4 w-4 mr-2" />
                    Ambil Foto
                  </Button>
                  <Button variant="outline" onClick={stopCamera}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {capturedPhoto && (
              <div className="space-y-3">
                <img 
                  src={capturedPhoto} 
                  alt="Captured" 
                  className="w-full rounded-lg"
                />
                <div className="flex gap-2">
                  <Button 
                    onClick={() => uploadPhoto(capturedPhoto, `photo-${Date.now()}.jpg`)}
                    className="flex-1"
                    disabled={uploading}
                  >
                    {uploading ? 'Mengupload...' : 'Gunakan Foto'}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setCapturedPhoto(null)}
                    disabled={uploading}
                  >
                    Ambil Ulang
                  </Button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PhotoCapture;
