'use client';

import { Banner } from '@/lib/types';
import BannerSlider from './BannerSlider';

export default function BannerSliderWrapper({ banners }: { banners: Banner[] }) {
    return <BannerSlider banners={banners} />;
}

