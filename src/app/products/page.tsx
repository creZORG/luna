import ProductsPageClient from './_components/products-page-client';
import type { Metadata } from 'next';
import { getProducts } from '@/services/product.service';
import { Product } from '@/lib/data';

export const metadata: Metadata = {
  title: 'Our Product Catalog | Luna Essentials',
  description: 'Explore the full range of high-quality, sustainable, and natural products manufactured by Luna Essentials. View our collections of shower gels, fabric softeners, and more.',
};

export default async function ProductsPage() {
  const products: Product[] = await getProducts();
  return <ProductsPageClient products={products} />;
}
