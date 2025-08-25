import { NextRequest, NextResponse } from 'next/server';
import { initializeFalAI } from '@/lib/fal-ai';

export async function POST(request: NextRequest) {
  try {
    const { apiKey } = await request.json();

    if (!apiKey) {
      return NextResponse.json({
        success: false,
        message: 'API key is required'
      }, { status: 400 });
    }

    // Initialize FAL AI service with the provided key
    initializeFalAI(apiKey);

    // Test the API key
    const falAI = initializeFalAI(apiKey);
    
    try {
      const isValid = await falAI.validateApiKey();
      
      if (isValid) {
        return NextResponse.json({
          success: true,
          message: 'FAL AI API key is valid and working correctly!',
          details: {
            service: 'FAL AI',
            model: 'imageutils/image-to-image',
            status: 'operational'
          }
        });
      } else {
        return NextResponse.json({
          success: false,
          message: 'FAL AI API key is invalid or not working',
          details: {
            error: 'API key validation failed'
          }
        }, { status: 400 });
      }
    } catch (error) {
      return NextResponse.json({
        success: false,
        message: 'Failed to validate FAL AI API key',
        details: {
          error: error instanceof Error ? error.message : 'Unknown error',
          suggestion: 'Please check your API key and ensure it has the correct permissions'
        }
      }, { status: 400 });
    }

  } catch (error) {
    console.error('FAL AI test error:', error);
    return NextResponse.json({
      success: false,
      message: 'Internal server error during FAL AI test',
      details: {
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }, { status: 500 });
  }
}