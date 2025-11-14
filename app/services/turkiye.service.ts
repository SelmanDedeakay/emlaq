// client-side helper to fetch and filter neighborhoods from turkiyeapi.dev
export interface NeighborhoodRaw {
  provinceId: number;
  districtId: number;
  id: number;
  province: string;
  district: string;
  name: string;
  population?: number;
}

export interface Neighborhood {
  provinceId: number;
  districtId: number;
  id: number;
  province: string;
  district: string;
  name: string;
  population?: number;
  provinceSlug: string;
  districtSlug: string;
  nameSlug: string;
}

let cached: Neighborhood[] | null = null;

function normalize(s: string) {
  return s
    .toLowerCase()
    .replace(/ı/g, 'i')
    .replace(/İ/g, 'i')
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/\s/g, ' ')
    .replace(/ /g, '');
}

async function fetchAll(): Promise<Neighborhood[]> {
  if (cached) return cached;
  const res = await fetch('https://api.turkiyeapi.dev/v1/neighborhoods');
  if (!res.ok) throw new Error('Failed to fetch neighborhoods');
  const { data }: { data: NeighborhoodRaw[] } = await res.json();
  cached = data.map((n) => ({
    ...n,
    province: n.province,
    district: n.district,
    name: n.name,
    provinceSlug: normalize(n.province),
    districtSlug: normalize(n.district),
    nameSlug: normalize(n.name),
  }));
  return cached;
}

export const turkiyeService = {
  async getAll() {
    return await fetchAll();
  },

  async getProvinces() {
    const all = await fetchAll();
    const map = new Map<number, { id: number; name: string; slug: string }>();
    all.forEach((n) => {
      if (!map.has(n.provinceId)) map.set(n.provinceId, { id: n.provinceId, name: n.province, slug: n.provinceSlug });
    });
    return Array.from(map.values()).sort((a, b) => a.slug.localeCompare(b.slug));
  },

  async getDistrictsByProvinceSlug(provinceSlug: string) {
    const all = await fetchAll();
    const filtered = all.filter((n) => n.provinceSlug === provinceSlug);
    const map = new Map<number, { id: number; name: string; slug: string }>();
    filtered.forEach((n) => {
      if (!map.has(n.districtId)) map.set(n.districtId, { id: n.districtId, name: n.district, slug: n.districtSlug });
    });
    return Array.from(map.values()).sort((a, b) => a.slug.localeCompare(b.slug));
  },

  async getNeighborhoods(provinceSlug: string, districtSlug: string) {
    const all = await fetchAll();
    return all
      .filter((n) => n.provinceSlug === provinceSlug && n.districtSlug === districtSlug)
      .map((n) => ({ id: n.id, name: n.name, slug: n.nameSlug }));
  },
};
