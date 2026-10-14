import { getImage } from 'astro:assets';
import heroImg from '../assets/photos/terrace-sunset.jpg';

// Shared by Hero.astro (renders it) and Base.astro (preloads it), so the
// preload srcset always matches what the <picture> requests.
const widths = [480, 768, 1080, 1440];
export const heroSizes = '(min-width: 1024px) 58vw, 100vw';
export const heroAvif = await getImage({ src: heroImg, format: 'avif', widths, quality: 60 });
export const heroWebp = await getImage({ src: heroImg, format: 'webp', widths, quality: 70 });
export const heroFallback = await getImage({ src: heroImg, format: 'jpg', width: 1080, quality: 72 });
export { heroImg };
