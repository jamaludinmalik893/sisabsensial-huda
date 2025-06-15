
import React from 'react';
import { Button } from '@/components/ui/button';
import { Camera } from 'lucide-react';
import { usePhotoCaptureState } from './usePhotoCaptureState';
import { PhotoDialog } from './PhotoDialog';

interface PhotoCaptureProps {
  onPhotoCapture: (photoUrl: string) => void;
  currentPhotoUrl?: string;
}

const PhotoCapture: React.FC<PhotoCaptureProps> = ({ onPhotoCapture, currentPhotoUrl }) => {
  const state = usePhotoCaptureState(onPhotoCapture);
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
        <Button type="button" variant="outline" onClick={() => state.setIsOpen(true)}>
          <Camera className="h-4 w-4 mr-2" />
          {currentPhotoUrl ? 'Ganti Foto' : 'Tambah Foto'}
        </Button>
      </div>
      <PhotoDialog
        isOpen={state.isOpen}
        onClose={state.handleClose}
        currentPhotoUrl={currentPhotoUrl}
        mode={state.mode}
        setMode={state.setMode}
        stream={state.stream}
        capturedPhoto={state.capturedPhoto}
        setCapturedPhoto={state.setCapturedPhoto}
        uploading={state.uploading}
        uploadPreview={state.uploadPreview}
        fileInputRef={state.fileInputRef}
        onFileChange={state.onFileChange}
        uploadPhoto={state.uploadPhoto}
      />
    </>
  );
};

export default PhotoCapture;
