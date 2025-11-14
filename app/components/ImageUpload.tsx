// app/components/ImageUpload.tsx
'use client';

import { useState, useRef } from 'react';
import { Upload, X, Loader2, Image as ImageIcon } from 'lucide-react';
import { cloudinary } from '../utils/cloudinary';

interface ImageUploadProps {
  onImagesUploaded: (urls: string[]) => void;
  maxImages?: number;
  existingImages?: string[];
}

interface UploadedImage {
  url: string;
  publicId: string;
  loading?: boolean;
}

export default function ImageUpload({ 
  onImagesUploaded, 
  maxImages = 5,
  existingImages = []
}: ImageUploadProps) {
  const [images, setImages] = useState<UploadedImage[]>(
    existingImages.map(url => ({ url, publicId: '' }))
  );
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Maksimum resim kontrolü
    if (images.length + files.length > maxImages) {
      setError(`Maksimum ${maxImages} resim yükleyebilirsiniz.`);
      return;
    }

    setError('');
    setUploading(true);
    setProgress({ current: 0, total: files.length });

    try {
      // Resimleri yükle
      const results = await cloudinary.uploadMultipleImages(
        files,
        'emlaq/properties',
        (current, total) => setProgress({ current, total })
      );

      // Yeni resimleri ekle
      const newImages = results.map(result => ({
        url: result.secure_url,
        publicId: result.public_id,
      }));

      const allImages = [...images, ...newImages];
      setImages(allImages);
      
      // Parent component'e URL'leri gönder
      onImagesUploaded(allImages.map(img => img.url));

    } catch (err: any) {
      console.error('Upload error:', err);
      setError(err.message || 'Resimler yüklenirken bir hata oluştu.');
    } finally {
      setUploading(false);
      setProgress({ current: 0, total: 0 });
      // Input'u temizle
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    setImages(newImages);
    onImagesUploaded(newImages.map(img => img.url));
  };

  const reorderImages = (fromIndex: number, toIndex: number) => {
    const newImages = [...images];
    const [removed] = newImages.splice(fromIndex, 1);
    newImages.splice(toIndex, 0, removed);
    setImages(newImages);
    onImagesUploaded(newImages.map(img => img.url));
  };

  return (
    <div className="space-y-4">
      {/* Upload Button */}
      {images.length < maxImages && (
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp,image/heic"
            multiple
            onChange={handleFileSelect}
            className="hidden"
            disabled={uploading}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="w-full border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 hover:border-blue-500 dark:hover:border-blue-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="flex flex-col items-center gap-2">
              {uploading ? (
                <>
                  <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Yükleniyor... ({progress.current}/{progress.total})
                  </p>
                </>
              ) : (
                <>
                  <Upload className="w-12 h-12 text-gray-400" />
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Resim yüklemek için tıklayın veya sürükleyin
                  </p>
                  <p className="text-xs text-gray-500">
                    JPG, PNG, WEBP (Max 10MB) • Kalan: {maxImages - images.length}
                  </p>
                </>
              )}
            </div>
          </button>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/50 border border-red-200 dark:border-red-800 rounded-lg p-3">
          <p className="text-sm text-red-800 dark:text-red-300">{error}</p>
        </div>
      )}

      {/* Image Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((image, index) => (
            <div
              key={index}
              className="relative group aspect-square rounded-lg overflow-hidden border-2 border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-400 transition-colors"
            >
              {/* Image */}
              <img
                src={image.url}
                alt={`Upload ${index + 1}`}
                className="w-full h-full object-cover"
              />

              {/* Overlay */}
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-center justify-center">
                {/* Remove Button */}
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="opacity-0 group-hover:opacity-100 bg-red-600 hover:bg-red-700 text-white p-2 rounded-full transition-all transform scale-75 group-hover:scale-100"
                  title="Resmi sil"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Order Badge */}
              {index === 0 && (
                <div className="absolute top-2 left-2 bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded">
                  Kapak
                </div>
              )}
              {index > 0 && (
                <div className="absolute top-2 left-2 bg-gray-800 bg-opacity-75 text-white text-xs font-bold px-2 py-1 rounded">
                  {index + 1}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Info */}
      {images.length > 0 && (
        <div className="bg-blue-50 dark:bg-blue-900/50 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <ImageIcon className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-800 dark:text-blue-300">
              <p className="font-medium">İlk resim kapak resmi olarak kullanılacak.</p>
              <p className="text-xs mt-1">Resim sırasını değiştirmek için tekrar yükleyin.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}