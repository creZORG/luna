import { products } from '@/lib/data';
import { notFound } from 'next/navigation';
import ProductDetailClient from './_components/product-detail-client';
import type { Metadata, ResolvingMetadata } from 'next';

type Props = {
  params: { slug: string };
};

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const product = products.find(p => p.slug === params.slug);

  if (!product) {
    return {
        title: 'Product Not Found',
        description: "The product you are looking for does not exist.",
    };
  }

  return {
    title: `${product.name} | Luna Essentials`,
    description: product.description,
  };
}

export async function generateStaticParams() {
    return products.map(product => ({
      slug: product.slug,
    }));
}

export default function ProductDetailPage({ params }: Props) {
  const { slug } = params;
  const product = products.find(p => p.slug === slug);

  if (!product) {
    notFound();
  }

  return <ProductDetailClient product={product} />;
}
