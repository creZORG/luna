export type ProductFeature = 'vegan' | 'paraben-free' | 'microplastic-free' | 'natural-fragrance' | 'recycled-packaging';
export type ScentProfile = 'citrus' | 'floral' | 'fruity' | 'minty' | 'warm-earthy';
export type ProductCategory = 'shower-gel' | 'fabric-softener' | 'dish-wash';

export type Product = {
  id: string;
  slug: string;
  name: string;
  category: ProductCategory;
  scentProfile: ScentProfile[];
  features: ProductFeature[];
  sizes: { size: string; price: number }[];
  description: string;
  keyBenefits: string[];
  ingredients: string[];
  directions: string;
  cautions: string;
  imageId: string;
  shortDescription: string;
};

export const products: Product[] = [
  {
    id: '1',
    slug: 'juicy-mango-shower-gel',
    name: 'Juicy Mango Shower Gel',
    category: 'shower-gel',
    scentProfile: ['fruity'],
    features: ['vegan', 'paraben-free', 'microplastic-free', 'natural-fragrance', 'recycled-packaging'],
    sizes: [
      { size: '400ml', price: 180.00 },
      { size: '500ml', price: 220.00 },
      { size: '800ml', price: 320.00 },
    ],
    shortDescription: 'Fresh, Fruity, Irresistible!',
    description: 'A refreshing gel with a rich lather that gently cleanses, leaving skin soft, smooth, and lightly scented with a fruity freshness that lasts.',
    keyBenefits: ['Gently cleanses and refreshes', 'Leaves skin soft and smooth', 'Irresistible fruity fragrance'],
    ingredients: ['Deionised Water', 'SLES 70', 'CDE', 'NaCl', 'PQ7', 'Glycerine', 'Titanium Dioxide', 'Citric Acid', 'Mango Fragrance Oil', 'Phenoxy Ethanol', 'Natural Colours'],
    directions: 'Apply to wet skin or sponge, lather gently, and rinse thoroughly.',
    cautions: 'Store in a cool, dry place away from direct sunlight. Avoid contact with eyes.',
    imageId: 'product-juicy-mango-shower-gel',
  },
  {
    id: '2',
    slug: 'cool-lavender-fabric-softener',
    name: 'Cool Lavender Fabric Softener',
    category: 'fabric-softener',
    scentProfile: ['floral'],
    features: ['vegan', 'paraben-free', 'recycled-packaging'],
    sizes: [
      { size: '750ml', price: 150.00 },
    ],
    shortDescription: 'Irresistible softness and lasting freshness.',
    description: 'Experience the calming scent of lavender fields as our fabric softener leaves your clothes feeling incredibly soft and easy to iron.',
    keyBenefits: ['Long-lasting freshness', 'Makes clothes soft and comfortable', 'Reduces static cling'],
    ingredients: ['Cationic Surfactants', 'Fragrance', 'Preservative', 'Water'],
    directions: 'For top-loading machines, add to the final rinse. For front-loading machines, add to the specified dispenser at the beginning of the wash.',
    cautions: 'Do not pour directly onto fabrics. Keep out of reach of children.',
    imageId: 'product-cool-lavender-fabric-softener',
  },
  {
    id: '3',
    slug: 'fruity-orange-dish-wash',
    name: 'Fruity Orange Dish Wash',
    category: 'dish-wash',
    scentProfile: ['citrus', 'fruity'],
    features: ['vegan', 'natural-fragrance'],
    sizes: [
      { size: '500ml', price: 95.00 },
    ],
    shortDescription: 'Powerful degreasing with a vibrant scent.',
    description: 'Cut through grease and grime with the power of citrus. Our Fruity Orange dish wash leaves your dishes sparkling clean with a refreshing, zesty aroma.',
    keyBenefits: ['Tough on grease', 'Gentle on hands', 'Leaves dishes sparkling clean'],
    ingredients: ['Anionic Surfactants', 'Amphoteric Surfactants', 'Preservative', 'Orange Fragrance Oil', 'Water'],
    directions: 'Apply a small amount to a wet sponge, scrub dishes, and rinse with water.',
    cautions: 'Avoid contact with eyes. If contact occurs, rinse thoroughly with water.',
    imageId: 'product-fruity-orange-dish-wash',
  },
  {
    id: '4',
    slug: 'mint-fresh-shower-gel',
    name: 'Mint Fresh Shower Gel',
    category: 'shower-gel',
    scentProfile: ['minty'],
    features: ['vegan', 'paraben-free', 'natural-fragrance'],
    sizes: [
      { size: '500ml', price: 230.00 },
    ],
    shortDescription: 'An invigorating and cooling cleanse.',
    description: 'Awaken your senses with a burst of cool mint. This shower gel provides an invigorating cleanse that leaves you feeling refreshed and energized.',
    keyBenefits: ['Cooling and refreshing sensation', 'Deeply cleanses skin', 'Energizing mint aroma'],
    ingredients: ['Deionised Water', 'SLES 70', 'CDE', 'NaCl', 'Glycerine', 'Mint Fragrance Oil', 'Phenoxy Ethanol', 'Natural Colours'],
    directions: 'Apply to wet skin or sponge, lather gently, and rinse thoroughly.',
    cautions: 'Store in a cool, dry place. Avoid contact with eyes.',
    imageId: 'product-mint-fresh-shower-gel',
  },
  {
    id: '5',
    slug: 'ocean-breeze-fabric-softener',
    name: 'Ocean Breeze Fabric Softener',
    category: 'fabric-softener',
    scentProfile: ['warm-earthy'],
    features: ['vegan', 'recycled-packaging'],
    sizes: [
      { size: '750ml', price: 150.00 },
    ],
    shortDescription: 'Crisp, clean scent of a sea breeze.',
    description: 'Wrap your clothes in the fresh, clean scent of the ocean. Our formula provides exceptional softness and a fragrance that lasts.',
    keyBenefits: ['Crisp and clean fragrance', 'Exceptional softness', 'Helps reduce wrinkles'],
    ingredients: ['Cationic Surfactants', 'Fragrance', 'Preservative', 'Water'],
    directions: 'Add to your machine\'s rinse cycle for soft, fresh-smelling laundry.',
    cautions: 'Keep away from children. Do not pour directly on clothes.',
    imageId: 'product-ocean-breeze-fabric-softener',
  },
  {
    id: '6',
    slug: 'lemon-zest-dish-wash',
    name: 'Lemon Zest Dish Wash',
    category: 'dish-wash',
    scentProfile: ['citrus'],
    features: ['vegan', 'paraben-free', 'natural-fragrance'],
    sizes: [
      { size: '500ml', price: 95.00 },
      { size: '800ml', price: 140.00 },
    ],
    shortDescription: 'The classic scent of clean.',
    description: 'Harnessing the natural cleaning power of lemon, this dish wash liquid effortlessly removes tough stains and grease, leaving a streak-free shine.',
    keyBenefits: ['Superior grease cutting', 'Natural lemon scent', 'Rinses clean'],
    ingredients: ['Anionic Surfactants', 'Amphoteric Surfactants', 'Preservative', 'Lemon Fragrance Oil', 'Water'],
    directions: 'A little goes a long way. Squeeze onto a sponge and wash dishes. Rinse well.',
    cautions: 'If product gets in eyes, rinse with water.',
    imageId: 'product-lemon-zest-dish-wash',
  }
];

export const ALL_CATEGORIES: ProductCategory[] = ['shower-gel', 'fabric-softener', 'dish-wash'];
export const ALL_FEATURES: ProductFeature[] = ['vegan', 'paraben-free', 'microplastic-free', 'natural-fragrance', 'recycled-packaging'];
export const ALL_SCENTS: ScentProfile[] = ['citrus', 'floral', 'fruity', 'minty', 'warm-earthy'];
export const ALL_SIZES = Array.from(new Set(products.flatMap(p => p.sizes.map(s => s.size))));
