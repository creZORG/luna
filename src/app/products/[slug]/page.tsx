

import { notFound } from 'next/navigation';
import ProductDetailClient from './_components/product-detail-client';
import type { Metadata, ResolvingMetadata } from 'next';
import { getProducts, getProductBySlug, incrementViewCount } from '@/services/product.service';

type Props = {
  params: { slug: string };
};

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const product = await getProductBySlug(params.slug);

  if (!product) {
    return {
        title: 'Product Not Found | Luna Essentials',
        description: "The product you are looking for does not exist. Explore our other high-quality, sustainable products.",
    };
  }

  // optionally access and extend (rather than replace) parent metadata
  // const previousImages = (await parent).openGraph?.images || []

  return {
    title: `${product.name} | Luna Essentials`,
    description: product.shortDescription,
    openGraph: {
        title: `${product.name} | Luna Essentials`,
        description: product.shortDescription,
        images: product.imageUrl ? [product.imageUrl, ...((await parent).openGraph?.images || [])] : [],
    },
  };
}

export async function generateStaticParams() {
    const products = await getProducts();
    if (!products) return [];
    return products.map(product => ({
      slug: product.slug,
    }));
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  // Increment view count - this is a fire-and-forget operation
  incrementViewCount(product.id);

  return <ProductDetailClient product={product} />;
}
