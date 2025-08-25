// FAL AI Integration for Virtual Staging
// This service handles real AI image generation using FAL AI's API

interface FalAIResponse {
  images: Array<{
    url: string;
    width: number;
    height: number;
  }>;
  timings: Record<string, number>;
  seed: number;
  has_nsfw_concepts: boolean[];
}

interface FalAIRequest {
  prompt: string;
  image_url?: string;
  strength?: number;
  guidance_scale?: number;
  num_inference_steps?: number;
  seed?: number;
}

export class FalAIService {
  private apiKey: string;
  private baseUrl = 'https://fal.run/fal-ai';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async generateImage(request: FalAIRequest): Promise<FalAIResponse> {
    try {
      // Use the correct FAL AI model for image-to-image generation
      const response = await fetch(`${this.baseUrl}/fal-ai/imageutils/image-to-image`, {
        method: 'POST',
        headers: {
          'Authorization': `Key ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image_url: request.image_url,
          prompt: request.prompt,
          strength: request.strength || 0.75,
          guidance_scale: request.guidance_scale || 7.5,
          num_inference_steps: request.num_inference_steps || 25,
          seed: request.seed,
          enable_safety_checker: true,
          sync_mode: true // Wait for completion
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`FAL AI API Error: ${errorData.detail || response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('FAL AI generation error:', error);
      throw new Error(`Failed to generate image: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async stageRoom(imageUrl: string, style: string): Promise<FalAIResponse> {
    const stylePrompts = {
      modern: `Transform this empty room into a modern, contemporary living space. Add sleek, minimalist furniture with clean lines. Include a modern sofa in a neutral color like gray or beige, a glass coffee table, abstract wall art, and minimal decorative elements. Use materials like metal, glass, and light woods. Ensure the lighting feels bright and airy. The result should look like a high-end modern home ready for a real estate listing.`,
      
      traditional: `Convert this empty room into a traditional, elegant space with classic furniture and warm, rich colors. Add a plush upholstered sofa in a deep jewel tone, a wooden coffee table with traditional details, sophisticated drapes, and classic artwork on the walls. Include elements like crown molding, a Persian rug, and warm table lamps. Create a cozy, timeless atmosphere that appeals to buyers looking for classic elegance.`,
      
      minimalist: `Stage this empty room with a minimalist approach - keep it simple, clean, and uncluttered. Add only essential furniture pieces with clean lines and neutral colors. Include a simple sofa in white or light gray, a sleek coffee table, minimal decor like a single plant or abstract sculpture. Focus on open space and natural light. The result should feel spacious, calm, and sophisticated.`,
      
      scandinavian: `Transform this empty room into a Scandinavian-style space with light woods, cozy textiles, and functional design. Add a comfortable sofa in light fabric, a wooden coffee table with clean lines, soft textiles like wool throws and pillows in muted colors, and green plants. Use a palette of whites, grays, and natural wood tones. Include elements like a minimalist floor lamp and simple wall art. Create a hygge-inspired cozy yet uncluttered atmosphere.`,
      
      industrial: `Convert this empty room into an industrial-style loft with raw materials and urban aesthetics. Add a leather sofa, metal coffee table, exposed brick or concrete elements, and vintage industrial lighting. Use materials like distressed wood, metal frames, and concrete textures. Include urban-inspired decor like metal artwork or factory-style lighting. Create an edgy, sophisticated look that appeals to buyers seeking an urban loft aesthetic.`,
      
      bohemian: `Stage this empty room with a bohemian, eclectic vibe. Add colorful textiles, patterned rugs, mix-and-match furniture, and plenty of plants. Include a comfortable sofa with colorful throw pillows, a vintage or rustic coffee table, macrame wall hangings, and global-inspired artwork. Use rich colors, varied textures, and artistic elements. Create a free-spirited, artistic atmosphere that feels lived-in yet stylish.`
    };

    const prompt = stylePrompts[style as keyof typeof stylePrompts] || stylePrompts.modern;

    console.log(`Staging room with style: ${style}`);
    console.log(`Using prompt: ${prompt}`);

    return await this.generateImage({
      prompt,
      image_url: imageUrl,
      strength: 0.8, // Higher strength for more dramatic transformation
      guidance_scale: 8.0, // Higher guidance for better prompt adherence
      num_inference_steps: 30 // More steps for better quality
    });
  }

  async enhanceRealEstatePhoto(imageUrl: string, enhancements: {
    brighten?: boolean;
    declutter?: boolean;
    addFurniture?: boolean;
    style?: string;
  } = {}): Promise<FalAIResponse> {
    let prompt = 'Enhance this real estate photo to make it more appealing to potential buyers.';

    if (enhancements.brighten) {
      prompt += ' Brighten the image to make it look more spacious and inviting.';
    }

    if (enhancements.declutter) {
      prompt += ' Remove any clutter and create a clean, organized appearance.';
    }

    if (enhancements.addFurniture) {
      prompt += ' Add appropriate furniture that fits the space well.';
    }

    if (enhancements.style) {
      const styleDescriptions = {
        modern: 'Use modern, contemporary styling.',
        traditional: 'Use traditional, classic styling.',
        minimalist: 'Use minimalist, clean styling.'
      };
      prompt += ` ${styleDescriptions[enhancements.style as keyof typeof styleDescriptions] || ''}`;
    }

    prompt += ' Ensure the result looks realistic, professional, and ready for a real estate listing.';

    return await this.generateImage({
      prompt,
      image_url: imageUrl,
      strength: 0.6,
      guidance_scale: 7.0,
      num_inference_steps: 25
    });
  }

  async generateVirtualTour(baseImageUrl: string, roomDescriptions: string[]): Promise<FalAIResponse[]> {
    const results: FalAIResponse[] = [];
    
    for (let i = 0; i < roomDescriptions.length; i++) {
      const description = roomDescriptions[i];
      const prompt = `Generate a ${description} view for a virtual real estate tour based on this room. Maintain architectural consistency while creating a realistic, professionally staged appearance suitable for real estate marketing.`;
      
      try {
        const result = await this.generateImage({
          prompt,
          image_url: baseImageUrl,
          strength: 0.7,
          guidance_scale: 7.5,
          num_inference_steps: 25
        });
        
        results.push(result);
      } catch (error) {
        console.error(`Error generating tour image ${i + 1}:`, error);
        // Continue with other images even if one fails
      }
    }
    
    return results;
  }

  // Utility method to check if API key is valid
  async validateApiKey(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/fal-ai/imageutils/image-to-image`, {
        method: 'POST',
        headers: {
          'Authorization': `Key ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image_url: 'https://via.placeholder.com/512x512?text=Test+Image',
          prompt: 'test',
          num_inference_steps: 1
        }),
      });

      return response.ok;
    } catch {
      return false;
    }
  }

  // Get available models and their capabilities
  async getAvailableModels(): Promise<any[]> {
    try {
      const response = await fetch(`${this.baseUrl}/models`, {
        headers: {
          'Authorization': `Key ${this.apiKey}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        return data;
      }
      return [];
    } catch {
      return [];
    }
  }
}

// Singleton instance
let falAIService: FalAIService | null = null;

export function getFalAIService(): any {
  // For development testing, use mock service
  if (process.env.NODE_ENV === 'development' && !process.env.FAL_AI_API_KEY) {
    // Use dynamic import for mock service
    try {
      const mockModule = import('./fal-ai-mock');
      return mockModule.then(module => module.getFalAIService());
    } catch {
      // If mock service doesn't exist, throw error
      throw new Error('FAL_AI_API_KEY environment variable is not set and mock service is unavailable');
    }
  }
  
  if (!falAIService) {
    const apiKey = process.env.FAL_AI_API_KEY;
    if (!apiKey) {
      throw new Error('FAL_AI_API_KEY environment variable is not set');
    }
    falAIService = new FalAIService(apiKey);
  }
  return falAIService;
}

export function initializeFalAI(apiKey: string): void {
  falAIService = new FalAIService(apiKey);
}

// Helper function to check if FAL AI is configured
export function isFalAIConfigured(): boolean {
  return !!process.env.FAL_AI_API_KEY;
}