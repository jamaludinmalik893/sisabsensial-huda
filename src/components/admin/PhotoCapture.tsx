import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Camera, Upload, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import WebcamCropper from './WebcamCropper';

interface PhotoCaptureProps {
  onPhotoCapture: (photoUrl: string) => void;
  currentPhotoUrl?: string;
}

const PhotoCapture: React.FC<PhotoCaptureProps> = ({ onPhotoCapture, currentPhotoUrl }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<'idle' | 'camera' | 'upload'>('idle');
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadPreview, setUploadPreview] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Reset state setiap dialog dibuka/ditutup
  useEffect(() => {
    if (isOpen) {
      setMode('idle');
      setCapturedPhoto(null);
      setUploadPreview(null);
    } else {
      stopCamera();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // Hentikan kamera ketika mode berubah (bukan kamera)
  useEffect(() => {
    if (mode !== 'camera') stopCamera();
    // jika mode camera, nyalakan
    if (mode === 'camera') startCamera();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  // Kamera: gunakan resolusi terbaik
  const startCamera = useCallback(async () => {
    try {
      const constraints: MediaStreamConstraints = {
        video: {
          width: { ideal: 1920 },
          height: { ideal: 1080 },
          facingMode: 'user'
        }
      };
      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);
      // Tidak perlu set srcObject, itu diatur oleh WebcamCropper
    } catch (error) {
      console.error('Error accessing camera:', error);
      toast({
        title: "Error",
        description: "Tidak dapat mengakses kamera",
        variant: "destructive"
      });
      setMode('idle');
    }
  }, [toast]);

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
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

  // Upload dari image/file input
  const onFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Cek preview
    const reader = new FileReader();
    reader.onload = function (evt) {
      if (evt.target?.result) setUploadPreview(evt.target.result as string);
    };
    reader.readAsDataURL(file);
  }, []);

  // Upload ke supabase
  const uploadPhoto = useCallback(async (file: string | File, fileName: string) => {
    setUploading(true);
    try {
      let blob: Blob;
      if (typeof file === 'string') {
        // base64 (webcam)
        const response = await fetch(file);
        blob = await response.blob();
      } else {
        // file asli
        blob = file;
      }
      const fileToUpload = new File([blob], fileName, { type: 'image/jpeg' });

      const fileExt = fileToUpload.name.split('.').pop();
      const filePath = `student-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('student-photos')
        .upload(filePath, fileToUpload, {
          cacheControl: '3600',
          upsert: false
        });

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
        description: "Gagal mengupload foto. Silakan coba lagi.",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
      setCapturedPhoto(null);
      setUploadPreview(null);
      setMode('idle');
    }
  }, [onPhotoCapture, stopCamera, toast]);

  const handleClose = useCallback(() => {
    setIsOpen(false);
    // camera akan berhenti via efek mode/isOpen
  }, []);

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
            <DialogDescription>
              Pilih cara untuk menambahkan foto siswa
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {/* Mode awal */}
            {mode === 'idle' && (
              <div className="flex flex-col gap-4">
                <Button variant="default" size="lg" onClick={() => setMode('camera')} className="w-full flex items-center justify-center">
                  <Camera className="h-5 w-5 mr-2" />
                  Ambil Foto Via Webcam
                </Button>
                <Button variant="outline" size="lg" onClick={() => setMode('upload')} className="w-full flex items-center justify-center">
                  <Upload className="h-5 w-5 mr-2" />
                  Upload File Foto
                </Button>
              </div>
            )}

            {/* Mode webcam */}
            {(mode === 'camera') && !capturedPhoto && (
              <WebcamCropper
                stream={stream}
                loading={uploading}
                onCapture={(croppedDataUrl) => setCapturedPhoto(croppedDataUrl)}
              />
            )}
            {/* Setelah crop webcam */}
            {(capturedPhoto != null && mode === 'camera') && (
              <div className="space-y-3 flex flex-col items-center">
                <img
                  src={capturedPhoto}
                  alt="Captured"
                  className="w-full rounded-lg"
                />
                <div className="flex gap-3 w-full">
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
                <Button
                  type="button"
                  variant="link"
                  className="mt-2"
                  onClick={() => { setMode('idle'); setCapturedPhoto(null); }}
                  disabled={uploading}
                >
                  &larr; Kembali
                </Button>
              </div>
            )}
            {/* Mode upload file */}
            {(mode === 'upload') && (
              <div className="flex flex-col items-center gap-6">
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  className="hidden"
                  onChange={onFileChange}
                  disabled={uploading}
                />
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full flex items-center justify-center"
                  disabled={uploading}
                >
                  <Upload className="h-5 w-5 mr-2" />
                  Pilih File Foto
                </Button>
                {uploadPreview && (
                  <div className="w-full flex flex-col items-center gap-3">
                    <img src={uploadPreview} alt="Preview upload" className="w-full rounded-lg" />
                    <Button
                      onClick={() => {
                        if (fileInputRef.current?.files?.[0])
                          uploadPhoto(fileInputRef.current.files[0], `upload-${Date.now()}.jpg`)
                      }}
                      className="w-full"
                      disabled={uploading}
                    >
                      {uploading ? "Mengupload..." : "Gunakan Foto"}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setUploadPreview(null);
                        if (fileInputRef.current) fileInputRef.current.value = '';
                      }}
                      disabled={uploading}
                    >
                      Pilih Ulang
                    </Button>
                  </div>
                )}
                <Button
                  type="button"
                  variant="link"
                  className="mt-2"
                  onClick={() => setMode('idle')}
                  disabled={uploading}
                >
                  &larr; Kembali
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PhotoCapture;
