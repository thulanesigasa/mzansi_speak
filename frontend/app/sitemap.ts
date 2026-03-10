import { MetadataRoute } from 'next'
import { createClient } from '@supabase/supabase-js'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://bessyqfhiqqopsethbyj.supabase.co';
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'dummy_key_for_build';
    const supabase = createClient(supabaseUrl, supabaseKey);

    let sitemapItems: MetadataRoute.Sitemap = [
        {
            url: 'https://mzansi-speak.com',
            lastModified: new Date(),
            changeFrequency: 'always',
            priority: 1,
        },
    ];

    try {
        const { data: voices } = await supabase.from("voices").select("id");

        if (voices && voices.length > 0) {
            const dynamicUrls = voices.map((voice: { id: string }) => ({
                url: `https://mzansi-speak.com/voice/${voice.id}`,
                lastModified: new Date(),
                changeFrequency: 'weekly' as const,
                priority: 0.8,
            }));
            sitemapItems = [...sitemapItems, ...dynamicUrls];
        }
    } catch (e) {
        console.error("Failed to fetch voices for sitemap:", e);
    }

    return sitemapItems;
}
