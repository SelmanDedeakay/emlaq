// client-side helper to fetch provinces, districts, and neighborhoods from turkiyeapi.dev

export interface Province {
  id: number;
  name: string;
}

export interface District {
  provinceId: number;
  id: number;
  province: string;
  name: string;
}

export interface Neighborhood {
  provinceId: number;
  districtId: number;
  id: number;
  province: string;
  district: string;
  name: string;
}

let cachedProvinces: Province[] | null = null;
let cachedDistricts: District[] | null = null;
let cachedNeighborhoods: Neighborhood[] | null = null;

async function fetchProvinces(): Promise<Province[]> {
  if (cachedProvinces) return cachedProvinces;
  const res = await fetch('https://api.turkiyeapi.dev/v1/provinces');
  if (!res.ok) throw new Error('Failed to fetch provinces');
  const { data }: { data: Province[] } = await res.json();
  cachedProvinces = data;
  return cachedProvinces;
}

async function fetchDistricts(): Promise<District[]> {
  if (cachedDistricts) return cachedDistricts;
  const res = await fetch('https://api.turkiyeapi.dev/v1/districts');
  if (!res.ok) throw new Error('Failed to fetch districts');
  const { data }: { data: District[] } = await res.json();
  cachedDistricts = data;
  return cachedDistricts;
}

async function fetchNeighborhoods(): Promise<Neighborhood[]> {
  if (cachedNeighborhoods) return cachedNeighborhoods;
  const res = await fetch('https://api.turkiyeapi.dev/v1/neighborhoods');
  if (!res.ok) throw new Error('Failed to fetch neighborhoods');
  const { data }: { data: Neighborhood[] } = await res.json();
  cachedNeighborhoods = data;
  return cachedNeighborhoods;
}

export const turkiyeService = {
  async getProvinces() {
    const provinces = await fetchProvinces();
    return provinces.sort((a, b) => a.name.localeCompare(b.name, 'tr'));
  },

  async getDistrictsByProvinceName(provinceName: string) {
    const districts = await fetchDistricts();
    const filtered = districts.filter((d) => d.province === provinceName);
    return filtered.sort((a, b) => a.name.localeCompare(b.name, 'tr'));
  },

  async getNeighborhoods(provinceName: string, districtName: string) {
    // Use API query parameters to fetch only relevant neighborhoods.
    try {
      const baseUrl = 'https://api.turkiyeapi.dev/v1/neighborhoods';
      const params = new URLSearchParams();
      if (provinceName) params.append('province', provinceName);
      if (districtName) params.append('district', districtName);
      const url = params.toString() ? `${baseUrl}?${params.toString()}` : baseUrl;

      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch neighborhoods');
      const { data }: { data: Neighborhood[] } = await res.json();

      // Helper to create a URL-friendly slug from a name
      const slugify = (s: string) =>
        s
          .toLowerCase()
          .replace(/ç/g, 'c')
          .replace(/ğ/g, 'g')
          .replace(/ı/g, 'i')
          .replace(/İ/g, 'i')
          .replace(/ş/g, 's')
          .replace(/ö/g, 'o')
          .replace(/ü/g, 'u')
          .replace(/[^a-z0-9\s-]/g, '')
          .trim()
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-');

      // Map to a lighter shape including a `slug` so callers using `m.slug` work
      return data
        .map((n) => ({ id: n.id, name: n.name, slug: slugify(n.name) }))
        .sort((a, b) => a.name.localeCompare(b.name, 'tr'));
    } catch (error) {
      console.error('Error in getNeighborhoods:', error);
      throw error;
    }
  },
};