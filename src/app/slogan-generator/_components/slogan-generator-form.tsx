'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { generateSlogansAction, type SloganState } from '../actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useEffect, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Wand2, Loader2, Lightbulb } from 'lucide-react';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Generating...
        </>
      ) : (
        <>
          <Wand2 className="mr-2 h-4 w-4" />
          Generate Slogans
        </>
      )}
    </Button>
  );
}

export default function SloganGeneratorForm() {
  const initialState: SloganState = {};
  const [state, formAction] = useFormState(generateSlogansAction, initialState);
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.message && !state.slogans) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: state.message,
      });
    }
    if (state.slogans && state.slogans.length > 0) {
        formRef.current?.reset();
    }
  }, [state, toast]);

  return (
    <>
      <Card>
        <form ref={formRef} action={formAction}>
          <CardHeader>
            <CardTitle>Create Your Slogan</CardTitle>
            <CardDescription>
              Enter details below to get AI-powered slogan ideas.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="productCategory">Product Category</Label>
              <Input
                id="productCategory"
                name="productCategory"
                placeholder="e.g., Shower Gel, Fabric Softener"
              />
              {state.errors?.productCategory && (
                <p className="text-sm text-destructive">{state.errors.productCategory[0]}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="coreIngredients">Core Ingredients</Label>
              <Input
                id="coreIngredients"
                name="coreIngredients"
                placeholder="e.g., Mango, Lavender, Citrus"
              />
              {state.errors?.coreIngredients && (
                <p className="text-sm text-destructive">{state.errors.coreIngredients[0]}</p>
              )}
            </div>
          </CardContent>
          <CardFooter>
            <SubmitButton />
          </CardFooter>
        </form>
      </Card>

      {state.slogans && state.slogans.length > 0 && (
        <div className="mt-8">
            <h2 className="text-2xl font-headline font-semibold text-center mb-6">Generated Slogans</h2>
            <div className="grid grid-cols-1 gap-4">
                {state.slogans.map((slogan, index) => (
                    <Card key={index} className="bg-primary/10 border-primary/20">
                        <CardContent className="p-6 flex items-start gap-4">
                            <Lightbulb className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                            <p className="text-lg font-medium text-foreground">{slogan}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
      )}
    </>
  );
}
