import ProductsPageClient from './_components/products-page-client';
import type { Metadata } from 'next';
import { productService } from '@/services/product.service';
import { Product } from '@/lib/data';

export const metadata: Metadata = {
  title: 'Our Products | Luna Essentials',
  description: 'Discover the full range of Luna products, crafted for your daily needs.',
};

export default async function ProductsPage() {
  const products: Product[] = await productService.getProducts();
  return <ProductsPageClient products={products} />;
}
