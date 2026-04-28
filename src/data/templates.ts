export interface PosterTemplate {
  id: string;
  name: string;
  category: string;
  brand: string;
  file: string;        // URL path served from public/
  thumb: string;       // same for now
  tags: string[];
}

export interface TemplateCategory {
  id: string;
  label: string;
  color: string;
  accent: string;
  icon: string;
  description: string;
  templates: PosterTemplate[];
}

export const TEMPLATE_CATEGORIES: TemplateCategory[] = [
  {
    id: 'manam-canteen',
    label: 'Manam Canteen',
    color: '#C0392B',
    accent: '#F39C12',
    icon: 'UtensilsCrossed',
    description: 'South Indian restaurant — food posters & specials',
    templates: [
      { id: 'manam-bread-halwa', name: 'Bread Halwa', category: 'manam-canteen', brand: 'Manam Canteen', file: 'https://cdn.jsdelivr.net/gh/balajiponraj1004/bold-layers@main/public/templates/manam-canteen/Manam_Bread-Halwa_01.png', thumb: 'https://cdn.jsdelivr.net/gh/balajiponraj1004/bold-layers@main/public/templates/manam-canteen/Manam_Bread-Halwa_01.png', tags: ['sweet', 'dessert'] },
      { id: 'manam-chicken-65', name: 'Chicken 65', category: 'manam-canteen', brand: 'Manam Canteen', file: 'https://cdn.jsdelivr.net/gh/balajiponraj1004/bold-layers@main/public/templates/manam-canteen/Manam_Chicken-65_01.png', thumb: 'https://cdn.jsdelivr.net/gh/balajiponraj1004/bold-layers@main/public/templates/manam-canteen/Manam_Chicken-65_01.png', tags: ['chicken', 'starter'] },
      { id: 'manam-chicken-biryani-1', name: 'Chicken Biryani v1', category: 'manam-canteen', brand: 'Manam Canteen', file: 'https://cdn.jsdelivr.net/gh/balajiponraj1004/bold-layers@main/public/templates/manam-canteen/Manam_Chicken-Biryani_01.png', thumb: 'https://cdn.jsdelivr.net/gh/balajiponraj1004/bold-layers@main/public/templates/manam-canteen/Manam_Chicken-Biryani_01.png', tags: ['biryani', 'rice'] },
      { id: 'manam-chicken-biryani-2', name: 'Chicken Biryani v2', category: 'manam-canteen', brand: 'Manam Canteen', file: 'https://cdn.jsdelivr.net/gh/balajiponraj1004/bold-layers@main/public/templates/manam-canteen/Manam_Chicken-Biryani_02.png', thumb: 'https://cdn.jsdelivr.net/gh/balajiponraj1004/bold-layers@main/public/templates/manam-canteen/Manam_Chicken-Biryani_02.png', tags: ['biryani', 'rice'] },
      { id: 'manam-dosa-podi', name: 'Dosa Podi', category: 'manam-canteen', brand: 'Manam Canteen', file: 'https://cdn.jsdelivr.net/gh/balajiponraj1004/bold-layers@main/public/templates/manam-canteen/Manam_Dosa-Podi_01.png', thumb: 'https://cdn.jsdelivr.net/gh/balajiponraj1004/bold-layers@main/public/templates/manam-canteen/Manam_Dosa-Podi_01.png', tags: ['dosa', 'breakfast'] },
      { id: 'manam-ellu-podi', name: 'Ellu Podi', category: 'manam-canteen', brand: 'Manam Canteen', file: 'https://cdn.jsdelivr.net/gh/balajiponraj1004/bold-layers@main/public/templates/manam-canteen/Manam_Ellu-Podi_01.png', thumb: 'https://cdn.jsdelivr.net/gh/balajiponraj1004/bold-layers@main/public/templates/manam-canteen/Manam_Ellu-Podi_01.png', tags: ['podi', 'condiment'] },
      { id: 'manam-filter-coffee-1', name: 'Filter Coffee v1', category: 'manam-canteen', brand: 'Manam Canteen', file: 'https://cdn.jsdelivr.net/gh/balajiponraj1004/bold-layers@main/public/templates/manam-canteen/Manam_Filter-Coffee_01.png', thumb: 'https://cdn.jsdelivr.net/gh/balajiponraj1004/bold-layers@main/public/templates/manam-canteen/Manam_Filter-Coffee_01.png', tags: ['coffee', 'beverage'] },
      { id: 'manam-filter-coffee-2', name: 'Filter Coffee v2', category: 'manam-canteen', brand: 'Manam Canteen', file: 'https://cdn.jsdelivr.net/gh/balajiponraj1004/bold-layers@main/public/templates/manam-canteen/Manam_Filter-Coffee_02.png', thumb: 'https://cdn.jsdelivr.net/gh/balajiponraj1004/bold-layers@main/public/templates/manam-canteen/Manam_Filter-Coffee_02.png', tags: ['coffee', 'beverage'] },
      { id: 'manam-fish-fry', name: 'Fish Fry', category: 'manam-canteen', brand: 'Manam Canteen', file: 'https://cdn.jsdelivr.net/gh/balajiponraj1004/bold-layers@main/public/templates/manam-canteen/Manam_Fish-Fry_01.png', thumb: 'https://cdn.jsdelivr.net/gh/balajiponraj1004/bold-layers@main/public/templates/manam-canteen/Manam_Fish-Fry_01.png', tags: ['fish', 'starter'] },
      { id: 'manam-halwa-jar', name: 'Halwa Jar', category: 'manam-canteen', brand: 'Manam Canteen', file: 'https://cdn.jsdelivr.net/gh/balajiponraj1004/bold-layers@main/public/templates/manam-canteen/Manam_Halwa-Jar_01.png', thumb: 'https://cdn.jsdelivr.net/gh/balajiponraj1004/bold-layers@main/public/templates/manam-canteen/Manam_Halwa-Jar_01.png', tags: ['sweet', 'dessert'] },
      { id: 'manam-idly-vada-1', name: 'Idly Vada v1', category: 'manam-canteen', brand: 'Manam Canteen', file: 'https://cdn.jsdelivr.net/gh/balajiponraj1004/bold-layers@main/public/templates/manam-canteen/Manam_Idly-Vada_01.png', thumb: 'https://cdn.jsdelivr.net/gh/balajiponraj1004/bold-layers@main/public/templates/manam-canteen/Manam_Idly-Vada_01.png', tags: ['idly', 'breakfast'] },
      { id: 'manam-idly-vada-2', name: 'Idly Vada v2', category: 'manam-canteen', brand: 'Manam Canteen', file: 'https://cdn.jsdelivr.net/gh/balajiponraj1004/bold-layers@main/public/templates/manam-canteen/Manam_Idly-Vada_02.png', thumb: 'https://cdn.jsdelivr.net/gh/balajiponraj1004/bold-layers@main/public/templates/manam-canteen/Manam_Idly-Vada_02.png', tags: ['idly', 'breakfast'] },
      { id: 'manam-kari-dosa-1', name: 'Kari Dosa v1', category: 'manam-canteen', brand: 'Manam Canteen', file: 'https://cdn.jsdelivr.net/gh/balajiponraj1004/bold-layers@main/public/templates/manam-canteen/Manam_Kari-Dosa_01.png', thumb: 'https://cdn.jsdelivr.net/gh/balajiponraj1004/bold-layers@main/public/templates/manam-canteen/Manam_Kari-Dosa_01.png', tags: ['dosa', 'lunch'] },
      { id: 'manam-kari-dosa-2', name: 'Kari Dosa v2', category: 'manam-canteen', brand: 'Manam Canteen', file: 'https://cdn.jsdelivr.net/gh/balajiponraj1004/bold-layers@main/public/templates/manam-canteen/Manam_Kari-Dosa_02.png', thumb: 'https://cdn.jsdelivr.net/gh/balajiponraj1004/bold-layers@main/public/templates/manam-canteen/Manam_Kari-Dosa_02.png', tags: ['dosa', 'lunch'] },
      { id: 'manam-mango-lassi-1', name: 'Mango Lassi v1', category: 'manam-canteen', brand: 'Manam Canteen', file: 'https://cdn.jsdelivr.net/gh/balajiponraj1004/bold-layers@main/public/templates/manam-canteen/Manam_Mango-Lassi_01.png', thumb: 'https://cdn.jsdelivr.net/gh/balajiponraj1004/bold-layers@main/public/templates/manam-canteen/Manam_Mango-Lassi_01.png', tags: ['lassi', 'beverage'] },
      { id: 'manam-mango-lassi-2', name: 'Mango Lassi v2', category: 'manam-canteen', brand: 'Manam Canteen', file: 'https://cdn.jsdelivr.net/gh/balajiponraj1004/bold-layers@main/public/templates/manam-canteen/Manam_Mango-Lassi_02.png', thumb: 'https://cdn.jsdelivr.net/gh/balajiponraj1004/bold-layers@main/public/templates/manam-canteen/Manam_Mango-Lassi_02.png', tags: ['lassi', 'beverage'] },
      { id: 'manam-masala-dosa-1', name: 'Masala Dosa v1', category: 'manam-canteen', brand: 'Manam Canteen', file: 'https://cdn.jsdelivr.net/gh/balajiponraj1004/bold-layers@main/public/templates/manam-canteen/Manam_Masala-Dosa_01.png', thumb: 'https://cdn.jsdelivr.net/gh/balajiponraj1004/bold-layers@main/public/templates/manam-canteen/Manam_Masala-Dosa_01.png', tags: ['dosa', 'breakfast'] },
      { id: 'manam-masala-dosa-2', name: 'Masala Dosa v2', category: 'manam-canteen', brand: 'Manam Canteen', file: 'https://cdn.jsdelivr.net/gh/balajiponraj1004/bold-layers@main/public/templates/manam-canteen/Manam_Masala-Dosa_02.png', thumb: 'https://cdn.jsdelivr.net/gh/balajiponraj1004/bold-layers@main/public/templates/manam-canteen/Manam_Masala-Dosa_02.png', tags: ['dosa', 'breakfast'] },
      { id: 'manam-parotta-1', name: 'Parotta Chicken Salna v1', category: 'manam-canteen', brand: 'Manam Canteen', file: 'https://cdn.jsdelivr.net/gh/balajiponraj1004/bold-layers@main/public/templates/manam-canteen/Manam_Parotta-Chicken-Salna_01.png', thumb: 'https://cdn.jsdelivr.net/gh/balajiponraj1004/bold-layers@main/public/templates/manam-canteen/Manam_Parotta-Chicken-Salna_01.png', tags: ['parotta', 'dinner'] },
      { id: 'manam-parotta-2', name: 'Parotta Chicken Salna v2', category: 'manam-canteen', brand: 'Manam Canteen', file: 'https://cdn.jsdelivr.net/gh/balajiponraj1004/bold-layers@main/public/templates/manam-canteen/Manam_Parotta-Chicken-Salna_02.png', thumb: 'https://cdn.jsdelivr.net/gh/balajiponraj1004/bold-layers@main/public/templates/manam-canteen/Manam_Parotta-Chicken-Salna_02.png', tags: ['parotta', 'dinner'] },
    ],
  },
  {
    id: 'cake-dudes',
    label: 'Cake Dudes',
    color: '#8E44AD',
    accent: '#F1C40F',
    icon: 'Cake',
    description: 'Artisan bakery — cakes, pastries & celebration specials',
    templates: [
      { id: 'cake-anniversary', name: 'Anniversary Cakes', category: 'cake-dudes', brand: 'Cake Dudes', file: 'https://cdn.jsdelivr.net/gh/balajiponraj1004/bold-layers@main/public/templates/cake-dudes/CakeDudes_Anniversary-Cakes_01.png', thumb: 'https://cdn.jsdelivr.net/gh/balajiponraj1004/bold-layers@main/public/templates/cake-dudes/CakeDudes_Anniversary-Cakes_01.png', tags: ['anniversary', 'celebration'] },
      { id: 'cake-bento', name: 'Bento Cakes', category: 'cake-dudes', brand: 'Cake Dudes', file: 'https://cdn.jsdelivr.net/gh/balajiponraj1004/bold-layers@main/public/templates/cake-dudes/CakeDudes_Bento-Cakes_01.png', thumb: 'https://cdn.jsdelivr.net/gh/balajiponraj1004/bold-layers@main/public/templates/cake-dudes/CakeDudes_Bento-Cakes_01.png', tags: ['bento', 'mini'] },
      { id: 'cake-birthday', name: 'Birthday Cakes', category: 'cake-dudes', brand: 'Cake Dudes', file: 'https://cdn.jsdelivr.net/gh/balajiponraj1004/bold-layers@main/public/templates/cake-dudes/CakeDudes_Birthday-Cakes_01.png', thumb: 'https://cdn.jsdelivr.net/gh/balajiponraj1004/bold-layers@main/public/templates/cake-dudes/CakeDudes_Birthday-Cakes_01.png', tags: ['birthday', 'celebration'] },
      { id: 'cake-brownies', name: 'Brownies & Bites', category: 'cake-dudes', brand: 'Cake Dudes', file: 'https://cdn.jsdelivr.net/gh/balajiponraj1004/bold-layers@main/public/templates/cake-dudes/CakeDudes_Brownies-Bites_01.png', thumb: 'https://cdn.jsdelivr.net/gh/balajiponraj1004/bold-layers@main/public/templates/cake-dudes/CakeDudes_Brownies-Bites_01.png', tags: ['brownies', 'snack'] },
      { id: 'cake-chocolate', name: 'Chocolate Cakes', category: 'cake-dudes', brand: 'Cake Dudes', file: 'https://cdn.jsdelivr.net/gh/balajiponraj1004/bold-layers@main/public/templates/cake-dudes/CakeDudes_Chocolate-Cakes_01.png', thumb: 'https://cdn.jsdelivr.net/gh/balajiponraj1004/bold-layers@main/public/templates/cake-dudes/CakeDudes_Chocolate-Cakes_01.png', tags: ['chocolate', 'premium'] },
      { id: 'cake-cupcake', name: 'Cupcake Boxes', category: 'cake-dudes', brand: 'Cake Dudes', file: 'https://cdn.jsdelivr.net/gh/balajiponraj1004/bold-layers@main/public/templates/cake-dudes/CakeDudes_Cupcake-Boxes_01.png', thumb: 'https://cdn.jsdelivr.net/gh/balajiponraj1004/bold-layers@main/public/templates/cake-dudes/CakeDudes_Cupcake-Boxes_01.png', tags: ['cupcake', 'gift'] },
      { id: 'cake-jar', name: 'Jar Cakes', category: 'cake-dudes', brand: 'Cake Dudes', file: 'https://cdn.jsdelivr.net/gh/balajiponraj1004/bold-layers@main/public/templates/cake-dudes/CakeDudes_Jar-Cakes_01.png', thumb: 'https://cdn.jsdelivr.net/gh/balajiponraj1004/bold-layers@main/public/templates/cake-dudes/CakeDudes_Jar-Cakes_01.png', tags: ['jar', 'dessert'] },
      { id: 'cake-kids-1', name: 'Kids Theme Cakes v1', category: 'cake-dudes', brand: 'Cake Dudes', file: 'https://cdn.jsdelivr.net/gh/balajiponraj1004/bold-layers@main/public/templates/cake-dudes/CakeDudes_Kids-Theme-Cakes_01.png', thumb: 'https://cdn.jsdelivr.net/gh/balajiponraj1004/bold-layers@main/public/templates/cake-dudes/CakeDudes_Kids-Theme-Cakes_01.png', tags: ['kids', 'theme'] },
      { id: 'cake-kids-2', name: 'Kids Theme Cakes v2', category: 'cake-dudes', brand: 'Cake Dudes', file: 'https://cdn.jsdelivr.net/gh/balajiponraj1004/bold-layers@main/public/templates/cake-dudes/CakeDudes_Kids-Theme-Cakes_02.png', thumb: 'https://cdn.jsdelivr.net/gh/balajiponraj1004/bold-layers@main/public/templates/cake-dudes/CakeDudes_Kids-Theme-Cakes_02.png', tags: ['kids', 'theme'] },
      { id: 'cake-wedding', name: 'Wedding Cakes', category: 'cake-dudes', brand: 'Cake Dudes', file: 'https://cdn.jsdelivr.net/gh/balajiponraj1004/bold-layers@main/public/templates/cake-dudes/CakeDudes_Wedding-Cakes_01.png', thumb: 'https://cdn.jsdelivr.net/gh/balajiponraj1004/bold-layers@main/public/templates/cake-dudes/CakeDudes_Wedding-Cakes_01.png', tags: ['wedding', 'luxury'] },
    ],
  },
  {
    id: 'hotel',
    label: 'Hotel Properties',
    color: '#1A6B9A',
    accent: '#D4AF37',
    icon: 'Hotel',
    description: 'Hospitality & resort — destination & room promotions',
    templates: [
      { id: 'hotel-azure', name: 'Azure Shore Mahabalipuram', category: 'hotel', brand: 'Hotel', file: 'https://cdn.jsdelivr.net/gh/balajiponraj1004/bold-layers@main/public/templates/hotel/Hotel_AzureShore-Mahabalipuram_01.png', thumb: 'https://cdn.jsdelivr.net/gh/balajiponraj1004/bold-layers@main/public/templates/hotel/Hotel_AzureShore-Mahabalipuram_01.png', tags: ['beach', 'resort'] },
      { id: 'hotel-coco', name: 'Coco Courtyard Coimbatore', category: 'hotel', brand: 'Hotel', file: 'https://cdn.jsdelivr.net/gh/balajiponraj1004/bold-layers@main/public/templates/hotel/Hotel_CocoCourtyard-Coimbatore_01.png', thumb: 'https://cdn.jsdelivr.net/gh/balajiponraj1004/bold-layers@main/public/templates/hotel/Hotel_CocoCourtyard-Coimbatore_01.png', tags: ['city', 'boutique'] },
      { id: 'hotel-golden', name: 'Golden Palm ECR', category: 'hotel', brand: 'Hotel', file: 'https://cdn.jsdelivr.net/gh/balajiponraj1004/bold-layers@main/public/templates/hotel/Hotel_GoldenPalm-ECR_01.png', thumb: 'https://cdn.jsdelivr.net/gh/balajiponraj1004/bold-layers@main/public/templates/hotel/Hotel_GoldenPalm-ECR_01.png', tags: ['beach', 'ecr'] },
      { id: 'hotel-greenvale', name: 'Green Vale Yercaud', category: 'hotel', brand: 'Hotel', file: 'https://cdn.jsdelivr.net/gh/balajiponraj1004/bold-layers@main/public/templates/hotel/Hotel_GreenVale-Yercaud_01.png', thumb: 'https://cdn.jsdelivr.net/gh/balajiponraj1004/bold-layers@main/public/templates/hotel/Hotel_GreenVale-Yercaud_01.png', tags: ['hills', 'nature'] },
      { id: 'hotel-lakewhisper', name: 'Lake Whisper Kodaikanal', category: 'hotel', brand: 'Hotel', file: 'https://cdn.jsdelivr.net/gh/balajiponraj1004/bold-layers@main/public/templates/hotel/Hotel_LakeWhisper-Kodaikanal_01.png', thumb: 'https://cdn.jsdelivr.net/gh/balajiponraj1004/bold-layers@main/public/templates/hotel/Hotel_LakeWhisper-Kodaikanal_01.png', tags: ['lake', 'hills'] },
      { id: 'hotel-misty', name: 'Misty Peaks Ooty', category: 'hotel', brand: 'Hotel', file: 'https://cdn.jsdelivr.net/gh/balajiponraj1004/bold-layers@main/public/templates/hotel/Hotel_MistyPeaks-Ooty_01.png', thumb: 'https://cdn.jsdelivr.net/gh/balajiponraj1004/bold-layers@main/public/templates/hotel/Hotel_MistyPeaks-Ooty_01.png', tags: ['hills', 'ooty'] },
      { id: 'hotel-royal', name: 'Royal Lotus Trichy', category: 'hotel', brand: 'Hotel', file: 'https://cdn.jsdelivr.net/gh/balajiponraj1004/bold-layers@main/public/templates/hotel/Hotel_RoyalLotus-Trichy_01.png', thumb: 'https://cdn.jsdelivr.net/gh/balajiponraj1004/bold-layers@main/public/templates/hotel/Hotel_RoyalLotus-Trichy_01.png', tags: ['city', 'luxury'] },
      { id: 'hotel-sacred', name: 'Sacred Sands Rameswaram', category: 'hotel', brand: 'Hotel', file: 'https://cdn.jsdelivr.net/gh/balajiponraj1004/bold-layers@main/public/templates/hotel/Hotel_SacredSands-Rameswaram_01.png', thumb: 'https://cdn.jsdelivr.net/gh/balajiponraj1004/bold-layers@main/public/templates/hotel/Hotel_SacredSands-Rameswaram_01.png', tags: ['pilgrim', 'beach'] },
      { id: 'hotel-temple', name: 'Temple Crown Madurai', category: 'hotel', brand: 'Hotel', file: 'https://cdn.jsdelivr.net/gh/balajiponraj1004/bold-layers@main/public/templates/hotel/Hotel_TempleCrown-Madurai_01.png', thumb: 'https://cdn.jsdelivr.net/gh/balajiponraj1004/bold-layers@main/public/templates/hotel/Hotel_TempleCrown-Madurai_01.png', tags: ['heritage', 'temple'] },
      { id: 'hotel-urban', name: 'Urban Nest Chennai', category: 'hotel', brand: 'Hotel', file: 'https://cdn.jsdelivr.net/gh/balajiponraj1004/bold-layers@main/public/templates/hotel/Hotel_UrbanNest-Chennai_01.png', thumb: 'https://cdn.jsdelivr.net/gh/balajiponraj1004/bold-layers@main/public/templates/hotel/Hotel_UrbanNest-Chennai_01.png', tags: ['city', 'chennai'] },
    ],
  },
  {
    id: 'real-estate',
    label: 'Real Estate',
    color: '#1E8449',
    accent: '#F39C12',
    icon: 'Building2',
    description: 'Property & land — residential, commercial & plot ads',
    templates: [
      { id: 're-commercial', name: 'Commercial Coimbatore', category: 'real-estate', brand: 'Real Estate', file: 'https://cdn.jsdelivr.net/gh/balajiponraj1004/bold-layers@main/public/templates/real-estate/RealEstate_Commercial-Coimbatore_01.png', thumb: 'https://cdn.jsdelivr.net/gh/balajiponraj1004/bold-layers@main/public/templates/real-estate/RealEstate_Commercial-Coimbatore_01.png', tags: ['commercial', 'coimbatore'] },
      { id: 're-dtcp', name: 'DTCP Plots Coimbatore', category: 'real-estate', brand: 'Real Estate', file: 'https://cdn.jsdelivr.net/gh/balajiponraj1004/bold-layers@main/public/templates/real-estate/RealEstate_DTCP-Plots-Coimbatore_01.png', thumb: 'https://cdn.jsdelivr.net/gh/balajiponraj1004/bold-layers@main/public/templates/real-estate/RealEstate_DTCP-Plots-Coimbatore_01.png', tags: ['plots', 'dtcp'] },
      { id: 're-duplex', name: 'Duplex Homes Tirunelveli', category: 'real-estate', brand: 'Real Estate', file: 'https://cdn.jsdelivr.net/gh/balajiponraj1004/bold-layers@main/public/templates/real-estate/RealEstate_DuplexHomes-Tirunelveli_01.png', thumb: 'https://cdn.jsdelivr.net/gh/balajiponraj1004/bold-layers@main/public/templates/real-estate/RealEstate_DuplexHomes-Tirunelveli_01.png', tags: ['duplex', 'homes'] },
      { id: 're-ecr', name: 'ECR Beachside Villas', category: 'real-estate', brand: 'Real Estate', file: 'https://cdn.jsdelivr.net/gh/balajiponraj1004/bold-layers@main/public/templates/real-estate/RealEstate_ECR-Beachside-Villas_01.png', thumb: 'https://cdn.jsdelivr.net/gh/balajiponraj1004/bold-layers@main/public/templates/real-estate/RealEstate_ECR-Beachside-Villas_01.png', tags: ['villa', 'beach'] },
      { id: 're-independent', name: 'Independent Homes Trichy', category: 'real-estate', brand: 'Real Estate', file: 'https://cdn.jsdelivr.net/gh/balajiponraj1004/bold-layers@main/public/templates/real-estate/RealEstate_IndependentHomes-Trichy_01.png', thumb: 'https://cdn.jsdelivr.net/gh/balajiponraj1004/bold-layers@main/public/templates/real-estate/RealEstate_IndependentHomes-Trichy_01.png', tags: ['independent', 'trichy'] },
      { id: 're-land', name: 'Land Investment Salem', category: 'real-estate', brand: 'Real Estate', file: 'https://cdn.jsdelivr.net/gh/balajiponraj1004/bold-layers@main/public/templates/real-estate/RealEstate_LandInvestment-Salem_01.png', thumb: 'https://cdn.jsdelivr.net/gh/balajiponraj1004/bold-layers@main/public/templates/real-estate/RealEstate_LandInvestment-Salem_01.png', tags: ['land', 'investment'] },
      { id: 're-omr', name: 'OMR Apartments Chennai', category: 'real-estate', brand: 'Real Estate', file: 'https://cdn.jsdelivr.net/gh/balajiponraj1004/bold-layers@main/public/templates/real-estate/RealEstate_OMR-Apartments-Chennai_01.png', thumb: 'https://cdn.jsdelivr.net/gh/balajiponraj1004/bold-layers@main/public/templates/real-estate/RealEstate_OMR-Apartments-Chennai_01.png', tags: ['apartment', 'chennai'] },
      { id: 're-rtm', name: 'RTM Flats Madurai', category: 'real-estate', brand: 'Real Estate', file: 'https://cdn.jsdelivr.net/gh/balajiponraj1004/bold-layers@main/public/templates/real-estate/RealEstate_RTM-Flats-Madurai_01.png', thumb: 'https://cdn.jsdelivr.net/gh/balajiponraj1004/bold-layers@main/public/templates/real-estate/RealEstate_RTM-Flats-Madurai_01.png', tags: ['flats', 'madurai'] },
      { id: 're-southern', name: 'Southern Prestige Villas Chennai', category: 'real-estate', brand: 'Real Estate', file: 'https://cdn.jsdelivr.net/gh/balajiponraj1004/bold-layers@main/public/templates/real-estate/RealEstate_SouthernPrestige-Chennai-Villas_01.png', thumb: 'https://cdn.jsdelivr.net/gh/balajiponraj1004/bold-layers@main/public/templates/real-estate/RealEstate_SouthernPrestige-Chennai-Villas_01.png', tags: ['villa', 'luxury'] },
      { id: 're-yelagiri', name: 'Villa Plots Yelagiri', category: 'real-estate', brand: 'Real Estate', file: 'https://cdn.jsdelivr.net/gh/balajiponraj1004/bold-layers@main/public/templates/real-estate/RealEstate_VillaPlots-Yelagiri_01.png', thumb: 'https://cdn.jsdelivr.net/gh/balajiponraj1004/bold-layers@main/public/templates/real-estate/RealEstate_VillaPlots-Yelagiri_01.png', tags: ['plots', 'hills'] },
    ],
  },
];

export const ALL_TEMPLATES = TEMPLATE_CATEGORIES.flatMap(c => c.templates);
