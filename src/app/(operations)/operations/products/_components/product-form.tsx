
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
import { Loader, Trash, Plus, UploadCloud, X, Save, Eraser } from 'lucide-react';
import { productService } from '@/services/product.service';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { Product } from '@/lib/data';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';

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
  imageUrl: z.any().optional(),
  galleryImageUrls: z.array(z.any()).optional(),
  sizes: z.array(z.object({
    size: z.string().min(1, "Size cannot be empty"),
    price: z.coerce.number().optional(), // Price is optional for ops manager
  })).min(1, "Add at least one size"),
});

export type ProductFormData = z.infer<typeof formSchema>;

interface ProductFormProps {
    product?: Product; // For editing
}

export function ProductForm({ product }: ProductFormProps) {
    const isEditMode = !!product;
    const { toast } = useToast();
    const router = useRouter();

    const [imagePreview, setImagePreview] = useState<string | null>(product?.imageUrl || null);
    const [galleryPreviews, setGalleryPreviews] = useState<string[]>(product?.galleryImageUrls || []);
    const [draftStatus, setDraftStatus] = useState<'unsaved' | 'saving' | 'saved'>('unsaved');

    const form = useForm<ProductFormData>({
        resolver: zodResolver(formSchema),
        defaultValues: isEditMode ? {
            ...product,
            keyBenefits: product.keyBenefits.join('\n'),
            ingredients: product.ingredients.join(', '),
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
            imageUrl: undefined,
            galleryImageUrls: [],
        },
    });

    const getDraftKey = () => `product-draft-${product?.id || 'new'}`;

    // Load draft from local storage on mount
    useEffect(() => {
        const draftKey = getDraftKey();
        const savedDraft = localStorage.getItem(draftKey);
        if (savedDraft) {
            try {
                const draftData = JSON.parse(savedDraft);
                form.reset(draftData);
                 if (draftData.imageUrl) setImagePreview(draftData.imageUrl);
                 if (draftData.galleryImageUrls) setGalleryPreviews(draftData.galleryImageUrls);
                toast({ title: "Draft Loaded", description: "Your previous work has been restored." });
            } catch (e) {
                console.error("Failed to parse draft:", e);
            }
        }
    }, [form, product?.id, toast]);


    // Auto-save to local storage on change
    useEffect(() => {
        const subscription = form.watch((value) => {
            setDraftStatus('saving');
            const draftKey = getDraftKey();
            const draftData = {
                ...value,
                imageUrl: imagePreview,
                galleryImageUrls: galleryPreviews,
            };
            localStorage.setItem(draftKey, JSON.stringify(draftData));
            setTimeout(() => setDraftStatus('saved'), 500); // Simulate save delay
        });
        return () => subscription.unsubscribe();
    }, [form.watch, imagePreview, galleryPreviews, product?.id]);
    
    const handleClearDraft = () => {
        const draftKey = getDraftKey();
        localStorage.removeItem(draftKey);
        form.reset(isEditMode ? {
            ...product,
            keyBenefits: product.keyBenefits.join('\n'),
            ingredients: product.ingredients.join(', '),
        } : {
            name: '', slug: '', description: '', shortDescription: '',
            sizes: [{ size: '', price: 0 }], keyBenefits: '', ingredients: '',
            directions: '', cautions: '', imageUrl: undefined, galleryImageUrls: [],
        });
        setImagePreview(product?.imageUrl || null);
        setGalleryPreviews(product?.galleryImageUrls || []);
        toast({ title: "Draft Cleared", description: "The form has been reset." });
    };

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "sizes"
  });
  
  const { fields: galleryFields, append: appendGallery, remove: removeGallery } = useFieldArray({
      control: form.control,
      name: "galleryImageUrls"
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
        const finalImageUrl = imagePreview && imagePreview.startsWith('data:') 
          ? await uploadImageFlow({ imageDataUri: imagePreview, folder: 'products' })
          : imagePreview;
        
        const finalGalleryUrls = await Promise.all(
            (galleryPreviews || []).map(async (img) => {
                if (img && img.startsWith('data:')) {
                    return await uploadImageFlow({ imageDataUri: img, folder: 'products' });
                }
                return img;
            })
        );
      
       const productPayload = {
        ...values,
        keyBenefits: values.keyBenefits.split('\n').filter(b => b.trim() !== ''),
        ingredients: values.ingredients.split(',').map(i => i.trim()).filter(i => i !== ''),
        imageUrl: finalImageUrl,
        galleryImageUrls: finalGalleryUrls.filter(url => url),
        sizes: values.sizes.map(s => {
          return {
            size: s.size,
            price: isEditMode ? (product.sizes.find(ps => ps.size === s.size)?.price || 0) : 0,
            wholesalePrice: isEditMode ? (product.sizes.find(ps => ps.size === s.size)?.wholesalePrice || 0) : 0,
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
      
      // Clear draft on successful submission
      localStorage.removeItem(getDraftKey());

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

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          <div className="md:col-span-2 space-y-8">
            
              <Card>
                <CardHeader>
                  <CardTitle>Product Details</CardTitle>
                  <CardDescription>
                    Fill in the details of the product. Pricing will be set by an administrator later.
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
              
              <Card>
                <CardHeader>
                    <CardTitle>Sizing</CardTitle>
                    <CardDescription>
                      Add the different sizes available for this product.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                <div>
                  {fields.map((field, index) => (
                    <div key={field.id} className="grid grid-cols-[1fr_auto] gap-4 items-end mb-4">
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
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => append({ size: "" })}
                  >
                    <Plus className="mr-2 h-4 w-4" /> Add Size
                  </Button>
                </div>
                </CardContent>
             </Card>

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
          </div>

          <div className="space-y-8 sticky top-24">
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
                      name="imageUrl"
                      render={({ field: { onChange, value, ...rest } }) => (
                          <FormItem>
                          <FormLabel>Primary Image</FormLabel>
                          <FormControl>
                              <div className={cn("relative w-full h-48 border-2 border-dashed rounded-lg flex flex-col justify-center items-center text-muted-foreground", imagePreview && "border-solid")}>
                                  {imagePreview ? (
                                      <>
                                          <Image src={imagePreview} alt="Primary image preview" layout="fill" objectFit="contain" className="rounded-lg p-2" />
                                          <Button variant="destructive" size="icon" className="absolute top-2 right-2 h-7 w-7" onClick={() => { setImagePreview(null); }}>
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
                                              const reader = new FileReader();
                                              reader.onloadend = () => {
                                                  setImagePreview(reader.result as string);
                                              };
                                              reader.readAsDataURL(file);
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
                      name="galleryImageUrls"
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
                                              const newPreviews: string[] = [];
                                              files.forEach(file => {
                                                  const reader = new FileReader();
                                                  reader.onloadend = () => {
                                                      newPreviews.push(reader.result as string);
                                                      if (newPreviews.length === files.length) {
                                                          setGalleryPreviews(prev => [...prev, ...newPreviews]);
                                                      }
                                                  };
                                                  reader.readAsDataURL(file);
                                              });
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
            <Card>
                <CardHeader>
                    <CardTitle>Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                     <div className="flex justify-between items-center text-sm text-muted-foreground">
                        <span>Draft Status:</span>
                        <span className="font-medium flex items-center gap-2">
                           {draftStatus === 'saving' && <Loader className="h-4 w-4 animate-spin" />}
                           {draftStatus === 'saved' && <Save className="h-4 w-4 text-green-500" />}
                           {draftStatus === 'saved' ? 'Saved' : 'Saving...'}
                        </span>
                    </div>
                    <Button type="button" variant="outline" className="w-full" onClick={handleClearDraft}>
                        <Eraser className="mr-2 h-4 w-4"/>
                        Clear Draft
                    </Button>
                    <Button type="submit" disabled={isSubmitting} className="w-full">
                        {isSubmitting ? (
                            <Loader className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <Save className="mr-2 h-4 w-4" />
                        )}
                        {isEditMode ? 'Save Changes' : 'Create Product'}
                    </Button>
                </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </Form>
  );
}
