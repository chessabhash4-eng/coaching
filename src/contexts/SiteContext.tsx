import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { fetchSite, type SiteData } from '../lib/api';

const empty: SiteData = { settings: {}, courses: [], features: [], stats: [], results: [], faculty: [], testimonials: [] };

type Ctx = { data: SiteData; loading: boolean; error: string | null; reload: () => void };
const SiteContext = createContext<Ctx>({ data: empty, loading: true, error: null, reload: () => {} });

export function SiteProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<SiteData>(empty);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setError(null);
      const d = await fetchSite();
      setData(d);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    document.title = data.settings.institute_name || 'Root Career Institute';
  }, [data.settings.institute_name]);

  return <SiteContext.Provider value={{ data, loading, error, reload: load }}>{children}</SiteContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export const useSite = () => useContext(SiteContext);
