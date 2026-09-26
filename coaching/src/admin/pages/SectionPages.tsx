import { Check, Minus, Star } from 'lucide-react';
import CrudPage from '../CrudPage';
import Icon from '../../components/ui/Icon';

const Flag = ({ on, label }: { on: boolean; label: string }) => (
  <span className={`inline-flex items-center gap-1 text-[11px] font-bold ${on ? 'text-ink' : 'text-ink-3 line-through'}`}>
    {on ? <Check className="h-3 w-3 text-gold" /> : <Minus className="h-3 w-3" />} {label}
  </span>
);

export function CoursesPage() {
  return (
    <CrudPage
      resource="courses"
      kicker="page 02"
      title="Courses"
      desc="Course cards shown in the Courses section. Subjects are comma-separated; highlights are one per line."
      singular="Course"
      defaults={{ category: 'NEET', online_classes: true, study_material: true, doubt_support: true }}
      fields={[
        { name: 'title', label: 'Course name', required: true, full: true },
        { name: 'category', label: 'Category', type: 'select', options: ['NEET', 'JEE', 'Foundation', 'Boards'], required: true },
        { name: 'class_level', label: 'Class / level', placeholder: 'Class 11th–12th', required: true },
        { name: 'description', label: 'Description', type: 'textarea', required: true },
        { name: 'duration', label: 'Duration', placeholder: '2 Years', required: true },
        { name: 'fee', label: 'Fee', placeholder: '₹45,000 / year' },
        { name: 'subjects', label: 'Subjects', placeholder: 'Physics, Chemistry, Biology', full: true },
        { name: 'online_classes', label: 'Online classes', type: 'boolean' },
        { name: 'study_material', label: 'Study material', type: 'boolean' },
        { name: 'doubt_support', label: 'Doubt support', type: 'boolean' },
        { name: 'badge', label: 'Badge (optional)', placeholder: 'Most popular' },
        { name: 'highlights', label: 'Highlights (one per line)', type: 'textarea' },
        { name: 'sort_order', label: 'Order', type: 'number' },
      ]}
      preview={(r) => (
        <>
          <div className="flex items-center gap-2">
            <span className="rounded-sm bg-ink px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-widest text-paper">{r.category}</span>
            <span className="font-hand text-lg text-gold">{r.class_level}</span>
          </div>
          <h3 className="mt-2 pr-8 font-display text-lg font-[800] leading-tight">{r.title}</h3>
          <p className="mt-1 line-clamp-2 text-sm text-ink-2">{r.description}</p>
          <p className="mt-2 text-xs font-bold text-ink">{r.duration} · {r.fee || 'Fee on call'}</p>
          <div className="mt-2 flex flex-wrap gap-3">
            <Flag on={r.online_classes} label="Online" />
            <Flag on={r.study_material} label="Material" />
            <Flag on={r.doubt_support} label="Doubts" />
          </div>
        </>
      )}
    />
  );
}

export function FeaturesPage() {
  return (
    <CrudPage
      resource="features"
      kicker="page 03"
      title="Why Root Career Institute"
      desc="The handwritten checklist of reasons students choose you."
      singular="Feature"
      defaults={{ icon: 'notebook' }}
      fields={[
        { name: 'title', label: 'Title', required: true, full: true },
        { name: 'description', label: 'Description', type: 'textarea', required: true },
        { name: 'note', label: 'Margin note (handwritten)', placeholder: 'e.g. max 30 per batch!' },
        { name: 'sort_order', label: 'Order', type: 'number' },
        { name: 'icon', label: 'Icon', type: 'icon' },
      ]}
      preview={(r) => (
        <div className="flex gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gold-soft">
            <Icon name={r.icon} className="h-5 w-5" />
          </span>
          <div>
            <h3 className="pr-8 font-display text-lg font-[800] leading-tight">{r.title}</h3>
            <p className="mt-1 line-clamp-3 text-sm text-ink-2">{r.description}</p>
            {r.note && <p className="mt-1 font-hand text-lg text-gold">{r.note}</p>}
          </div>
        </div>
      )}
    />
  );
}

