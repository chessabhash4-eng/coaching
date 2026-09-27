import { motion } from 'framer-motion';
import { Award, BookMarked } from 'lucide-react';
import { useSite } from '../../contexts/SiteContext';
import { NotebookPage, PageHeader } from '../ui/Ink';
import TiltCard from '../ui/TiltCard';

export default function Faculty() {
  const { data, loading } = useSite();
  return (
    <NotebookPage id="faculty" tab="Faculty" className="py-20 md:py-28">
      <div className="page-inner">
        <PageHeader
          page="05"
          kicker="the authors"
          title="Mentors who wrote the"
          accent="playbook."
          subtitle="Experienced subject experts who teach concepts the way toppers remember them — and stay after class for your doubts."
        />
        <div className="mt-14 grid gap-x-7 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
          {loading && Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-[460px] animate-pulse rounded bg-paper-2" />)}
          {data.faculty.map((f, i) => (
            <motion.div
              key={f.id}
              initial={{ opacity: 0, y: 50, rotate: i % 2 ? 3 : -3 }}
              whileInView={{ opacity: 1, y: 0, rotate: i % 2 ? 1.2 : -1.2 }}
              viewport={{ once: true, margin: '-8% 0px' }}
              transition={{ duration: 0.7, delay: (i % 4) * 0.1, ease: [0.2, 0.7, 0.2, 1] }}
            >
              <TiltCard className="group rounded-sm" max={10}>
                <article className="paper-card relative rounded-sm bg-card p-3 pb-6">
                  <div className="tape absolute -top-3 left-1/2 z-10 h-6 w-24 -translate-x-1/2 -rotate-3" />
                  <div className="relative aspect-[4/5] overflow-hidden rounded-[2px] bg-paper-2">
                    {f.photo_url && (
                      <img
                        src={f.photo_url}
                        alt={f.name}
                        loading="lazy"
                        className="h-full w-full object-cover saturate-[0.85] transition duration-700 group-hover:scale-105 group-hover:saturate-100"
                      />
                    )}
                    <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-navy/60 to-transparent" />
                    <span className="absolute bottom-3 left-3 inline-flex items-center gap-1 rounded-full bg-card/95 px-2.5 py-1 text-[11px] font-extrabold text-ink">
                      <Award className="h-3.5 w-3.5 text-gold" /> {f.experience}
                    </span>
                  </div>
                  <div className="px-2 pt-4">
                    <p className="font-hand text-xl leading-none text-gold">{f.subject}</p>
                    <h3 className="mt-1 font-display text-xl font-[800] leading-tight text-ink">{f.name}</h3>
                    <p className="mt-1.5 flex items-center gap-1.5 text-[12px] font-semibold text-ink-3">
                      <BookMarked className="h-3.5 w-3.5" /> {f.qualification}
                    </p>
                    {f.bio && <p className="mt-3 text-[13.5px] leading-relaxed text-ink-2">{f.bio}</p>}
                  </div>
                </article>
              </TiltCard>
            </motion.div>
          ))}
        </div>
      </div>
    </NotebookPage>
  );
}
