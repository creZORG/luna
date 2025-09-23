'use client';

import { Button } from "@/components/ui/button";
import { ALL_CATEGORIES } from "@/lib/data";

type ProductFiltersProps = {
    selectedCategory: string;
    setSelectedCategory: (category: string) => void;
};

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1).replace(/-/g, ' ');

export default function ProductFilters({ selectedCategory, setSelectedCategory }: ProductFiltersProps) {

    const categories = ['all', ...ALL_CATEGORIES];

    return (
        <div className="flex flex-wrap justify-center gap-2 mb-8">
            {categories.map(category => (
                <Button
                    key={category}
                    variant={selectedCategory === category ? 'default' : 'outline'}
                    onClick={() => setSelectedCategory(category)}
                    className="rounded-full"
                >
                    {category === 'all' ? 'All Products' : capitalize(category)}
                </Button>
            ))}
        </div>
    );
}
