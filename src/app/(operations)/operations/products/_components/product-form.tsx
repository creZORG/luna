
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
import { Loader, Trash, Plus } from 'lucide-react';
import { productService, ProductUpdateData } from '@/services/product.service';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { Product } from '@/lib/data';

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
  imageId: z.string().min(2, 'Image ID is too short'),
  galleryImageIds: z.array(z.object({ id: z.string().min(1, "ID cannot be empty") })).optional(),
  sizes: z.array(z.object({
    size: z.string().min(1, "Size cannot be empty"),
    price: z.coerce.number().optional(), // Price is now optional
  })).min(1, "Add at least one size"),
});

export type ProductFormData = z.infer<typeof formSchema>;

interface ProductFormProps {
    role?: "admin" | "operations";
    product?: Product; // For editing
}


export function ProductForm({ role = "operations", product }: ProductFormProps) {
    const isEditMode = !!product;
    const form = useForm<ProductFormData>({
        resolver: zodResolver(formSchema),
        defaultValues: isEditMode ? {
            ...product,
            keyBenefits: product.keyBenefits.join('\n'),
            ingredients: product.ingredients.join(', '),
            galleryImageIds: product.galleryImageIds?.map(id => ({ id })) || [],
        } : {
            name: '',
            slug: '',
            description: '',
            shortDescription: '',
            sizes: [{ size: '', price: 0 }],
            keyBenefits: '',
            ingredients: '',
            directions: '',
            cautions: '',
            imageId: '',
            galleryImageIds: [],
        },
    });

  const { toast } = useToast();
  const router = useRouter();

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "sizes"
  });
  
  const { fields: galleryFields, append: appendGallery, remove: removeGallery } = useFieldArray({
      control: form.control,
      name: "galleryImageIds"
  });


  async function onSubmit(values: ProductFormData) {
    try {
       const productPayload: ProductUpdateData = {
        ...values,
        keyBenefits: values.keyBenefits.split('\n').filter(b => b.trim() !== ''),
        ingredients: values.ingredients.split(',').map(i => i.trim()).filter(i => i !== ''),
        galleryImageIds: values.galleryImageIds?.map(item => item.id),
        sizes: values.sizes.map(s => ({
          size: s.size,
          price: role === 'admin' ? s.price || 0 : isEditMode ? (product.sizes.find(ps => ps.size === s.size)?.price || 0) : 0
        }))
      };

      if (isEditMode) {
        await productService.updateProduct(product.id, productPayload);
        toast({
          title: 'Product Updated!',
          description: `The product "${values.name}" has been updated successfully.`,
        });
      } else {
        await productService.createProduct(productPayload as Product);
        toast({
          title: 'Product Created!',
          description: `The product "${values.name}" has been created successfully.`,
        });
      }
      router.push('/operations/products');
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

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          <div className="md:col-span-2 space-y-8">
            
            {/* Show these cards only for Operations role */}
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
                                if (!isEditMode) { // Only auto-update slug on create
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
                    <CardTitle>Sizing {isAdminView && '& Pricing'}</CardTitle>
                    <CardDescription>Add the different sizes {isAdminView && 'and prices'} for this product.</CardDescription>
                </CardHeader>
                <CardContent>
                <div>
                  {fields.map((field, index) => (
                    <div key={field.id} className={`grid ${isAdminView ? 'grid-cols-3' : 'grid-cols-2'} gap-4 items-start mb-4`}>
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
                      {isAdminView && <FormField
                        control={form.control}
                        name={`sizes.${index}.price`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Price</FormLabel>
                            <FormControl>
                              <Input type="number" placeholder="e.g. 220" {...field} value={field.value ?? ''} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />}
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        onClick={() => remove(index)}
                        className="mt-8"
                        disabled={fields.length <= 1}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
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
                    name="imageId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Primary Image ID</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. product-juicy-mango" {...field} />
                        </FormControl>
                        <FormDescription>The main image for the product. Must match an ID in `placeholder-images.json`.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="space-y-2">
                    <FormLabel>Gallery Image IDs</FormLabel>
                     {galleryFields.map((field, index) => (
                        <div key={field.id} className="flex gap-2 items-center">
                             <FormField
                                control={form.control}
                                name={`galleryImageIds.${index}.id`}
                                render={({ field }) => (
                                    <FormItem className="flex-grow">
                                        <FormControl>
                                            <Input placeholder="e.g. juicy-mango-model" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Button type="button" variant="destructive" size="icon" onClick={() => removeGallery(index)}>
                                <Trash className="h-4 w-4" />
                            </Button>
                        </div>
                     ))}
                     <Button type="button" variant="outline" size="sm" onClick={() => appendGallery({ id: '' })}>
                        <Plus className="mr-2 h-4 w-4"/>
                        Add Gallery Image
                     </Button>
                     <FormDescription>Additional images for the product page gallery.</FormDescription>
                  </div>
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
