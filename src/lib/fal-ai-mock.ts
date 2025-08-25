// Mock FAL AI Integration for Development Testing
// This provides fake responses for testing the staging functionality

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

export class MockFalAIService {
  private apiKey: string;

  constructor(apiKey: string = 'mock-api-key') {
    this.apiKey = apiKey;
  }

  async generateImage(request: FalAIRequest): Promise<FalAIResponse> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 3000));

    // Mock different staged room images based on style
    const mockImages = {
      modern: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1024&h=768&fit=crop',
      traditional: 'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=1024&h=768&fit=crop',
      minimalist: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1024&h=768&fit=crop',
      scandinavian: 'https://images.unsplash.com/photo-1618219908412-a29a1bb7b86e?w=1024&h=768&fit=crop',
      industrial: 'https://images.unsplash.com/photo-1540932239986-30128078f3c5?w=1024&h=768&fit=crop',
      bohemian: 'https://images.unsplash.com/photo-1567767292278-a4f21aa2d36e?w=1024&h=768&fit=crop'
    };

    // Determine style from prompt
    let selectedImage = mockImages.modern; // default
    const prompt = request.prompt.toLowerCase();
    
    if (prompt.includes('traditional')) selectedImage = mockImages.traditional;
    else if (prompt.includes('minimalist')) selectedImage = mockImages.minimalist;
    else if (prompt.includes('scandinavian')) selectedImage = mockImages.scandinavian;
    else if (prompt.includes('industrial')) selectedImage = mockImages.industrial;
    else if (prompt.includes('bohemian')) selectedImage = mockImages.bohemian;

    return {
      images: [{
        url: selectedImage,
        width: 1024,
        height: 768
      }],
      timings: {
        inference: Math.random() * 5000,
        queue: Math.random() * 1000
      },
      seed: Math.floor(Math.random() * 1000000),
      has_nsfw_concepts: [false]
    };
  }

  async stageRoom(imageUrl: string, style: string): Promise<FalAIResponse> {
    const stylePrompts = {
      modern: `Transform this empty room into a modern, contemporary living space with sleek furniture.`,
      traditional: `Convert this empty room into a traditional, elegant space with classic furniture.`,
      minimalist: `Stage this empty room with a minimalist approach - clean and uncluttered.`,
      scandinavian: `Transform this empty room into a Scandinavian-style space with light woods.`,
      industrial: `Convert this empty room into an industrial-style loft with raw materials.`,
      bohemian: `Stage this empty room with a bohemian, eclectic vibe with colorful textiles.`
    };

    const prompt = stylePrompts[style as keyof typeof stylePrompts] || stylePrompts.modern;

    console.log(`[MOCK] Staging room with style: ${style}`);
    console.log(`[MOCK] Using prompt: ${prompt}`);

    return await this.generateImage({
      prompt,
      image_url: imageUrl,
      strength: 0.8,
      guidance_scale: 8.0,
      num_inference_steps: 30
    });
  }

  async enhanceRealEstatePhoto(imageUrl: string, enhancements: any = {}): Promise<FalAIResponse> {
    return await this.generateImage({
      prompt: 'Enhance this real estate photo',
      image_url: imageUrl
    });
  }

  async generateVirtualTour(baseImageUrl: string, roomDescriptions: string[]): Promise<FalAIResponse[]> {
    const results: FalAIResponse[] = [];
    
    for (let i = 0; i < roomDescriptions.length; i++) {
      const result = await this.generateImage({
        prompt: `Generate a ${roomDescriptions[i]} view`,
        image_url: baseImageUrl
      });
      results.push(result);
    }
    
    return results;
  }

  async validateApiKey(): Promise<boolean> {
    return true; // Always valid for mock
  }

  async getAvailableModels(): Promise<any[]> {
    return [
      { id: 'mock-model-1', name: 'Mock Staging Model' },
      { id: 'mock-model-2', name: 'Mock Enhancement Model' }
    ];
  }
}

// Use mock service if no real API key is provided
let falAIService: MockFalAIService | null = null;

export function getFalAIService(): MockFalAIService {
  if (!falAIService) {
    const apiKey = process.env.FAL_AI_API_KEY || 'mock-key';
    console.log('[MOCK] Using Mock FAL AI Service for development');
    falAIService = new MockFalAIService(apiKey);
  }
  return falAIService;
}

export function initializeFalAI(apiKey: string): void {
  falAIService = new MockFalAIService(apiKey);
}

export function isFalAIConfigured(): boolean {
  return true; // Always configured for mock
}
