import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Upload, Image, X } from 'lucide-react';

interface ImageUploadProps {
  onImageUploaded: (imageUrl: string) => void;
  className?: string;
  multiple?: boolean;
}

export default function ImageUpload({ onImageUploaded, className = "", multiple = false }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const { toast } = useToast();

  const uploadImage = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file",
        description: "Please select a valid image file",
        variant: "destructive"
      });
      return;
    }

    setIsUploading(true);
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const response = await fetch('/api/upload-image', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              imageData: reader.result,
              fileName: file.name
            })
          });

          const result = await response.json();
          if (result.success) {
            setPreview(result.imageUrl);
            onImageUploaded(result.imageUrl);
            toast({ title: "Image uploaded successfully!" });
          } else {
            throw new Error(result.message || 'Upload failed');
          }
        } catch (error: any) {
          toast({
            title: "Upload failed",
            description: error.message || "Failed to upload image",
            variant: "destructive"
          });
        } finally {
          setIsUploading(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload image",
        variant: "destructive"
      });
      setIsUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (multiple) {
      files.forEach(file => uploadImage(file));
    } else if (files[0]) {
      uploadImage(files[0]);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));

    if (imageFiles.length > 0) {
      if (multiple) {
        imageFiles.forEach(file => uploadImage(file));
      } else {
        uploadImage(imageFiles[0]);
      }
    } else {
      toast({
        title: "Invalid file",
        description: "Please drop a valid image file",
        variant: "destructive"
      });
    }
  }, [multiple]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const clearPreview = () => {
    setPreview(null);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Drop Zone */}
      <div
        className={`
          border-2 border-dashed rounded-lg p-6 text-center transition-colors
          ${isDragOver ? 'border-purple-400 bg-purple-50' : 'border-gray-300 hover:border-purple-400'}
          ${isUploading ? 'opacity-50' : ''}
        `}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <Image className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600 mb-2">
          {multiple ? 'Drag and drop images here or click to browse' : 'Drag and drop an image here or click to browse'}
        </p>
        <p className="text-sm text-gray-500 mb-4">
          Supports: JPEG, PNG, GIF, WebP, SVG, BMP, TIFF
        </p>

        <input
          type="file"
          multiple={multiple}
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
          id="image-upload-input"
          disabled={isUploading}
        />

        <Button
          type="button"
          variant="outline"
          onClick={() => document.getElementById('image-upload-input')?.click()}
          disabled={isUploading}
          className="inline-flex items-center gap-2"
        >
          {isUploading ? (
            <>
              <Upload className="w-4 h-4 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="w-4 h-4" />
              {multiple ? 'Choose Images' : 'Choose Image'}
            </>
          )}
        </Button>
      </div>

      {/* Preview for single image */}
      {!multiple && preview && (
        <div className="relative">
          <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden max-w-xs mx-auto">
            <img
              src={preview}
              alt="Uploaded preview"
              className="w-full h-full object-cover"
            />
          </div>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            className="absolute top-2 right-2"
            onClick={clearPreview}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
}