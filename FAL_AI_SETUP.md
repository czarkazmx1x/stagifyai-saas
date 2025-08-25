# FAL AI Integration Setup Guide

## Overview

This guide will help you set up FAL AI integration to enable real virtual staging functionality for your StagifyAI application.

## Prerequisites

- FAL AI API key
- Node.js and npm installed
- Your StagifyAI application codebase

## Step 1: Get Your FAL AI API Key

### 1.1 Create FAL AI Account
1. Go to [FAL AI](https://fal.ai/)
2. Sign up for an account
3. Navigate to the API section
4. Generate your API key

### 1.2 API Key Requirements
- Ensure your API key has access to image generation models
- Check that your account has sufficient credits
- Note the API key for configuration

## Step 2: Configure Environment Variables

### 2.1 Update .env File
Add your FAL AI API key to your environment:

```env
# FAL AI Configuration
FAL_AI_API_KEY=your-fal-ai-api-key-here
```

### 2.2 Complete Environment Configuration
Your `.env` file should now include:

```env
DATABASE_URL=file:/home/z/my-project/db/custom.db

# NextAuth.js Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret-here

# Google OAuth Configuration
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# FAL AI Configuration
FAL_AI_API_KEY=your-fal-ai-api-key-here
```

## Step 3: Test the Integration

### 3.1 Using the Test Interface
1. Navigate to `/test-fal-ai` in your application
2. Enter your FAL AI API key
3. Click "Test API Key"
4. Review the test results

### 3.2 Manual Testing
Alternatively, test the integration manually:

```bash
# Start your development server
npm run dev

# Navigate to http://localhost:3000/test-fal-ai
```

### 3.3 Expected Test Results
✅ **Success**: API key is valid and FAL AI service is operational
❌ **Failure**: Check API key validity and account status

## Step 4: Virtual Staging Workflow

### 4.1 Upload Empty Room Photo
1. Go to `/staging` in your application
2. Upload a photo of an empty room
3. Ensure the photo is well-lit and clear

### 4.2 Choose Staging Style
Available styles:
- **Modern**: Clean lines, minimalist furniture, contemporary aesthetic
- **Traditional**: Classic furniture, warm colors, timeless appeal
- **Minimalist**: Simple, uncluttered, functional design
- **Scandinavian**: Light woods, cozy textiles, Nordic-inspired
- **Industrial**: Raw materials, exposed elements, urban loft style
- **Bohemian**: Eclectic mix, patterns, artistic and free-spirited

### 4.3 Generate Staged Image
1. Click "Stage Room"
2. Wait for AI processing (typically 10-30 seconds)
3. Review the before/after comparison
4. Download the staged photo

## Step 5: Advanced Features

### 5.1 Real Estate Photo Enhancement
The FAL AI service also supports:
- **Brightening**: Improve lighting and spaciousness
- **Decluttering**: Remove unwanted objects
- **Furniture Addition**: Add appropriate furniture
- **Style Application**: Apply specific design styles

### 5.2 Virtual Tour Generation
Generate multiple staged views for virtual tours:
```typescript
const roomDescriptions = [
  "living room view",
  "kitchen view", 
  "bedroom view",
  "bathroom view"
];
const tourImages = await falAI.generateVirtualTour(baseImageUrl, roomDescriptions);
```

### 5.3 Custom Prompts
Create custom staging prompts:
```typescript
const customPrompt = "Transform this empty room into a luxury modern space with high-end furniture, marble finishes, and sophisticated lighting suitable for a premium real estate listing.";
const result = await falAI.generateImage({
  prompt: customPrompt,
  image_url: imageUrl,
  strength: 0.8,
  guidance_scale: 8.0
});
```

## Step 6: Production Deployment

### 6.1 Cloudflare Deployment
When deploying to Cloudflare:

1. **Update Environment Variables**
   ```bash
   # In Cloudflare dashboard
   CLOUDFLARE_FAL_AI_API_KEY=your-production-api-key
   ```

2. **Test Production Integration**
   ```bash
   npm run cf:deploy:prod
   ```

3. **Monitor Performance**
   - Check API response times
   - Monitor credit usage
   - Track error rates

### 6.2 Scaling Considerations

#### API Rate Limits
- FAL AI has rate limits based on your plan
- Implement client-side rate limiting
- Use caching for repeated requests

#### Cost Management
- Monitor API credit usage
- Set up alerts for low credits
- Implement usage quotas per tenant

#### Performance Optimization
- Use CDN for generated images
- Implement lazy loading
- Optimize image formats and sizes

## Step 7: Troubleshooting

### 7.1 Common Issues

#### API Key Problems
**Error**: "Invalid API key"
**Solution**: 
- Verify API key is correct
- Check account status and credits
- Ensure API key has proper permissions

#### Image Generation Failures
**Error**: "Failed to generate image"
**Solution**:
- Check input image format and size
- Verify FAL AI service status
- Reduce image complexity or size

#### Performance Issues
**Error**: "Slow response times"
**Solution**:
- Check network connectivity
- Optimize image sizes before upload
- Consider upgrading FAL AI plan

### 7.2 Debug Mode

Enable debug logging:
```typescript
// In development mode
if (process.env.NODE_ENV === 'development') {
  console.log('FAL AI Request:', request);
  console.log('FAL AI Response:', response);
}
```

### 7.3 Error Handling

The integration includes comprehensive error handling:
- API validation errors
- Network connectivity issues
- Service availability problems
- Credit exhaustion alerts

## Step 8: Best Practices

### 8.1 Image Guidelines

For best results:
- **Resolution**: Use high-resolution images (at least 1024x1024)
- **Lighting**: Well-lit rooms with natural light preferred
- **Clarity**: Sharp, in-focus images
- **Format**: JPEG or PNG files
- **Size**: Keep under 10MB

### 8.2 Prompt Engineering

Effective staging prompts:
- Be specific about furniture styles
- Include material preferences
- Mention lighting requirements
- Specify target audience

Example:
```
"Transform this empty living room into a modern, sophisticated space with a contemporary gray sofa, glass coffee table, abstract wall art, and minimalist decor. Use clean lines and neutral colors suitable for a luxury real estate listing."
```

### 8.3 User Experience

- Show progress indicators during processing
- Provide clear error messages
- Offer style previews and examples
- Enable easy retry functionality

## Step 9: Integration with Existing Features

### 9.1 Multi-Tenancy Support
The FAL AI integration works seamlessly with your multi-tenant architecture:
- Each tenant gets separate usage tracking
- Resource quotas apply per tenant
- Custom styling options per tenant

### 9.2 Storage Integration
Generated images are stored using your configured storage:
- Cloudflare R2 for production
- Local storage for development
- Automatic CDN integration

### 9.3 Authentication
FAL AI requests are authenticated and authorized:
- API key validation
- User session verification
- Tenant access control

## Step 10: Monitoring and Analytics

### 10.1 Usage Tracking
Monitor key metrics:
- Number of staging requests
- Processing time per request
- Success/failure rates
- Resource consumption per tenant

### 10.2 Performance Monitoring
Track performance metrics:
- API response times
- Image generation quality
- User satisfaction scores
- System resource usage

### 10.3 Business Metrics
Monitor business impact:
- User engagement with staging feature
- Conversion rates for staged vs. unstaged listings
- Tenant retention rates
- Revenue per staging request

## Conclusion

With FAL AI integration, your StagifyAI application now provides:
- ✅ **Real virtual staging functionality**
- ✅ **Professional-quality image generation**
- ✅ **Multiple staging styles and customization**
- ✅ **Seamless user experience**
- ✅ **Production-ready deployment**

The system is ready for real-world use by real estate agents and agencies looking to enhance their property listings with AI-powered virtual staging.

## Support

For issues with FAL AI integration:
1. Check the [FAL AI Documentation](https://fal.ai/docs)
2. Verify your API key and account status
3. Review the troubleshooting section above
4. Contact FAL AI support for service-specific issues