const SITE_URL = 'https://brotinho.app';

export default function sitemap() {
  const lastModified = new Date();
  return [
    {
      url: `${SITE_URL}/`,
      lastModified,
      changeFrequency: 'weekly',
      priority: 1.0,
      alternates: {
        languages: { 'pt-BR': `${SITE_URL}/` },
      },
    },
  ];
}
