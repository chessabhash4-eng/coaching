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

export const DEFAULT_SITE_DATA: SiteData = {
  settings: {
    id: 1,
    institute_name: 'Root Career Institute',
    tagline: 'Build Your Career. Shape Your Future.',
    hero_subline: 'Expert Coaching for',
    admissions_text: 'Admissions Open Now',
    phone: '+91 98765 43210',
    alt_phone: '+91 98765 43211',
    whatsapp: '+91 98765 43210',
    email: 'admissions@rootcareer.institute',
    address: 'Plot 14, Knowledge Park III, Near Metro Station, Sector 62',
    hours: 'Monday – Saturday: 8:00 AM – 8:00 PM | Sunday: 9:00 AM – 2:00 PM',
    map_embed_url: '',
    map_link: '',
    instagram: 'https://instagram.com',
    facebook: 'https://facebook.com',
    youtube: 'https://youtube.com',
    telegram: 'https://t.me',
  },
  courses: [
    {
      id: 1,
      title: 'NEET Target 2026',
      category: 'medical',
      class_level: 'Class 12th & Droppers',
      description: 'Comprehensive 1-year classroom & live online program for NEET aspirants with full syllabus revision and test series.',
      duration: '1 Year',
      subjects: 'Physics · Chemistry · Biology',
      fee: '₹75,000 / year',
      online_classes: true,
      study_material: true,
      doubt_support: true,
      highlights: 'NCERT line-by-line coverage\n5000+ practice questions with video solutions\nWeekly mock tests on actual NTA pattern\n1-on-1 performance reviews',
      badge: 'Bestseller',
      sort_order: 1,
    },
    {
      id: 2,
      title: 'NEET Pinnacle (2 Years)',
      category: 'medical',
      class_level: 'Class 11th',
      description: 'Build from absolute fundamentals in Class 11th and master the complete NEET syllabus with boards prep.',
      duration: '2 Years',
      subjects: 'Physics · Chemistry · Biology',
      fee: '₹1,20,000 (2 yrs)',
      online_classes: true,
      study_material: true,
      doubt_support: true,
      highlights: 'Early starter advantage\nIntegrated CBSE / State Board preparation\nSpecial foundation bridge course in month 1\nPersonal mentor assigned',
      badge: 'Popular',
      sort_order: 2,
    },
    {
      id: 3,
      title: 'JEE Main + Advanced 2026',
      category: 'engineering',
      class_level: 'Class 12th & Droppers',
      description: 'Intensive problem-solving and concept mastery designed specifically for IIT-JEE top rankers.',
      duration: '1 Year',
      subjects: 'Physics · Chemistry · Mathematics',
      fee: '₹80,000 / year',
      online_classes: true,
      study_material: true,
      doubt_support: true,
      highlights: 'Advanced problem sheets (IRODOV, Pathfinder level)\nComputer-Based Test (CBT) portal\nPrevious 15 years question analysis\nDoubt sessions by IITians',
      badge: 'Top Rankers',
      sort_order: 3,
    },
    {
      id: 4,
      title: 'JEE Achievers (2 Years)',
      category: 'engineering',
      class_level: 'Class 11th',
      description: 'The golden pathway to IITs and NITs. Steady pace, crystal-clear basics and advanced problem solving.',
      duration: '2 Years',
      subjects: 'Physics · Chemistry · Mathematics',
      fee: '₹1,30,000 (2 yrs)',
      online_classes: true,
      study_material: true,
      doubt_support: true,
      highlights: 'Class 11 & 12 complete coverage\nBoard + JEE synchronized curriculum\nMonthly parent-teacher-mentor meet\nRecorded backup lectures for every class',
      badge: '',
      sort_order: 4,
    },
    {
      id: 5,
      title: 'Foundation Stars (9th & 10th)',
      category: 'foundation',
      class_level: 'Class 9th & 10th',
      description: 'Develop scientific temper, deep mathematical intuition, and ace NTSE, Olympiads and Board exams.',
      duration: '1 or 2 Years',
      subjects: 'Science · Maths · Mental Ability',
      fee: '₹45,000 / year',
      online_classes: true,
      study_material: true,
      doubt_support: true,
      highlights: 'Olympiad & NTSE focus\n100% board exam preparation\nLogical reasoning & coding workshops\nSmall batches (max 25 students)',
      badge: 'Foundation',
      sort_order: 5,
    },
    {
      id: 6,
      title: 'Junior Spark (6th to 8th)',
      category: 'foundation',
      class_level: 'Class 6th, 7th & 8th',
      description: 'Early habit building, removing maths fear and igniting genuine curiosity in young learners.',
      duration: '1 Year',
      subjects: 'Science · Maths · Reasoning',
      fee: '₹35,000 / year',
      online_classes: true,
      study_material: true,
      doubt_support: true,
      highlights: 'Activity-based concept building\nMental ability & reasoning practice\nWorksheets for every chapter\nRegular progress reports for parents',
      badge: '',
      sort_order: 6,
    },
  ],
  features: [
    { id: 1, title: 'Expert, experienced faculty', description: 'Learn from subject specialists who have mentored NEET and JEE aspirants for years and teach concepts the way toppers remember them.', icon: 'cap', note: 'teachers who care', sort_order: 1 },
    { id: 2, title: 'Live interactive online classes', description: 'Attend from anywhere with live classes, instant polls and recordings so you never miss a lecture — revise any topic anytime.', icon: 'video', note: 'recordings included', sort_order: 2 },
    { id: 3, title: 'Printed study material', description: 'Chapter-wise modules, NCERT-based notes, formula sheets and DPPs designed in-house to match the latest exam pattern.', icon: 'book', note: 'delivered to your door', sort_order: 3 },
    { id: 4, title: 'Personal doubt support', description: 'Dedicated doubt sessions and one-on-one help so no question stays unanswered for long.', icon: 'doubt', note: 'no doubt left behind', sort_order: 4 },
    { id: 5, title: 'Regular tests & analysis', description: 'Weekly tests and full-length mocks with detailed performance analysis to track progress and fix weak areas early.', icon: 'chart', note: 'every sunday!', sort_order: 5 },
    { id: 6, title: 'Small batches, personal mentoring', description: 'Limited seats per batch mean every student gets noticed, guided and pushed to reach their potential.', icon: 'users', note: 'limited seats', sort_order: 6 },
  ],
  stats: [
    { id: 1, label: 'Success rate', value: 96, suffix: '%', description: 'students cleared their target exam', sort_order: 1 },
    { id: 2, label: 'Selections', value: 850, suffix: '+', description: 'in NEET, JEE & Olympiads', sort_order: 2 },
    { id: 3, label: 'Board average', value: 92.4, suffix: '%', description: 'Class 10th & 12th toppers batch', sort_order: 3 },
    { id: 4, label: 'Students mentored', value: 5000, suffix: '+', description: 'across all our programs', sort_order: 4 },
  ],
  results: [
    { id: 1, student_name: 'Ananya Verma', exam: 'NEET', score: '681 / 720', percentage: 94.6, year: '2026', highlight: 'Govt. medical seat secured!', photo_url: '', sort_order: 1 },
    { id: 2, student_name: 'Rohan Mishra', exam: 'JEE Main', score: '99.42 %ile', percentage: 99.4, year: '2026', highlight: 'qualified JEE Advanced', photo_url: '', sort_order: 2 },
    { id: 3, student_name: 'Saba Khan', exam: 'NEET', score: '655 / 720', percentage: 91, year: '2026', highlight: 'first attempt, dropper batch', photo_url: '', sort_order: 3 },
    { id: 4, student_name: 'Aditya Singh', exam: 'CBSE Class 10', score: '98.2 %', percentage: 98.2, year: '2026', highlight: '100/100 in Maths', photo_url: '', sort_order: 4 },
    { id: 5, student_name: 'Priya Yadav', exam: 'JEE Main', score: '98.87 %ile', percentage: 98.9, year: '2025', highlight: 'NIT seat — CSE', photo_url: '', sort_order: 5 },
    { id: 6, student_name: 'Harsh Tiwari', exam: 'NEET', score: '642 / 720', percentage: 89.2, year: '2025', highlight: 'biology 355/360', photo_url: '', sort_order: 6 },
    { id: 7, student_name: 'Kavya Srivastava', exam: 'CBSE Class 12', score: '96.8 %', percentage: 96.8, year: '2025', highlight: 'school topper, PCB', photo_url: '', sort_order: 7 },
    { id: 8, student_name: 'Arjun Gupta', exam: 'NSO Olympiad', score: 'Gold Medal', percentage: 97, year: '2025', highlight: 'junior foundation star', photo_url: '', sort_order: 8 },
  ],
  faculty: [
    { id: 1, name: 'Er. Vikas Srivastava', subject: 'Physics', experience: '14+ years', qualification: 'B.Tech, NIT · M.Sc. Physics', bio: 'Makes mechanics and electrodynamics intuitive with real-life examples and smart problem-solving shortcuts.', photo_url: '/uploads/faculty-1.jpg', sort_order: 1 },
    { id: 2, name: 'Dr. Meenakshi Rao', subject: 'Biology', experience: '12+ years', qualification: 'Ph.D. Zoology', bio: 'Known for diagram-based teaching and NCERT line-by-line coverage that helps students score big in NEET Biology.', photo_url: '/uploads/faculty-2.jpg', sort_order: 2 },
    { id: 3, name: 'Prof. R. K. Pandey', subject: 'Mathematics', experience: '20+ years', qualification: 'M.Sc., M.Phil. Mathematics', bio: 'Two decades of guiding JEE aspirants — calculus and algebra explained with crystal-clear logic.', photo_url: '/uploads/faculty-3.jpg', sort_order: 3 },
    { id: 4, name: 'Ms. Neha Kapoor', subject: 'Chemistry', experience: '9+ years', qualification: 'M.Sc. Chemistry, B.Ed.', bio: 'Turns organic reactions and physical chemistry numericals into easy, memorable patterns.', photo_url: '/uploads/faculty-4.jpg', sort_order: 4 },
  ],
  testimonials: [
    { id: 1, student_name: 'Ananya Verma', course: 'NEET 2026 · 681/720', message: 'The printed modules and daily practice papers kept me consistent. Every doubt I had was solved the same day — that made all the difference.', rating: 5, year: '2026', sort_order: 1 },
    { id: 2, student_name: 'Rohan Mishra', course: 'JEE Main 2026 · 99.42 %ile', message: 'Physics finally clicked for me here. The weekly tests with detailed analysis showed me exactly where I was losing marks.', rating: 5, year: '2026', sort_order: 2 },
    { id: 3, student_name: 'Mrs. Sunita Singh', course: 'Parent · Foundation Class 10', message: 'Regular progress reports and caring teachers. My son scored 98% in boards and now has a strong base for JEE.', rating: 5, year: '2026', sort_order: 3 },
    { id: 4, student_name: 'Saba Khan', course: 'NEET Dropper Batch', message: 'After a tough first attempt, the mentors rebuilt my confidence step by step. The mock tests felt exactly like the real exam.', rating: 5, year: '2026', sort_order: 4 },
    { id: 5, student_name: 'Priya Yadav', course: 'JEE Main 2025 · NIT CSE', message: 'Online classes were live and interactive, and recordings helped me revise before every test. Best decision I made.', rating: 5, year: '2025', sort_order: 5 },
    { id: 6, student_name: 'Arjun Gupta', course: 'Junior Foundation · Class 8', message: 'Maths is my favourite subject now! The puzzles and reasoning practice helped me win gold in the Science Olympiad.', rating: 5, year: '2025', sort_order: 6 },
  ],
};

