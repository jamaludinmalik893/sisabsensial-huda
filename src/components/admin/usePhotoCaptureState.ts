
import { useState, useRef, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

// This hook provides all the state AND behavior needed for capturing/uploading photos
export function usePhotoCaptureState(onPhotoCapture: (photoUrl: string) => void) {
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

  useEffect(() => {
    if (mode !== 'camera') stopCamera();
    if (mode === 'camera') startCamera();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

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

  const onFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function (evt) {
      if (evt.target?.result) setUploadPreview(evt.target.result as string);
    };
    reader.readAsDataURL(file);
  }, []);

  const uploadPhoto = useCallback(async (file: string | File, fileName: string) => {
    setUploading(true);
    try {
      let blob: Blob;
      if (typeof file === 'string') {
        const response = await fetch(file);
        blob = await response.blob();
      } else {
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
    // camera will stop via effect
  }, []);

  return {
    isOpen, setIsOpen,
    mode, setMode,
    stream,
    capturedPhoto, setCapturedPhoto,
    uploading, setUploading,
    uploadPreview, setUploadPreview,
    videoRef,
    canvasRef,
    fileInputRef,
    onFileChange,
    uploadPhoto,
    handleClose,
  };
}
