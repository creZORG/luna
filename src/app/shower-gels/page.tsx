
import { getProducts } from "@/services/product.service";
import { ProductCard } from "@/app/products/_components/product-card";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: 'Shower Gels | Luna Essentials',
    description: 'Explore our luxurious collection of vegan and natural shower gels.',
};

export default async function ShowerGelsPage() {
    const allProducts = await getProducts();
    const showerGels = allProducts.filter(p => p.category === 'shower-gel');

    return (
        <div className="container mx-auto px-4 py-12 md:py-20">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-headline font-bold">Shower Gels</h1>
                <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
                    Indulge your senses with our vibrant collection of shower gels, crafted with natural fragrances to cleanse and refresh.
                </p>
            </div>

            {showerGels.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                    {showerGels.map(product => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-16 border-2 border-dashed rounded-lg">
                    <h2 className="text-xl font-semibold">No Shower Gels Available</h2>
                    <p className="text-muted-foreground mt-2">Please check back later for our collection of shower gels.</p>
                </div>
            )}
        </div>
    )
}
