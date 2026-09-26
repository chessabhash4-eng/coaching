export type Settings = {
  id?: number;
  institute_name?: string;
  tagline?: string;
  hero_subline?: string;
  admissions_text?: string;
  phone?: string;
  alt_phone?: string;
  whatsapp?: string;
  email?: string;
  address?: string;
  hours?: string;
  map_embed_url?: string;
  map_link?: string;
  instagram?: string;
  facebook?: string;
  youtube?: string;
  telegram?: string;
};

export type Course = {
  id: number;
  title: string;
  category: string;
  class_level: string;
  description: string;
  duration: string;
  subjects: string;
  fee: string;
  online_classes: boolean;
  study_material: boolean;
  doubt_support: boolean;
  highlights: string;
  badge: string;
  sort_order: number;
};
export type Feature = { id: number; title: string; description: string; icon: string; note: string; sort_order: number };
export type Stat = { id: number; label: string; value: number; suffix: string; description: string; sort_order: number };
export type Result = { id: number; student_name: string; exam: string; score: string; percentage: number; year: string; highlight: string; photo_url: string; sort_order: number };
export type Faculty = { id: number; name: string; subject: string; experience: string; qualification: string; bio: string; photo_url: string; sort_order: number };
export type Testimonial = { id: number; student_name: string; course: string; message: string; rating: number; year: string; sort_order: number };
export type Message = { id: number; name: string; phone: string; email: string | null; course: string | null; message: string | null; status: string; created_at: string };

export type SiteData = {
  settings: Settings;
  courses: Course[];
  features: Feature[];
  stats: Stat[];
  results: Result[];
  faculty: Faculty[];
  testimonials: Testimonial[];
};

export async function fetchSite(): Promise<SiteData> {
  const res = await fetch('/api/site');
  if (!res.ok) throw new Error('Could not load content');
  return res.json();
}

export const telHref = (p?: string) => `tel:${(p || '').replace(/[^\d+]/g, '')}`;
export const waHref = (p?: string) => `https://wa.me/${(p || '').replace(/\D/g, '')}`;
