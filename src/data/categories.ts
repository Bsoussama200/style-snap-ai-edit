
import { ShoppingBag, UtensilsCrossed, Dumbbell, Home, Car, Users } from 'lucide-react';

export interface StyleOption {
  id: string;
  name: string;
  description: string;
  prompt: string;
  placeholder: string;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  icon: any;
  imageUrl: string;
  styles: StyleOption[];
}

export const categories: Category[] = [
  {
    id: 'products',
    name: 'Products',
    description: 'E-commerce and product photography',
    icon: ShoppingBag,
    imageUrl: '/lovable-uploads/264fc9d5-4f5e-45f0-af14-28b55062a246.png',
    styles: [
      {
        id: 'studio',
        name: 'Studio White',
        description: 'Clean professional background',
        prompt: "KEEP THE EXACT PRODUCT UNCHANGED - do not modify, alter, or change the product in any way. Only change the background to a professional studio setup with clean white background, even lighting, soft shadows, center-framed. The product must remain exactly identical.",
        placeholder: "/lovable-uploads/264fc9d5-4f5e-45f0-af14-28b55062a246.png"
      },
      {
        id: 'lifestyle',
        name: 'Natural Environment',
        description: 'Product in natural setting',
        prompt: "KEEP THE EXACT PRODUCT UNCHANGED - do not modify, alter, or change the product in any way. Only place the identical product in a natural environment that complements it (outdoor nature, urban space, workplace, sports arena, indoor space, or contextual setting), natural lighting, realistic and authentic atmosphere, professionally shot. The product must remain exactly identical.",
        placeholder: "/lovable-uploads/e0bcb7bf-4ce5-44cb-8c66-ebbd40fbfb0e.png"
      },
      {
        id: 'moody',
        name: 'Dark Moody',
        description: 'Dramatic cinematic lighting',
        prompt: "KEEP THE EXACT PRODUCT UNCHANGED - do not modify, alter, or change the product in any way. Only transform the background and lighting to a dramatic photo with darker background, subtle shadows, and cinematic atmosphere. Keep the full product clearly visible with good detail while maintaining a sophisticated aesthetic. The product must remain exactly identical.",
        placeholder: "/lovable-uploads/bc2620ab-04d8-447a-b004-96d10f242bb3.png"
      },
      {
        id: 'vibrant',
        name: 'Vibrant Ad Style',
        description: 'High-contrast commercial look',
        prompt: "KEEP THE EXACT PRODUCT UNCHANGED - do not modify, alter, or change the product in any way. Only change the background and lighting to make the product pop with a colorful, high-contrast commercial look. Use bright lighting, dramatic shadows, glowing reflections. Like an ad banner. The product must remain exactly identical.",
        placeholder: "/lovable-uploads/5a434678-e8ff-400f-8d13-968962695509.png"
      },
      {
        id: 'flatlay',
        name: 'Minimalist Flat Lay',
        description: 'Top-down aesthetic composition',
        prompt: "KEEP THE EXACT PRODUCT UNCHANGED - do not modify, alter, or change the product in any way. Only place the identical product in a top-down flat lay on a solid neutral color surface (light beige or gray), clean layout, minimalist, aesthetic composition. The product must remain exactly identical.",
        placeholder: "/lovable-uploads/b6f1f958-b012-4f41-ae3a-0eda0fddf98a.png"
      },
      {
        id: 'premium',
        name: 'Premium Showroom',
        description: 'High-end elegant surroundings',
        prompt: "KEEP THE EXACT PRODUCT UNCHANGED - do not modify, alter, or change the product in any way. Only render the identical product in a high-end showroom with premium materials, soft natural light, elegant surroundings. For large products too. The product must remain exactly identical.",
        placeholder: "/lovable-uploads/95e2ef73-1a3d-4e27-b5d5-e76a67891f3c.png"
      }
    ]
  },
  {
    id: 'restaurants',
    name: 'Restaurants',
    description: 'Food and dining photography',
    icon: UtensilsCrossed,
    imageUrl: '/lovable-uploads/50ae9be2-c8e8-496a-84a7-8f1b246b3fe6.png',
    styles: [
      {
        id: 'rustic',
        name: 'Rustic Table',
        description: 'Warm wooden table setting',
        prompt: "KEEP THE EXACT FOOD UNCHANGED - do not modify, alter, or change the food in any way. Only change the background to a rustic wooden table with warm lighting, natural textures, cozy restaurant atmosphere. The food must remain exactly identical.",
        placeholder: "/lovable-uploads/50ae9be2-c8e8-496a-84a7-8f1b246b3fe6.png"
      },
      {
        id: 'fine-dining',
        name: 'Fine Dining',
        description: 'Elegant restaurant presentation',
        prompt: "KEEP THE EXACT FOOD UNCHANGED - do not modify, alter, or change the food in any way. Only change the background to an elegant fine dining setting with pristine white tablecloth, sophisticated plating, soft ambient lighting. The food must remain exactly identical.",
        placeholder: "/lovable-uploads/55b005ec-5cd1-46e9-97e3-c6e87b3e0245.png"
      },
      {
        id: 'street-food',
        name: 'Street Food Vibes',
        description: 'Authentic street market feel',
        prompt: "KEEP THE EXACT FOOD UNCHANGED - do not modify, alter, or change the food in any way. Only change the background to a vibrant street food market setting with authentic atmosphere, casual presentation, dynamic lighting. The food must remain exactly identical.",
        placeholder: "/lovable-uploads/a4948c83-3ad5-4331-9815-fb7bdfbb1716.png"
      },
      {
        id: 'coffee-shop',
        name: 'Coffee Shop Aesthetic',
        description: 'Cozy cafe environment',
        prompt: "KEEP THE EXACT FOOD UNCHANGED - do not modify, alter, or change the food in any way. Only change the background to a cozy coffee shop setting with warm lighting, wooden surfaces, casual atmosphere. The food must remain exactly identical.",
        placeholder: "/lovable-uploads/9b309e49-4fa8-41df-b872-274cb1f95c03.png"
      },
      {
        id: 'outdoor-dining',
        name: 'Outdoor Dining',
        description: 'Fresh air restaurant setting',
        prompt: "KEEP THE EXACT FOOD UNCHANGED - do not modify, alter, or change the food in any way. Only change the background to an outdoor dining setting with natural daylight, fresh atmosphere, patio or garden setting. The food must remain exactly identical.",
        placeholder: "/lovable-uploads/e9c62d91-1b83-404a-892b-a87f3af9a227.png"
      },
      {
        id: 'minimalist-food',
        name: 'Minimalist Clean',
        description: 'Clean modern presentation',
        prompt: "KEEP THE EXACT FOOD UNCHANGED - do not modify, alter, or change the food in any way. Only change the background to a minimalist clean setting with neutral colors, modern presentation, professional food photography style. The food must remain exactly identical.",
        placeholder: "/lovable-uploads/0a7a7cb6-c5fa-459e-8feb-9cf831fee713.png"
      }
    ]
  },
  {
    id: 'gyms',
    name: 'Gyms',
    description: 'Fitness and workout spaces',
    icon: Dumbbell,
    imageUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=500',
    styles: [
      {
        id: 'modern-gym',
        name: 'Modern Fitness Center',
        description: 'State-of-the-art equipment',
        prompt: "KEEP THE EXACT SUBJECT UNCHANGED - do not modify, alter, or change the subject in any way. Only change the background to a modern fitness center with high-tech equipment, clean lines, bright lighting, professional gym atmosphere. The subject must remain exactly identical.",
        placeholder: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=300"
      },
      {
        id: 'outdoor-workout',
        name: 'Outdoor Training',
        description: 'Fresh air fitness environment',
        prompt: "KEEP THE EXACT SUBJECT UNCHANGED - do not modify, alter, or change the subject in any way. Only change the background to an outdoor training environment with natural lighting, park or beach setting, fresh air atmosphere. The subject must remain exactly identical.",
        placeholder: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300"
      },
      {
        id: 'crossfit-box',
        name: 'CrossFit Box',
        description: 'Industrial training space',
        prompt: "KEEP THE EXACT SUBJECT UNCHANGED - do not modify, alter, or change the subject in any way. Only change the background to a CrossFit box with industrial feel, functional equipment, raw atmosphere. The subject must remain exactly identical.",
        placeholder: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300"
      },
      {
        id: 'yoga-studio',
        name: 'Yoga Studio',
        description: 'Peaceful meditation space',
        prompt: "KEEP THE EXACT SUBJECT UNCHANGED - do not modify, alter, or change the subject in any way. Only change the background to a peaceful yoga studio with soft lighting, natural elements, zen atmosphere. The subject must remain exactly identical.",
        placeholder: "https://images.unsplash.com/photo-1506629905877-68e5842ee1a1?w=300"
      },
      {
        id: 'home-gym',
        name: 'Home Gym Setup',
        description: 'Personal workout space',
        prompt: "KEEP THE EXACT SUBJECT UNCHANGED - do not modify, alter, or change the subject in any way. Only change the background to a home gym setup with personal touch, organized equipment, motivational atmosphere. The subject must remain exactly identical.",
        placeholder: "https://images.unsplash.com/photo-1558611012-1e5c5b6e9aad?w=300"
      },
      {
        id: 'boxing-gym',
        name: 'Boxing Gym',
        description: 'Intense training environment',
        prompt: "KEEP THE EXACT SUBJECT UNCHANGED - do not modify, alter, or change the subject in any way. Only change the background to a boxing gym with heavy bags, intense lighting, gritty atmosphere. The subject must remain exactly identical.",
        placeholder: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=300"
      }
    ]
  },
  {
    id: 'decoration',
    name: 'Decoration',
    description: 'Interior design and home decor',
    icon: Home,
    imageUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500',
    styles: [
      {
        id: 'modern-living',
        name: 'Modern Living Room',
        description: 'Contemporary home setting',
        prompt: "KEEP THE EXACT ITEM UNCHANGED - do not modify, alter, or change the item in any way. Only change the background to a modern living room with contemporary furniture, clean lines, natural light. The item must remain exactly identical.",
        placeholder: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=300"
      },
      {
        id: 'rustic-bedroom',
        name: 'Rustic Bedroom',
        description: 'Cozy bedroom atmosphere',
        prompt: "KEEP THE EXACT ITEM UNCHANGED - do not modify, alter, or change the item in any way. Only change the background to a rustic bedroom with warm textures, cozy atmosphere, soft lighting. The item must remain exactly identical.",
        placeholder: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=300"
      },
      {
        id: 'minimalist-kitchen',
        name: 'Minimalist Kitchen',
        description: 'Clean kitchen design',
        prompt: "KEEP THE EXACT ITEM UNCHANGED - do not modify, alter, or change the item in any way. Only change the background to a minimalist kitchen with clean surfaces, modern appliances, bright lighting. The item must remain exactly identical.",
        placeholder: "https://images.unsplash.com/photo-1556909114-4e3afa3d9ee3?w=300"
      },
      {
        id: 'garden-patio',
        name: 'Garden Patio',
        description: 'Outdoor living space',
        prompt: "KEEP THE EXACT ITEM UNCHANGED - do not modify, alter, or change the item in any way. Only change the background to a garden patio with outdoor furniture, plants, natural lighting. The item must remain exactly identical.",
        placeholder: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=300"
      },
      {
        id: 'office-space',
        name: 'Modern Office',
        description: 'Professional workspace',
        prompt: "KEEP THE EXACT ITEM UNCHANGED - do not modify, alter, or change the item in any way. Only change the background to a modern office space with professional atmosphere, organized workspace, good lighting. The item must remain exactly identical.",
        placeholder: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=300"
      },
      {
        id: 'luxury-bathroom',
        name: 'Luxury Bathroom',
        description: 'Spa-like bathroom setting',
        prompt: "KEEP THE EXACT ITEM UNCHANGED - do not modify, alter, or change the item in any way. Only change the background to a luxury bathroom with spa-like atmosphere, premium materials, elegant lighting. The item must remain exactly identical.",
        placeholder: "https://images.unsplash.com/photo-1584622781564-1d987ac7c017?w=300"
      }
    ]
  },
  {
    id: 'automotive',
    name: 'Automotive',
    description: 'Cars and vehicle photography',
    icon: Car,
    imageUrl: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=500',
    styles: [
      {
        id: 'showroom',
        name: 'Luxury Showroom',
        description: 'Premium dealership setting',
        prompt: "KEEP THE EXACT VEHICLE UNCHANGED - do not modify, alter, or change the vehicle in any way. Only change the background to a luxury car showroom with polished floors, professional lighting, premium atmosphere. The vehicle must remain exactly identical.",
        placeholder: "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=300"
      },
      {
        id: 'urban-street',
        name: 'Urban Street',
        description: 'City street environment',
        prompt: "KEEP THE EXACT VEHICLE UNCHANGED - do not modify, alter, or change the vehicle in any way. Only change the background to an urban street setting with city backdrop, dynamic lighting, modern atmosphere. The vehicle must remain exactly identical.",
        placeholder: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=300"
      },
      {
        id: 'scenic-road',
        name: 'Scenic Highway',
        description: 'Beautiful landscape backdrop',
        prompt: "KEEP THE EXACT VEHICLE UNCHANGED - do not modify, alter, or change the vehicle in any way. Only change the background to a scenic highway with beautiful landscape, natural lighting, open road feel. The vehicle must remain exactly identical.",
        placeholder: "https://images.unsplash.com/photo-1544829099-b9a0c5303bff?w=300"
      },
      {
        id: 'garage-studio',
        name: 'Professional Garage',
        description: 'Clean garage environment',
        prompt: "KEEP THE EXACT VEHICLE UNCHANGED - do not modify, alter, or change the vehicle in any way. Only change the background to a professional garage with clean environment, organized tools, workshop atmosphere. The vehicle must remain exactly identical.",
        placeholder: "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=300"
      },
      {
        id: 'track-day',
        name: 'Race Track',
        description: 'Racing circuit setting',
        prompt: "KEEP THE EXACT VEHICLE UNCHANGED - do not modify, alter, or change the vehicle in any way. Only change the background to a race track with circuit atmosphere, dynamic setting, motorsport feel. The vehicle must remain exactly identical.",
        placeholder: "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=300"
      },
      {
        id: 'vintage-garage',
        name: 'Vintage Workshop',
        description: 'Classic car garage',
        prompt: "KEEP THE EXACT VEHICLE UNCHANGED - do not modify, alter, or change the vehicle in any way. Only change the background to a vintage workshop with classic atmosphere, retro tools, nostalgic feel. The vehicle must remain exactly identical.",
        placeholder: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=300"
      }
    ]
  },
  {
    id: 'events',
    name: 'Events',
    description: 'Social gatherings and celebrations',
    icon: Users,
    imageUrl: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=500',
    styles: [
      {
        id: 'wedding-venue',
        name: 'Wedding Venue',
        description: 'Elegant wedding setting',
        prompt: "KEEP THE EXACT SUBJECT UNCHANGED - do not modify, alter, or change the subject in any way. Only change the background to an elegant wedding venue with romantic atmosphere, beautiful decorations, soft lighting. The subject must remain exactly identical.",
        placeholder: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=300"
      },
      {
        id: 'corporate-event',
        name: 'Corporate Event',
        description: 'Professional conference setting',
        prompt: "KEEP THE EXACT SUBJECT UNCHANGED - do not modify, alter, or change the subject in any way. Only change the background to a corporate event with professional atmosphere, modern venue, business setting. The subject must remain exactly identical.",
        placeholder: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=300"
      },
      {
        id: 'birthday-party',
        name: 'Birthday Celebration',
        description: 'Festive party atmosphere',
        prompt: "KEEP THE EXACT SUBJECT UNCHANGED - do not modify, alter, or change the subject in any way. Only change the background to a birthday party with festive decorations, celebration atmosphere, colorful setting. The subject must remain exactly identical.",
        placeholder: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=300"
      },
      {
        id: 'outdoor-festival',
        name: 'Outdoor Festival',
        description: 'Open-air event setting',
        prompt: "KEEP THE EXACT SUBJECT UNCHANGED - do not modify, alter, or change the subject in any way. Only change the background to an outdoor festival with open-air atmosphere, stage setting, crowd energy. The subject must remain exactly identical.",
        placeholder: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=300"
      },
      {
        id: 'gala-dinner',
        name: 'Gala Dinner',
        description: 'Formal dinner event',
        prompt: "KEEP THE EXACT SUBJECT UNCHANGED - do not modify, alter, or change the subject in any way. Only change the background to a gala dinner with formal atmosphere, elegant table setting, sophisticated lighting. The subject must remain exactly identical.",
        placeholder: "https://images.unsplash.com/photo-1478146896981-b80fe463b330?w=300"
      },
      {
        id: 'concert-venue',
        name: 'Concert Hall',
        description: 'Music performance setting',
        prompt: "KEEP THE EXACT SUBJECT UNCHANGED - do not modify, alter, or change the subject in any way. Only change the background to a concert hall with stage lighting, performance atmosphere, music venue feel. The subject must remain exactly identical.",
        placeholder: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=300"
      }
    ]
  }
];
