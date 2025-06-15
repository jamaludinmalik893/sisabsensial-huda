
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Camera, Upload } from 'lucide-react';
import WebcamCropper from './WebcamCropper';

interface PhotoDialogProps {
  isOpen: boolean;
  onClose: () => void;
  currentPhotoUrl?: string;
  mode: 'idle' | 'camera' | 'upload';
  setMode: (m: 'idle' | 'camera' | 'upload') => void;
  stream: MediaStream | null;
  uploading: boolean;
  uploadPreview: string | null;
  capturedPhoto: string | null;
  setCapturedPhoto: (s: string | null) => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  uploadPhoto: (file: string | File, fileName: string) => void;
}

export const PhotoDialog: React.FC<PhotoDialogProps> = ({
  isOpen, onClose, currentPhotoUrl, mode, setMode,
  stream, uploading, uploadPreview,
  capturedPhoto, setCapturedPhoto,
  fileInputRef, onFileChange, uploadPhoto
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
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
              onCapture={setCapturedPhoto}
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
  );
};
