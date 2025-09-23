import { products } from '@/lib/data';
import ProductsPageClient from './_components/products-page-client';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Our Products | Luna Essentials',
  description: 'Discover the full range of Luna products, crafted for your daily needs.',
};

export default function ProductsPage() {
  return <ProductsPageClient products={products} />;
}
