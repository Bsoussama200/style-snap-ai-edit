import { useEffect } from 'react';
import ProductWizard from '@/components/ProductWizard';

const Index = () => {
  useEffect(() => {
    document.title = 'Product Content Generator - Viral Video from Photos';
    const desc = 'Upload a product photo and generate a compelling AI video prompt and 5s vertical video.';
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

export default Index;
