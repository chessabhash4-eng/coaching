import { useSite } from '../contexts/SiteContext';
import { FacebookIcon, InstagramIcon, TelegramIcon, WhatsappIcon, YoutubeIcon } from './ui/Brand';
import { waHref } from '../lib/api';

export default function Socials({ dark = false }: { dark?: boolean }) {
  const { data } = useSite();
  const s = data.settings;
  const items = [
    { href: s.instagram, label: 'Instagram', Icon: InstagramIcon },
    { href: s.facebook, label: 'Facebook', Icon: FacebookIcon },
    { href: s.youtube, label: 'YouTube', Icon: YoutubeIcon },
    { href: s.telegram, label: 'Telegram', Icon: TelegramIcon },
    { href: s.whatsapp ? waHref(s.whatsapp) : '', label: 'WhatsApp', Icon: WhatsappIcon },
  ].filter((i) => i.href);
  if (!items.length) return null;
  return (
    <div className="flex flex-wrap items-center gap-2">
      {items.map(({ href, label, Icon }) => (
        <a
          key={label}
          href={href}
          target="_blank"
          rel="noreferrer"
          aria-label={label}
          title={label}
          className={`flex h-10 w-10 items-center justify-center rounded-full border transition hover:-translate-y-0.5 ${
            dark ? 'border-gold/30 text-gold-soft hover:bg-gold hover:text-navy' : 'border-ink/15 bg-card text-ink hover:border-ink hover:bg-ink hover:text-paper'
          }`}
        >
          <Icon size={17} />
        </a>
      ))}
    </div>
  );
}
