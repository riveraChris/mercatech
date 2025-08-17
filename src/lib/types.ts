export type Municipio = 
  | 'Adjuntas' | 'Aguada' | 'Aguadilla' | 'Aguas Buenas' | 'Aibonito' | 'Arecibo'
  | 'Arroyo' | 'Barceloneta' | 'Barranquitas' | 'Bayamón' | 'Cabo Rojo' | 'Caguas'
  | 'Camuy' | 'Canóvanas' | 'Carolina' | 'Cataño' | 'Cayey' | 'Ceiba' | 'Cidra'
  | 'Coamo' | 'Comerío' | 'Corozal' | 'Culebra' | 'Dorado' | 'Fajardo' | 'Florida'
  | 'Guánica' | 'Guayama' | 'Guayanilla' | 'Guaynabo' | 'Gurabo' | 'Hatillo'
  | 'Hormigueros' | 'Humacao' | 'Isabela' | 'Jayuya' | 'Juana Díaz' | 'Juncos'
  | 'Lajas' | 'Lares' | 'Las Marías' | 'Las Piedras' | 'Loíza' | 'Luquillo'
  | 'Manatí' | 'Maricao' | 'Maunabo' | 'Mayagüez' | 'Moca' | 'Morovis' | 'Naguabo'
  | 'Naranjito' | 'Orocovis' | 'Patillas' | 'Peñuelas' | 'Ponce' | 'Quebradillas'
  | 'Rincón' | 'Río Grande' | 'Sabana Grande' | 'Salinas' | 'San Germán'
  | 'San Juan' | 'San Lorenzo' | 'San Sebastián' | 'Santa Isabel' | 'Toa Alta'
  | 'Toa Baja' | 'Trujillo Alto' | 'Utuado' | 'Vega Alta' | 'Vega Baja' | 'Vieques'
  | 'Villalba' | 'Yabucoa' | 'Yauco';

export type Category = 
  | 'Smartphones' | 'Laptops' | 'Tablets' | 'Desktop Computers' | 'Gaming Consoles'
  | 'TVs' | 'Audio Equipment' | 'Cameras' | 'Smart Home' | 'Accessories'
  | 'Components' | 'Networking' | 'Wearables' | 'Other';

export type Condition = 'New' | 'Like New' | 'Good' | 'Fair' | 'For Parts';

export type ContactPreference = 'WhatsApp' | 'Email' | 'Phone' | 'Messages';

export interface Profile {
  id: string;
  display_name: string;
  municipio: Municipio;
  contact_preference: ContactPreference;
  contact_info?: string;
  avatar_url?: string;
  is_admin: boolean;
  created_at: string;
  updated_at: string;
}

export interface Listing {
  id: string;
  user_id: string;
  title: string;
  description: string;
  category: Category;
  condition: Condition;
  price: number;
  municipio: Municipio;
  images: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
  // Joined data
  profile?: Profile;
}

export interface Favorite {
  id: string;
  user_id: string;
  listing_id: string;
  created_at: string;
  // Joined data
  listing?: Listing;
}

export interface Report {
  id: string;
  reporter_id: string;
  listing_id: string;
  reason: string;
  description?: string;
  status: string;
  created_at: string;
  resolved_at?: string;
  resolved_by?: string;
  // Joined data
  listing?: Listing;
  reporter?: Profile;
}

// Form types
export interface CreateListingForm {
  title: string;
  description: string;
  category: Category;
  condition: Condition;
  price: number;
  municipio: Municipio;
  images: File[];
}

export interface ProfileSetupForm {
  display_name: string;
  municipio: Municipio;
  contact_preference: ContactPreference;
  contact_info?: string;
}

export interface ReportForm {
  reason: string;
  description?: string;
}

// Constants
export const MUNICIPIOS: Municipio[] = [
  'Adjuntas', 'Aguada', 'Aguadilla', 'Aguas Buenas', 'Aibonito', 'Arecibo',
  'Arroyo', 'Barceloneta', 'Barranquitas', 'Bayamón', 'Cabo Rojo', 'Caguas',
  'Camuy', 'Canóvanas', 'Carolina', 'Cataño', 'Cayey', 'Ceiba', 'Cidra',
  'Coamo', 'Comerío', 'Corozal', 'Culebra', 'Dorado', 'Fajardo', 'Florida',
  'Guánica', 'Guayama', 'Guayanilla', 'Guaynabo', 'Gurabo', 'Hatillo',
  'Hormigueros', 'Humacao', 'Isabela', 'Jayuya', 'Juana Díaz', 'Juncos',
  'Lajas', 'Lares', 'Las Marías', 'Las Piedras', 'Loíza', 'Luquillo',
  'Manatí', 'Maricao', 'Maunabo', 'Mayagüez', 'Moca', 'Morovis', 'Naguabo',
  'Naranjito', 'Orocovis', 'Patillas', 'Peñuelas', 'Ponce', 'Quebradillas',
  'Rincón', 'Río Grande', 'Sabana Grande', 'Salinas', 'San Germán',
  'San Juan', 'San Lorenzo', 'San Sebastián', 'Santa Isabel', 'Toa Alta',
  'Toa Baja', 'Trujillo Alto', 'Utuado', 'Vega Alta', 'Vega Baja', 'Vieques',
  'Villalba', 'Yabucoa', 'Yauco'
];

export const CATEGORIES: Category[] = [
  'Smartphones', 'Laptops', 'Tablets', 'Desktop Computers', 'Gaming Consoles',
  'TVs', 'Audio Equipment', 'Cameras', 'Smart Home', 'Accessories',
  'Components', 'Networking', 'Wearables', 'Other'
];

export const CONDITIONS: Condition[] = [
  'New', 'Like New', 'Good', 'Fair', 'For Parts'
];

export const CONTACT_PREFERENCES: ContactPreference[] = [
  'WhatsApp', 'Email', 'Phone', 'Messages'
];
