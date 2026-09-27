import {
  BookOpen, Brain, CalendarCheck, ChartLine, Clock, FileText, GraduationCap, HeartHandshake, Laptop, Lightbulb, MessageCircleQuestion,
  Microscope, NotebookPen, Rocket, ShieldCheck, Target, Trophy, Users, Video, Atom, Award, type LucideIcon,
} from 'lucide-react';

export const ICONS: Record<string, LucideIcon> = {
  book: BookOpen,
  brain: Brain,
  calendar: CalendarCheck,
  chart: ChartLine,
  clock: Clock,
  file: FileText,
  cap: GraduationCap,
  heart: HeartHandshake,
  laptop: Laptop,
  bulb: Lightbulb,
  doubt: MessageCircleQuestion,
  microscope: Microscope,
  notebook: NotebookPen,
  rocket: Rocket,
  shield: ShieldCheck,
  target: Target,
  trophy: Trophy,
  users: Users,
  video: Video,
  atom: Atom,
  award: Award,
};

export default function Icon({ name, className }: { name: string; className?: string }) {
  const C = ICONS[name] || NotebookPen;
  return <C className={className} strokeWidth={1.6} />;
}
