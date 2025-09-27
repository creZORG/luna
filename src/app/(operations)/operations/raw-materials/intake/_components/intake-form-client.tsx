
'use client';

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { RawMaterial } from "@/lib/raw-materials.data";
import { CalendarIcon, Loader, UploadCloud } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { rawMaterialService } from "@/services/raw-material.service";

const formSchema = z.object({
  supplier: z.string().min(2, "Supplier name is required."),
  deliveryNoteId: z.string().min(1, "Delivery note number is required."),
  rawMaterialId: z.string({ required_error: "Please select a raw material." }),
  quantityOnNote: z.coerce.number().min(0.1, "Quantity must be greater than 0."),
  actualQuantity: z.coerce.number().min(0.1, "Actual quantity must be greater than 0."),
  alkalinity: z.string().min(1, "Alkalinity check result is required."),
  batchNumber: z.string().min(1, "Batch number is required."),
  expiryDate: z.date({ required_error: "An expiry date is required." }),
  deliveryNotePhoto: z.instanceof(File, { message: "A photo of the delivery note is required." }),
});

type IntakeFormValues = z.infer<typeof formSchema>;

export default function IntakeFormClient({ rawMaterials }: { rawMaterials: RawMaterial[] }) {
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<IntakeFormValues>({
    resolver: zodResolver(formSchema),
  });

  const onSubmit = async (data: IntakeFormValues) => {
    try {
      // In a real app, userId would come from useAuth() hook
      const userId = 'ops-manager-001'; 
      await rawMaterialService.logIntakeAndupdateInventory(data, userId);
      toast({
        title: "Intake Logged Successfully!",
        description: `The delivery from ${data.supplier} has been logged and inventory has been updated.`,
      });
      form.reset();
      router.refresh();
      router.push('/operations/raw-materials/inventory');
    } catch (error) {
      console.error("Intake submission failed:", error);
      toast({
        variant: "destructive",
        title: "Submission Failed",
        description: "There was an error logging the new delivery. Please try again.",
      });
    }
  };

  const isSubmitting = form.formState.isSubmitting;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Delivery Details</CardTitle>
            <CardDescription>Enter information from the supplier's delivery note.</CardDescription>
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="supplier"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Supplier</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Chem Supplies Inc." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="deliveryNoteId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Delivery Note Number</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., DN-12345" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="rawMaterialId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Raw Material</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a material to log" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {rawMaterials.map(material => (
                          <SelectItem key={material.id} value={material.id}>
                            {material.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
                control={form.control}
                name="deliveryNotePhoto"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Delivery Note Photo</FormLabel>
                        <FormControl>
                             <div 
                                className="border-2 border-dashed border-muted-foreground rounded-lg p-8 text-center cursor-pointer hover:bg-muted relative"
                            >
                                <UploadCloud className="mx-auto h-12 w-12 text-muted-foreground" />
                                <p className="mt-4 text-sm text-muted-foreground">
                                    {field.value ? `Selected: ${field.value.name}` : 'Click to upload or drag & drop'}
                                </p>
                                <Input
                                    type="file"
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    accept="image/*"
                                    onChange={(e) => field.onChange(e.target.files ? e.target.files[0] : null)}
                                />
                            </div>
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
          </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle>Quality & Quantity Checks</CardTitle>
                <CardDescription>Verify the received materials against the delivery note.</CardDescription>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                 <FormField
                    control={form.control}
                    name="quantityOnNote"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Quantity on Note</FormLabel>
                        <FormControl>
                        <Input type="number" placeholder="e.g., 25" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="actualQuantity"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Actual Quantity Received</FormLabel>
                        <FormControl>
                        <Input type="number" placeholder="e.g., 25.1" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="alkalinity"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Alkalinity</FormLabel>
                        <FormControl>
                        <Input placeholder="e.g., 7.2" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="batchNumber"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Batch Number</FormLabel>
                        <FormControl>
                        <Input placeholder="e.g., BATCH-XYZ-001" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="expiryDate"
                    render={({ field }) => (
                        <FormItem className="flex flex-col">
                        <FormLabel>Expiry Date</FormLabel>
                        <Popover>
                            <PopoverTrigger asChild>
                            <FormControl>
                                <Button
                                variant={"outline"}
                                className={cn(
                                    "w-full pl-3 text-left font-normal",
                                    !field.value && "text-muted-foreground"
                                )}
                                >
                                {field.value ? (
                                    format(field.value, "PPP")
                                ) : (
                                    <span>Pick a date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                            </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                disabled={(date) =>
                                date < new Date()
                                }
                                initialFocus
                            />
                            </PopoverContent>
                        </Popover>
                        <FormMessage />
                        </FormItem>
                    )}
                />
            </CardContent>
        </Card>
        
        <div className="flex justify-end">
            <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader className="mr-2 h-4 w-4 animate-spin" />}
                Approve & Add to Inventory
            </Button>
        </div>
      </form>
    </Form>
  );
}
