// Türkiye'deki popüler mahalleler için koordinat veritabanı
export const mahalleCoordinates: Record<string, [number, number]> = {
  // Kadıköy
  'caddebostan': [40.9717, 29.0572],
  'bostanci': [40.9667, 29.0917],
  'moda': [40.9833, 29.0250],
  'fenerbahce': [40.9653, 29.0456],
  'goztepe': [40.9789, 29.0614],
  
  // Üsküdar
  'cengelkoy': [41.0508, 29.0958],
  'kuzguncuk': [41.0278, 29.0406],
  'beylerbeyi': [41.0419, 29.0431],
  'kandilli': [41.0686, 29.0583],
  
  // Default Istanbul merkez
  'default': [41.0082, 28.9784],
};

export function getMahalleCoordinates(mahalle: string): [number, number] {
  const normalized = mahalle.toLowerCase().replace(/ı/g, 'i').replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's').replace(/ö/g, 'o').replace(/ç/g, 'c');
  return mahalleCoordinates[normalized] || mahalleCoordinates['default'];
}

export function getDistanceBetweenPoints(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  // Haversine formula
  const R = 6371; // Dünya'nın yarıçapı (km)
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c; // Mesafe km cinsinden
}