export type PropertyStatus = 'satilik' | 'kiralik' | 'satildi';
export type PropertyType = 'daire' | 'mustakil' | 'isyeri' | 'arsa';
export type RoomType = '1+0' | '1+1' | '2+1' | '3+1' | '4+1' | '5+1';
export type CustomerStatus = 'aktif' | 'pasif' | 'buldu';

export interface Property {
  id: string;
  status: PropertyStatus;
  type: PropertyType;
  location: {
    il: string;
    ilce: string;
    mahalle: string;
  };
  price: number;
  details: {
    rooms: RoomType;
    squareMeters: number;
  };
  features: {
    balcony: boolean;
    parking: boolean;
    inComplex: boolean;
    furnished: boolean;
    newBuilding: boolean;
  };
  createdAt: Date;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  status: CustomerStatus;
  criteria: {
    status: PropertyStatus;
    types: PropertyType[]; // Çoklu seçim
    location: {
      il: string;
      ilce: string;
      mahalleler: string[]; // Çoklu seçim
    };
    budget: {
      min: number;
      max: number;
    };
    details: {
      minRooms: RoomType;
    };
    features: {
      balcony: boolean;
      parking: boolean;
      inComplex: boolean;
      furnished: boolean;
      newBuilding: boolean;
    };
  };
  createdAt: Date;
}