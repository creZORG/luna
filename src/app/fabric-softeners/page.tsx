
import { getProducts } from "@/services/product.service";
import { ProductCard } from "@/app/products/_components/product-card";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: 'Fabric Softeners | Luna Essentials',
    description: 'Wrap your clothes in irresistible softness and lasting freshness.',
};

export default async function FabricSoftenersPage() {
    const allProducts = await getProducts();
    const fabricSofteners = allProducts.filter(p => p.category === 'fabric-softener');

    return (
        <div className="container mx-auto px-4 py-12 md:py-20">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-headline font-bold">Fabric Softeners</h1>
                <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
                    Experience ultimate softness and long-lasting, fresh scents for your laundry with our premium fabric softeners.
                </p>
            </div>

            {fabricSofteners.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                    {fabricSofteners.map(product => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-16 border-2 border-dashed rounded-lg">
                    <h2 className="text-xl font-semibold">No Fabric Softeners Available</h2>
                    <p className="text-muted-foreground mt-2">Please check back later for our collection of fabric softeners.</p>
                </div>
            )}
        </div>
    )
}
