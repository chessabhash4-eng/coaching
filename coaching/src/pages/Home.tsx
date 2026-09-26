import { RefreshCw } from 'lucide-react';
import Navbar from '../components/Navbar';
import Hero from '../components/hero/Hero';
import Courses from '../components/sections/Courses';
import WhyUs from '../components/sections/WhyUs';
import Results from '../components/sections/Results';
import Faculty from '../components/sections/Faculty';
import Testimonials from '../components/sections/Testimonials';
import Contact from '../components/sections/Contact';
import Footer from '../components/Footer';
import MobileCallBar from '../components/MobileCallBar';
import { Perforation } from '../components/ui/Ink';
import { useSite } from '../contexts/SiteContext';

export default function Home() {
  const { error, reload } = useSite();
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        {error && (
          <div className="page-inner py-6">
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
              Some pages of our notebook didn’t load ({error}).
              <button onClick={reload} className="inline-flex items-center gap-1.5 rounded-full bg-red-700 px-3 py-1.5 text-white">
                <RefreshCw className="h-3.5 w-3.5" /> Try again
              </button>
            </div>
          </div>
        )}
        <Courses />
        <Perforation />
        <WhyUs />
        <Perforation />
        <Results />
        <Perforation />
        <Faculty />
        <Perforation />
        <Testimonials />
        <Perforation />
        <Contact />
      </main>
      <Footer />
      <MobileCallBar />
    </>
  );
}