export async function fetchSite(): Promise<SiteData> {
  // 1. Try fetching from /api/site
  try {
    const res = await fetch('/api/site');
    const ct = res.headers.get('content-type') || '';
    if (res.ok && ct.includes('application/json')) {
      const data = await res.json();
      if (data && !data.error && data.settings) {
        return data;
      }
    }
  } catch (err) {
    console.warn('API fetch failed, trying direct Supabase fallback:', err);
  }

  // 2. Direct Supabase query fallback
  try {
    const { createClient } = await import('@supabase/supabase-js');
    const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || 'https://cmfmkbsufeygohzudzlg.supabase.co';
    const supabaseKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || 'sb_publishable_5ECV8FJW4-TKyP1mM1DoWA_QJtu0B9x';
    const sb = createClient(supabaseUrl, supabaseKey);

    const order = (q: any) => q.order('sort_order', { ascending: true }).order('id', { ascending: true });
    const [settings, courses, features, stats, results, faculty, testimonials] = await Promise.all([
      sb.from('settings').select('*').eq('id', 1).maybeSingle(),
      order(sb.from('courses').select('*')),
      order(sb.from('features').select('*')),
      order(sb.from('stats').select('*')),
      order(sb.from('results').select('*')),
      order(sb.from('faculty').select('*')),
      order(sb.from('testimonials').select('*')),
    ]);

    if (!settings.error && settings.data) {
      return {
        settings: settings.data || DEFAULT_SITE_DATA.settings,
        courses: courses.data && courses.data.length ? courses.data : DEFAULT_SITE_DATA.courses,
        features: features.data && features.data.length ? features.data : DEFAULT_SITE_DATA.features,
        stats: stats.data && stats.data.length ? stats.data : DEFAULT_SITE_DATA.stats,
        results: results.data && results.data.length ? results.data : DEFAULT_SITE_DATA.results,
        faculty: faculty.data && faculty.data.length ? faculty.data : DEFAULT_SITE_DATA.faculty,
        testimonials: testimonials.data && testimonials.data.length ? testimonials.data : DEFAULT_SITE_DATA.testimonials,
      };
    }
  } catch (e) {
    console.warn('Direct Supabase fetch error, using default site data:', e);
  }

  // 3. Guaranteed reliable default data
  return DEFAULT_SITE_DATA;
}

export const telHref = (p?: string) => `tel:${(p || '').replace(/[^\d+]/g, '')}`;
export const waHref = (p?: string) => `https://wa.me/${(p || '').replace(/\D/g, '')}`;
