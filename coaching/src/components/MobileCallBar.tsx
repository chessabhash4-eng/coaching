import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Phone } from 'lucide-react';
import { useSite } from '../contexts/SiteContext';
import { telHref, waHref } from '../lib/api';
import { WhatsappIcon } from './ui/Brand';

export default function MobileCallBar() {
  const { data } = useSite();
  const s = data.settings;
  const [show, setShow] = useState(false);
  useEffect(() => {
    const on = () => setShow(window.scrollY > window.innerHeight * 0.6);
    on();
    window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, []);
  if (!s.phone) return null;
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          exit={{ y: 100 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="fixed inset-x-3 bottom-3 z-40 flex gap-2 md:hidden"
          style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
        >
          <a href={telHref(s.phone)} className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-gold-2 py-4 text-base font-extrabold text-navy shadow-[0_12px_30px_-8px_rgba(184,135,15,0.7)]">
            <Phone className="h-5 w-5" /> Call Now
          </a>
          {s.whatsapp && (
            <a href={waHref(s.whatsapp)} target="_blank" rel="noreferrer" aria-label="WhatsApp" className="flex w-16 items-center justify-center rounded-2xl bg-ink text-paper shadow-lg">
              <WhatsappIcon size={22} />
            </a>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