export function ResultsPage() {
  return (
    <div className="space-y-16">
      <CrudPage
        resource="stats"
        kicker="page 04 · counters"
        title="Result counters"
        desc="Animated numbers at the top of the Results section (e.g. 98 + % = 98%)."
        singular="Counter"
        defaults={{ suffix: '%' }}
        fields={[
          { name: 'label', label: 'Label', required: true },
          { name: 'value', label: 'Number', type: 'number', required: true },
          { name: 'suffix', label: 'Suffix', placeholder: '% or +' },
          { name: 'sort_order', label: 'Order', type: 'number' },
          { name: 'description', label: 'Small note', full: true },
        ]}
        preview={(r) => (
          <>
            <div className="font-display text-4xl font-[900]">
              {r.value}
              {r.suffix}
            </div>
            <div className="mt-1 text-xs font-extrabold uppercase tracking-widest">{r.label}</div>
            <p className="font-hand text-lg text-ink-2">{r.description}</p>
          </>
        )}
      />
      <CrudPage
        resource="results"
        kicker="page 04 · achievers"
        title="Hall of achievers"
        desc="Student achievement notes pinned in the Results section."
        singular="Achiever"
        defaults={{ exam: 'NEET', year: '2026' }}
        fields={[
          { name: 'student_name', label: 'Student name', required: true },
          { name: 'exam', label: 'Exam', required: true, placeholder: 'NEET 2026' },
          { name: 'score', label: 'Score / rank', required: true, placeholder: '685/720 or AIR 1,245' },
          { name: 'percentage', label: 'Percentage (for bar)', type: 'number', required: true },
          { name: 'year', label: 'Year' },
          { name: 'sort_order', label: 'Order', type: 'number' },
          { name: 'highlight', label: 'Handwritten highlight', full: true },
          { name: 'photo_url', label: 'Photo (optional)', type: 'image' },
        ]}
        preview={(r) => (
          <>
            <div className="flex items-center gap-3">
              {r.photo_url ? (
                <img src={r.photo_url} alt="" className="h-10 w-10 rounded-full object-cover" />
              ) : (
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-ink text-sm font-bold text-gold-soft">{String(r.student_name).slice(0, 1)}</span>
              )}
              <div>
                <h3 className="font-display font-[800]">{r.student_name}</h3>
                <p className="text-xs font-bold text-ink-3">{r.exam} · {r.year}</p>
              </div>
            </div>
            <p className="mt-2 font-display text-2xl font-[900]">{r.score}</p>
            <p className="font-hand text-lg text-gold">{r.highlight}</p>
          </>
        )}
      />
    </div>
  );
}

export function FacultyPage() {
  return (
    <CrudPage
      resource="faculty"
      kicker="page 05"
      title="Faculty"
      desc="Teacher profiles shown as polaroid cards. Upload a portrait photo (4:5 works best)."
      singular="Faculty member"
      defaults={{}}
      fields={[
        { name: 'name', label: 'Name', required: true },
        { name: 'subject', label: 'Subject', required: true },
        { name: 'experience', label: 'Experience', placeholder: '12+ years', required: true },
        { name: 'qualification', label: 'Qualification', placeholder: 'M.Sc. Physics' },
        { name: 'bio', label: 'Short bio', type: 'textarea' },
        { name: 'sort_order', label: 'Order', type: 'number' },
        { name: 'photo_url', label: 'Photo', type: 'image' },
      ]}
      preview={(r) => (
        <div className="flex gap-3">
          <div className="h-20 w-16 shrink-0 overflow-hidden rounded bg-paper-2">{r.photo_url && <img src={r.photo_url} alt="" className="h-full w-full object-cover" />}</div>
          <div>
            <p className="font-hand text-lg leading-none text-gold">{r.subject}</p>
            <h3 className="pr-8 font-display text-lg font-[800] leading-tight">{r.name}</h3>
            <p className="text-xs font-bold text-ink-3">{r.experience} · {r.qualification}</p>
          </div>
        </div>
      )}
    />
  );
}

export function TestimonialsPage() {
  return (
    <CrudPage
      resource="testimonials"
      kicker="page 06"
      title="Testimonials"
      desc="Handwritten feedback notes in the testimonial carousel."
      singular="Testimonial"
      defaults={{ rating: 5, year: '2026' }}
      fields={[
        { name: 'student_name', label: 'Student / parent name', required: true },
        { name: 'course', label: 'Course / result', placeholder: 'NEET 2026 · 652/720' },
        { name: 'message', label: 'Feedback', type: 'textarea', required: true },
        { name: 'rating', label: 'Rating (1–5)', type: 'number' },
        { name: 'year', label: 'Year' },
        { name: 'sort_order', label: 'Order', type: 'number' },
      ]}
      preview={(r) => (
        <>
          <div className="flex gap-0.5">
            {Array.from({ length: 5 }).map((_, k) => (
              <Star key={k} className={`h-3.5 w-3.5 ${k < r.rating ? 'fill-gold-2 text-gold-2' : 'text-ink/20'}`} />
            ))}
          </div>
          <p className="mt-2 line-clamp-4 font-hand text-xl leading-snug text-ink">“{r.message}”</p>
          <p className="mt-2 text-sm font-bold">— {r.student_name}</p>
          <p className="text-xs text-ink-3">{r.course}</p>
        </>
      )}
    />
  );
}
