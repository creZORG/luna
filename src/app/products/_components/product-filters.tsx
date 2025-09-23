'use client';

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ALL_CATEGORIES, ALL_SIZES } from "@/lib/data";
import { Filter } from "lucide-react";

type ProductFiltersProps = {
    selectedCategories: string[];
    setSelectedCategories: (categories: string[]) => void;
    selectedSizes: string[];
    setSelectedSizes: (sizes: string[]) => void;
};

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1).replace(/-/g, ' ');

function FiltersContent({
    selectedCategories,
    setSelectedCategories,
    selectedSizes,
    setSelectedSizes
}: ProductFiltersProps) {

    const handleCategoryChange = (value: string) => {
        setSelectedCategories([value]);
    };

    const handleSizeChange = (size: string) => {
        setSelectedSizes(
            selectedSizes.includes(size)
                ? selectedSizes.filter(s => s !== size)
                : [...selectedSizes, size]
        );
    };

    return (
        <div className="space-y-6">
            <Accordion type="multiple" defaultValue={['category', 'size']} className="w-full">
                <AccordionItem value="category">
                    <AccordionTrigger className="font-headline text-lg">Category</AccordionTrigger>
                    <AccordionContent>
                        <RadioGroup
                            value={selectedCategories[0] || 'all'}
                            onValueChange={handleCategoryChange}
                            className="space-y-2"
                        >
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="all" id="cat-all" />
                                <Label htmlFor="cat-all">All Products</Label>
                            </div>
                            {ALL_CATEGORIES.map(category => (
                                <div key={category} className="flex items-center space-x-2">
                                    <RadioGroupItem value={category} id={`cat-${category}`} />
                                    <Label htmlFor={`cat-${category}`}>{capitalize(category)}</Label>
                                </div>
                            ))}
                        </RadioGroup>
                    </AccordionContent>
                </AccordionItem>

                <AccordionItem value="size">
                    <AccordionTrigger className="font-headline text-lg">Size</AccordionTrigger>
                    <AccordionContent className="space-y-2">
                        {ALL_SIZES.map(size => (
                            <div key={size} className="flex items-center space-x-2">
                                <Checkbox
                                    id={`size-${size}`}
                                    checked={selectedSizes.includes(size)}
                                    onCheckedChange={() => handleSizeChange(size)}
                                />
                                <Label htmlFor={`size-${size}`}>{size}</Label>
                            </div>
                        ))}
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
        </div>
    );
}

export default function ProductFilters(props: ProductFiltersProps) {
    return (
        <>
            <div className="lg:hidden mb-4">
                <Sheet>
                    <SheetTrigger asChild>
                        <Button variant="outline" className="w-full">
                            <Filter className="mr-2 h-4 w-4" />
                            Filters
                        </Button>
                    </SheetTrigger>
                    <SheetContent>
                        <SheetHeader>
                            <SheetTitle className="font-headline">Filters</SheetTitle>
                        </SheetHeader>
                        <div className="py-4">
                            <FiltersContent {...props} />
                        </div>
                    </SheetContent>
                </Sheet>
            </div>
            <aside className="hidden lg:block sticky top-24">
                <h2 className="font-headline text-2xl font-bold mb-4">Filters</h2>
                <FiltersContent {...props} />
            </aside>
        </>
    );
}
