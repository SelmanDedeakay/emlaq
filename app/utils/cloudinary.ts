// app/utils/cloudinary.ts

export interface CloudinaryUploadResult {
  public_id: string;
  secure_url: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
}

export class CloudinaryUploader {
  private cloudName: string;
  private uploadPreset: string;

  constructor() {
    this.cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || '';
    this.uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || '';

    if (!this.cloudName || !this.uploadPreset) {
      throw new Error('Cloudinary configuration is missing. Please check your .env.local file.');
    }
  }

  /**
   * Tek bir resmi Cloudinary'ye yükler
   * @param file - Yüklenecek dosya (File objesi)
   * @param folder - Cloudinary'de klasör adı (opsiyonel)
   * @returns Upload sonucu
   */
  async uploadImage(
    file: File,
    folder: string = 'emlaq/properties'
  ): Promise<CloudinaryUploadResult> {
    // Dosya validasyonu
    this.validateFile(file);

    // FormData oluştur
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', this.uploadPreset);
    formData.append('folder', folder);
    
    // Otomatik optimizasyon için
    formData.append('quality', 'auto');
    formData.append('fetch_format', 'auto');

    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${this.cloudName}/image/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Upload failed');
      }

      const result = await response.json();
      return result as CloudinaryUploadResult;
    } catch (error) {
      console.error('Cloudinary upload error:', error);
      throw new Error('Resim yüklenirken bir hata oluştu. Lütfen tekrar deneyin.');
    }
  }

  /**
   * Birden fazla resmi sırayla yükler
   * @param files - Yüklenecek dosyalar
   * @param folder - Cloudinary'de klasör adı
   * @param onProgress - Her yükleme sonrası callback (opsiyonel)
   * @returns Tüm upload sonuçları
   */
  async uploadMultipleImages(
    files: File[],
    folder: string = 'emlaq/properties',
    onProgress?: (current: number, total: number) => void
  ): Promise<CloudinaryUploadResult[]> {
    const results: CloudinaryUploadResult[] = [];
    
    for (let i = 0; i < files.length; i++) {
      const result = await this.uploadImage(files[i], folder);
      results.push(result);
      
      if (onProgress) {
        onProgress(i + 1, files.length);
      }
    }
    
    return results;
  }

  /**
   * Cloudinary'den resim siler
   * @param publicId - Silinecek resmin public_id'si
   */
  async deleteImage(publicId: string): Promise<void> {
    // Not: Silme işlemi için backend endpoint'i gerekli
    // Çünkü silme işlemi API Secret gerektiriyor (güvenlik)
    console.warn('Delete operation requires backend endpoint with API secret');
    throw new Error('Resim silme işlemi için backend desteği gerekli');
  }

  /**
   * Dosya validasyonu
   */
  private validateFile(file: File): void {
    // Dosya tipi kontrolü
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/heic'];
    if (!validTypes.includes(file.type)) {
      throw new Error('Geçersiz dosya tipi. Sadece JPG, PNG, WEBP ve HEIC dosyaları yüklenebilir.');
    }

    // Dosya boyutu kontrolü (10MB max)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      throw new Error('Dosya boyutu çok büyük. Maksimum 10MB yüklenebilir.');
    }
  }

  /**
   * Cloudinary URL'sinden optimize edilmiş thumbnail URL'si oluşturur
   * @param url - Orijinal Cloudinary URL'si
   * @param width - Thumbnail genişliği
   * @param height - Thumbnail yüksekliği
   */
  static getThumbnailUrl(
    url: string,
    width: number = 300,
    height: number = 300
  ): string {
    if (!url.includes('cloudinary.com')) {
      return url;
    }

    // /upload/ sonrasına transformasyon ekle
    return url.replace(
      '/upload/',
      `/upload/w_${width},h_${height},c_fill,q_auto,f_auto/`
    );
  }

  /**
   * Cloudinary URL'sinden optimize edilmiş görüntü URL'si oluşturur
   * @param url - Orijinal Cloudinary URL'si
   * @param width - Maksimum genişlik
   */
  static getOptimizedUrl(url: string, width: number = 1200): string {
    if (!url.includes('cloudinary.com')) {
      return url;
    }

    return url.replace(
      '/upload/',
      `/upload/w_${width},q_auto,f_auto/`
    );
  }
}

// Singleton instance
export const cloudinary = new CloudinaryUploader();