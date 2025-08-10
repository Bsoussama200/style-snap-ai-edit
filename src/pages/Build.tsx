import { useEffect } from 'react';
import ProductWizard from '@/components/ProductWizard';

const Build = () => {
  useEffect(() => {
    document.title = 'TikTok Builder - Generate Viral Product Videos';
    const desc = 'Upload product images, analyze, pick generator (Runway or VEO3), and create a vertical video with AI.';
    let meta = document.querySelector('meta[name="description"]') as HTMLMetaElement | null;
    if (!meta) {
      meta = document.createElement('meta');
      meta.name = 'description';
      document.head.appendChild(meta);
    }
    meta.content = desc;

    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = window.location.href;
  }, []);

  return <ProductWizard />;
};

export default Build;
