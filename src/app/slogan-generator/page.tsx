import SloganGeneratorForm from "./_components/slogan-generator-form";

export default function SloganGeneratorPage() {
  return (
    <div className="container mx-auto px-4 py-12 md:py-20">
      <div className="max-w-3xl mx-auto text-center">
        <h1 className="text-4xl md:text-5xl font-headline font-bold">
          AI Slogan Generator
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Unleash your creativity! Enter a product category and some core
          ingredients to generate unique and catchy advertising slogans for your
          next marketing campaign.
        </p>
      </div>

      <div className="mt-12 max-w-xl mx-auto">
        <SloganGeneratorForm />
      </div>
    </div>
  );
}
