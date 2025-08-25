@echo off
echo Building StagifyAI for production...

rem Install dependencies if needed
if not exist "node_modules" (
    echo Installing dependencies...
    npm install
)

rem Build the Next.js application
echo Building Next.js application...
npx next build

rem Deploy to Cloudflare Pages
echo Deploying to Cloudflare Pages...
npx wrangler pages deploy .next --project-name stagifyai

echo.
echo ✅ Deployment complete!
echo Your application will be available at: https://stagifyai.pages.dev
echo.
