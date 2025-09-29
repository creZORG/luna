
'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useFieldArray } from 'react-hook-form';
import { z } from 'zod';
import { ALL_CATEGORIES } from '@/lib/data';
import { Loader, Trash, Plus, UploadCloud, X } from 'lucide-react';
import { productService, ProductUpdateData } from '@/services/product.service';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { Product } from '@/lib/data';
import Image from 'next/image';
import { useState } from 'react';
import { cn } from '@/lib/utils';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

const fileSchema = z.any()
  .refine(file => file, "Image is required.")
  .refine(file => file?.size <= MAX_FILE_SIZE, `Max file size is 5MB.`)
  .refine(file => ACCEPTED_IMAGE_TYPES.includes(file?.type), "Only .jpg, .jpeg, .png and .webp formats are supported.");

const formSchema = z.object({
  name: z.string().min(2, 'Name is too short'),
  slug: z.string().min(2, 'Slug is too short').regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens.'),
  description: z.string().min(10, 'Description is too short'),
  shortDescription: z.string().min(10, 'Short description is too short'),
  category: z.enum(ALL_CATEGORIES as [string, ...string[]]),
  keyBenefits: z.string().min(10, 'Key benefits are too short'),
  ingredients: z.string().min(10, 'Ingredients are too short'),
  directions: z.string().min(10, 'Directions are too short'),
  cautions: z.string().min(10, 'Cautions are too short'),
  image: z.any(),
  galleryImages: z.array(z.any()).optional(),
  sizes: z.array(z.object({
    size: z.string().min(1, "Size cannot be empty"),
    price: z.coerce.number().optional(),
    wholesalePrice: z.coerce.number().optional(),
  })).min(1, "Add at least one size"),
  wholesaleDiscountPercentage: z.coerce.number().optional(),
  wholesaleMoq: z.coerce.number().optional(),
});

export type ProductFormData = z.infer<typeof formSchema>;

interface ProductFormProps {
    role?: "admin" | "operations";
    product?: Product; // For editing
    wholesaleDiscount?: number;
}

