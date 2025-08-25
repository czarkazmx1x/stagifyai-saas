"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Loader2, Upload } from "lucide-react";

export default function TestFalAI() {
  const [apiKey, setApiKey] = useState("");
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
    details?: any;
  } | null>(null);

  const testApiKey = async () => {
    if (!apiKey.trim()) {
      setTestResult({
        success: false,
        message: "Please enter an API key"
      });
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    try {
      // Test the API key by making a simple request
      const response = await fetch('/api/test-fal-ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ apiKey }),
      });

      const data = await response.json();

      setTestResult({
        success: data.success,
        message: data.message,
        details: data.details
      });
    } catch (error) {
      setTestResult({
        success: false,
        message: "Failed to test API key",
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-6">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5" />
              FAL AI Integration Test
            </CardTitle>
            <CardDescription>
              Test your FAL AI API key to ensure the virtual staging functionality works correctly
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="apiKey">FAL AI API Key</Label>
              <Input
                id="apiKey"
                type="password"
                placeholder="Enter your FAL AI API key"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="font-mono text-sm"
              />
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Get your API key from the FAL AI dashboard
              </p>
            </div>

            <Button 
              onClick={testApiKey}
              disabled={isTesting || !apiKey.trim()}
              className="w-full"
            >
              {isTesting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Testing API Key...
                </>
              ) : (
                'Test API Key'
              )}
            </Button>

            {testResult && (
              <Alert className={testResult.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
                <div className="flex items-center gap-2">
                  {testResult.success ? (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-600" />
                  )}
                  <AlertDescription>
                    {testResult.message}
                  </AlertDescription>
                </div>
                {testResult.details && (
                  <div className="mt-2 text-sm">
                    <Badge variant={testResult.success ? "default" : "destructive"}>
                      Details
                    </Badge>
                    <pre className="mt-1 p-2 bg-slate-100 rounded text-xs overflow-auto">
                      {JSON.stringify(testResult.details, null, 2)}
                    </pre>
                  </div>
                )}
              </Alert>
            )}

            <div className="space-y-4">
              <h3 className="font-medium">What This Tests:</h3>
              <div className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span>API key validation</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span>FAL AI service connectivity</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span>Image generation capability</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span>Virtual staging functionality</span>
                </div>
              </div>
            </div>

            {testResult?.success && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <h4 className="font-medium text-green-800 mb-2">
                  🎉 Success! FAL AI is working correctly
                </h4>
                <p className="text-sm text-green-700">
                  Your virtual staging system is now fully functional. You can:
                </p>
                <ul className="mt-2 text-sm text-green-700 space-y-1">
                  <li>• Upload empty room photos</li>
                  <li>• Choose from 6 different staging styles</li>
                  <li>• Generate realistic staged images</li>
                  <li>• Download and use in real estate listings</li>
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}