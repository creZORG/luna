'use client';

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ALL_CATEGORIES, ALL_FEATURES, ALL_SCENTS } from "@/lib/data";
import { Filter } from "lucide-react";

type ProductFiltersProps = {
    selectedCategories: string[];
    setSelectedCategories: (categories: string[]) => void;
    selectedFeatures: string[];
    setSelectedFeatures: (features: string[]) => void;
    selectedScents: string[];
    setSelectedScents: (scents: string[]) => void;
};

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1).replace(/-/g, ' ');

function FiltersContent({
    selectedCategories,
    setSelectedCategories,
    selectedFeatures,
    setSelectedFeatures,
    selectedScents,
    setSelectedScents
}: ProductFiltersProps) {

    const handleCategoryChange = (value: string) => {
        setSelectedCategories([value]);
    };

    const handleFeatureChange = (feature: string) => {
        setSelectedFeatures(
            selectedFeatures.includes(feature)
                ? selectedFeatures.filter(f => f !== feature)
                : [...selectedFeatures, feature]
        );
    };

    const handleScentChange = (scent: string) => {
        setSelectedScents(
            selectedScents.includes(scent)
                ? selectedScents.filter(s => s !== scent)
                : [...selectedScents, scent]
        );
    };

    return (
        <div className="space-y-6">
            <Accordion type="multiple" defaultValue={['category', 'features', 'scent']} className="w-full">
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

                <AccordionItem value="features">
                    <AccordionTrigger className="font-headline text-lg">Features</AccordionTrigger>
                    <AccordionContent className="space-y-2">
                        {ALL_FEATURES.map(feature => (
                            <div key={feature} className="flex items-center space-x-2">
                                <Checkbox
                                    id={`feat-${feature}`}
                                    checked={selectedFeatures.includes(feature)}
                                    onCheckedChange={() => handleFeatureChange(feature)}
                                />
                                <Label htmlFor={`feat-${feature}`}>{capitalize(feature)}</Label>
                            </div>
                        ))}
                    </AccordionContent>
                </AccordionItem>

                <AccordionItem value="scent">
                    <AccordionTrigger className="font-headline text-lg">Scent Profile</AccordionTrigger>
                    <AccordionContent className="space-y-2">
                        {ALL_SCENTS.map(scent => (
                            <div key={scent} className="flex items-center space-x-2">
                                <Checkbox
                                    id={`scent-${scent}`}
                                    checked={selectedScents.includes(scent)}
                                    onCheckedChange={() => handleScentChange(scent)}
                                />
                                <Label htmlFor={`scent-${scent}`}>{capitalize(scent)}</Label>
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