export function ProductForm({ role = "operations", product, wholesaleDiscount = 0 }: ProductFormProps) {
    const isEditMode = !!product;
    const { toast } = useToast();
    const router = useRouter();

    const [imagePreview, setImagePreview] = useState<string | null>(product?.imageUrl || null);
    const [galleryPreviews, setGalleryPreviews] = useState<string[]>(product?.galleryImageUrls || []);

    const form = useForm<ProductFormData>({
        resolver: zodResolver(formSchema),
        defaultValues: isEditMode ? {
            ...product,
            keyBenefits: product.keyBenefits.join('\n'),
            ingredients: product.ingredients.join(', '),
            image: product.imageUrl,
            galleryImages: product.galleryImageUrls,
        } : {
            name: '',
            slug: '',
            description: '',
            shortDescription: '',
            sizes: [{ size: '', price: 0, wholesalePrice: 0 }],
            keyBenefits: '',
            ingredients: '',
            directions: '',
            cautions: '',
            image: undefined,
            galleryImages: [],
        },
    });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "sizes"
  });
  
  const { fields: galleryFields, append: appendGallery, remove: removeGallery } = useFieldArray({
      control: form.control,
      name: "galleryImages"
  });

  const toDataUri = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
  };

  async function onSubmit(values: ProductFormData) {
    try {
        const imageAsDataUri = values.image instanceof File ? await toDataUri(values.image) : (isEditMode ? product.imageUrl : undefined);
        const galleryAsDataUris = values.galleryImages ? await Promise.all(
            values.galleryImages.map(img => img instanceof File ? toDataUri(img) : Promise.resolve(img))
        ) : [];

       const productPayload: ProductUpdateData = {
        ...values,
        keyBenefits: values.keyBenefits.split('\n').filter(b => b.trim() !== ''),
        ingredients: values.ingredients.split(',').map(i => i.trim()).filter(i => i !== ''),
        imageUrl: imageAsDataUri,
        galleryImageUrls: galleryAsDataUris,
        sizes: values.sizes.map(s => {
          const retailPrice = s.price || 0;
          const wholesaleCalc = retailPrice * (1 - (wholesaleDiscount / 100));
          return {
            size: s.size,
            price: retailPrice,
            wholesalePrice: role === 'admin' ? wholesaleCalc : (isEditMode ? (product.sizes.find(ps => ps.size === s.size)?.wholesalePrice || 0) : 0),
          };
        }),
      };

      if (isEditMode) {
        await productService.updateProduct(product.id, productPayload);
        toast({
          title: 'Product Updated!',
          description: `The product "${values.name}" has been updated successfully.`,
        });
      } else {
        await productService.createProduct(productPayload as Omit<Product, 'id'>);
        toast({
          title: 'Product Created!',
          description: `The product "${values.name}" has been created successfully.`,
        });
      }
      router.push(role === 'admin' ? '/admin/products' : '/operations/products');
      router.refresh();
    } catch (error) {
      console.error("Error saving product:", error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'There was a problem saving the product. Please try again.',
      });
    }
  }

  const isSubmitting = form.formState.isSubmitting;
  const isAdminView = role === 'admin';

  const prices = form.watch('sizes');

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          <div className="md:col-span-2 space-y-8">
            
            {!isAdminView && (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle>Product Details</CardTitle>
                    <CardDescription>
                      Fill in the details of the product.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Name</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. Juicy Mango Shower Gel" {...field} 
                              onChange={(e) => {
                                field.onChange(e);
                                if (!isEditMode) {
                                    const newSlug = e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
                                    form.setValue('slug', newSlug);
                                }
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="slug"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Slug</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. juicy-mango-shower-gel" {...field} disabled={isEditMode} />
                          </FormControl>
                          <FormDescription>This is the URL-friendly version of the name. It cannot be changed after creation.</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="shortDescription"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Short Description</FormLabel>
                          <FormControl>
                            <Textarea placeholder="A one-liner that appears in product listings." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Description</FormLabel>
                          <FormControl>
                            <Textarea placeholder="A detailed description for the product page." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </>
            )}

             <Card>
                <CardHeader>
                    <CardTitle>Sizing & Pricing</CardTitle>
                    <CardDescription>
                      {isAdminView 
                        ? "Set the Recommended Retail Price (RRP) for each size. The wholesale price is calculated automatically based on the global discount."
                        : "Add the different sizes available for this product. Pricing is set by an administrator."
                      }
                    </CardDescription>
                </CardHeader>
                <CardContent>
                <div>
                  {fields.map((field, index) => {
                    const rrp = prices?.[index]?.price || 0;
                    const wholesalePrice = rrp * (1 - (wholesaleDiscount / 100));

                    return (
                      <div key={field.id} className={`grid ${isAdminView ? 'grid-cols-4' : 'grid-cols-2'} gap-4 items-end mb-4`}>
                        <FormField
                          control={form.control}
                          name={`sizes.${index}.size`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Size</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g. 500ml" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        {isAdminView && (
                          <>
                            <FormField
                              control={form.control}
                              name={`sizes.${index}.price`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>RRP (Ksh)</FormLabel>
                                  <FormControl>
                                    <Input type="number" placeholder="e.g. 220" {...field} value={field.value ?? ''} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <div className="space-y-2">
                               <Label>Wholesale (Ksh)</Label>
                               <Input type="text" readOnly disabled value={wholesalePrice.toFixed(2)} />
                            </div>
                          </>
                        )}
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          onClick={() => remove(index)}
                          disabled={fields.length <= 1}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    );
                  })}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => append({ size: "", price: 0 })}
                  >
                    Add Size
                  </Button>
                </div>
                </CardContent>
             </Card>

            {!isAdminView && (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle>Additional Information</CardTitle>
                    <CardDescription>Provide more details about the product's benefits, ingredients, and usage.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="keyBenefits"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Key Benefits</FormLabel>
                          <FormControl>
                            <Textarea placeholder="List key benefits..." {...field} />
                          </FormControl>
                          <FormDescription>Separate each benefit with a new line.</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="ingredients"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Ingredients</FormLabel>
                          <FormControl>
                            <Textarea placeholder="List ingredients..." {...field} />
                          </FormControl>
                          <FormDescription>Separate each ingredient with a comma.</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="directions"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Directions for Use</FormLabel>
                          <FormControl>
                            <Textarea placeholder="How to use the product" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="cautions"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Cautions</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Any cautions or warnings" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </>
            )}
          </div>

          {!isAdminView && (
            <div className="space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle>Organization & Images</CardTitle>
                </CardHeader>
                <CardContent className='space-y-6'>
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                      <FormLabel>Category</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {ALL_CATEGORIES.map((cat) => (
                              <SelectItem key={cat} value={cat}>
                                {cat.charAt(0).toUpperCase() + cat.slice(1).replace(/-/g, ' ')}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                    <FormField
                        control={form.control}
                        name="image"
                        render={({ field: { onChange, value, ...rest } }) => (
                            <FormItem>
                            <FormLabel>Primary Image</FormLabel>
                            <FormControl>
                                <div className={cn("relative w-full h-48 border-2 border-dashed rounded-lg flex flex-col justify-center items-center text-muted-foreground", imagePreview && "border-solid")}>
                                    {imagePreview ? (
                                        <>
                                            <Image src={imagePreview} alt="Primary image preview" layout="fill" objectFit="contain" className="rounded-lg p-2" />
                                            <Button variant="destructive" size="icon" className="absolute top-2 right-2 h-7 w-7" onClick={() => { onChange(null); setImagePreview(null); }}>
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </>
                                    ) : (
                                        <>
                                            <UploadCloud className="h-10 w-10" />
                                            <span>Click or drag to upload</span>
                                        </>
                                    )}
                                    <Input
                                        type="file"
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        accept={ACCEPTED_IMAGE_TYPES.join(",")}
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) {
                                                onChange(file);
                                                setImagePreview(URL.createObjectURL(file));
                                            }
                                        }}
                                        {...rest}
                                    />
                                </div>
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                    
                    <FormField
                        control={form.control}
                        name="galleryImages"
                        render={({ field: { onChange, value } }) => (
                            <FormItem>
                            <FormLabel>Gallery Images</FormLabel>
                            <div className="grid grid-cols-2 gap-4">
                                {galleryPreviews.map((src, index) => (
                                    <div key={index} className="relative w-full aspect-square border rounded-lg">
                                        <Image src={src} alt={`Gallery image ${index + 1}`} layout="fill" objectFit="cover" className="rounded-lg" />
                                        <Button
                                            type="button"
                                            variant="destructive"
                                            size="icon"
                                            className="absolute top-1 right-1 h-6 w-6"
                                            onClick={() => {
                                                const newValue = [...(value || [])];
                                                newValue.splice(index, 1);
                                                onChange(newValue);
                                                setGalleryPreviews(prev => prev.filter((_, i) => i !== index));
                                            }}
                                        >
                                            <X className="h-3 w-3" />
                                        </Button>
                                    </div>
                                ))}

                                <FormControl>
                                    <div className="relative w-full aspect-square border-2 border-dashed rounded-lg flex flex-col justify-center items-center text-muted-foreground">
                                        <UploadCloud className="h-8 w-8" />
                                        <span>Add Image</span>
                                        <Input
                                            type="file"
                                            multiple
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                            accept={ACCEPTED_IMAGE_TYPES.join(",")}
                                            onChange={(e) => {
                                                const files = Array.from(e.target.files || []);
                                                const currentFiles = value || [];
                                                onChange([...currentFiles, ...files]);
                                                
                                                const newPreviews = files.map(file => URL.createObjectURL(file));
                                                setGalleryPreviews(prev => [...prev, ...newPreviews]);
                                            }}
                                        />
                                    </div>
                                </FormControl>
                            </div>
                             <FormMessage />
                             </FormItem>
                        )}
                    />
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader className="mr-2 h-4 w-4 animate-spin" />}
            {isEditMode ? 'Save Changes' : 'Create Product'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
