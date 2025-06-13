
import React from 'react';
import { Camera, Home, Moon, Zap, Grid3X3, Crown } from 'lucide-react';
import { StyleOption } from '@/types/snapstyle';

export const styleOptions: StyleOption[] = [
  {
    id: 'studio',
    name: 'Studio White',
    description: 'Clean professional background',
    icon: <Camera className="w-6 h-6" />,
    prompt: "Keep the exact product but make it a professional shoot with a clean white background, even lighting, soft shadows, center-framed.",
    sampleImage: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=300&h=200&fit=crop&auto=format"
  },
  {
    id: 'lifestyle',
    name: 'Lifestyle Shot',
    description: 'Natural home environment',
    icon: <Home className="w-6 h-6" />,
    prompt: "Place the exact product in a realistic home environment (indoor), natural lighting, cozy and modern furniture or background, professionally shot.",
    sampleImage: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=300&h=200&fit=crop&auto=format"
  },
  {
    id: 'moody',
    name: 'Dark Moody',
    description: 'Dramatic cinematic lighting',
    icon: <Moon className="w-6 h-6" />,
    prompt: "Transform the product into a dramatic photo with low light, deep shadows, contrast, and cinematic lighting. Background dark and smooth.",
    sampleImage: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=300&h=200&fit=crop&auto=format"
  },
  {
    id: 'vibrant',
    name: 'Vibrant Ad Style',
    description: 'High-contrast commercial look',
    icon: <Zap className="w-6 h-6" />,
    prompt: "Make the product pop with a colorful, high-contrast commercial look. Use bright lighting, dramatic shadows, glowing reflections. Like an ad banner.",
    sampleImage: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=300&h=200&fit=crop&auto=format"
  },
  {
    id: 'flatlay',
    name: 'Minimalist Flat Lay',
    description: 'Top-down aesthetic composition',
    icon: <Grid3X3 className="w-6 h-6" />,
    prompt: "Place the product in a top-down flat lay on a solid neutral color surface (light beige or gray), clean layout, minimalist, aesthetic composition.",
    sampleImage: "https://images.unsplash.com/photo-1434626881859-194d67b2b86f?w=300&h=200&fit=crop&auto=format"
  },
  {
    id: 'premium',
    name: 'Premium Showroom',
    description: 'High-end elegant surroundings',
    icon: <Crown className="w-6 h-6" />,
    prompt: "Render the product in a high-end showroom with premium materials, sleek furniture, soft natural light, elegant surroundings. For large products too.",
    sampleImage: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=300&h=200&fit=crop&auto=format"
  }
];
