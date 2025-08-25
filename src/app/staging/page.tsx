"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, Download, Loader2 } from "lucide-react";

interface StagingStyle {
  id: string;
  name: string;
  description: string;
}

const stagingStyles: StagingStyle[] = [
  {
    id: "modern",
    name: "Modern",
    description: "Clean lines, minimal furniture, contemporary aesthetic"
  },
  {
    id: "traditional",
    name: "Traditional",
    description: "Classic furniture, warm colors, timeless appeal"
  },
  {
    id: "minimalist",
    name: "Minimalist",
    description: "Simple, uncluttered, functional design"
  },
  {
    id: "scandinavian",
    name: "Scandinavian",
    description: "Light woods, cozy textiles, Nordic-inspired"
  },
  {
    id: "industrial",
    name: "Industrial",
    description: "Raw materials, exposed elements, urban loft style"
  },
  {
    id: "bohemian",
    name: "Bohemian",
    description: "Eclectic mix, patterns, artistic and free-spirited"
  }
];

export default function StagingPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [stagedImageUrl, setStagedImageUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setStagedImageUrl(null);
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setStagedImageUrl(null);
    }
  };

  const handleStage = async () => {
    if (!selectedFile || !selectedStyle) return;

    setIsProcessing(true);
    setProgress(0);

    // Simulate processing progress
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 500);

    try {
      const formData = new FormData();
      formData.append('image', selectedFile);
      formData.append('style', selectedStyle);

      const response = await fetch('/api/stage', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Staging failed');
      }

      const data = await response.json();
      
      if (data.success) {
        setStagedImageUrl(data.stagedUrl);
        setProgress(100);
      } else {
        throw new Error(data.error || 'Staging failed');
      }
    } catch (error) {
      console.error('Staging failed:', error);
      alert('Failed to stage image. Please try again.');
    } finally {
      setIsProcessing(false);
      clearInterval(progressInterval);
    }
  };

  const handleDownload = () => {
    if (stagedImageUrl) {
      const link = document.createElement('a');
      link.href = stagedImageUrl;
      link.download = `staged-${selectedStyle}-${Date.now()}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-slate-100 mb-4">
            Virtual Staging Studio
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            Upload your room photo and choose a staging style to transform your space
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Upload Section */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="w-5 h-5" />
                  Upload Room Photo
                </CardTitle>
                <CardDescription>
                  Upload a high-quality photo of an empty room for best results
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div
                  className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-colors"
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileSelect}
                  />
                  <Upload className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-600 dark:text-slate-400 mb-2">
                    Drag and drop your image here, or click to browse
                  </p>
                  <p className="text-sm text-slate-500">
                    Supports JPG, PNG, WebP (Max 10MB)
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Style Selection */}
            <Card>
              <CardHeader>
                <CardTitle>Choose Staging Style</CardTitle>
                <CardDescription>
                  Select the style that best matches your target market
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Select value={selectedStyle} onValueChange={setSelectedStyle}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a staging style" />
                  </SelectTrigger>
                  <SelectContent>
                    {stagingStyles.map((style) => (
                      <SelectItem key={style.id} value={style.id}>
                        <div>
                          <div className="font-medium">{style.name}</div>
                          <div className="text-sm text-slate-500">{style.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {/* Action Button */}
            <Button 
              onClick={handleStage}
              disabled={!selectedFile || !selectedStyle || isProcessing}
              className="w-full"
              size="lg"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Staging...
                </>
              ) : (
                'Stage Room'
              )}
            </Button>
          </div>

          {/* Preview Section */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Preview</CardTitle>
                <CardDescription>
                  {stagedImageUrl ? 'Your staged room is ready!' : 'Before and after preview will appear here'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isProcessing && (
                  <div className="space-y-4">
                    <Progress value={progress} className="w-full" />
                    <p className="text-center text-sm text-slate-600 dark:text-slate-400">
                      AI is staging your room... {progress}%
                    </p>
                  </div>
                )}

                <div className="space-y-4">
                  {previewUrl && (
                    <div>
                      <h3 className="text-sm font-medium mb-2">Original</h3>
                      <div className="relative">
                        <img
                          src={previewUrl}
                          alt="Original room"
                          className="w-full h-64 object-cover rounded-lg"
                        />
                        <Badge variant="secondary" className="absolute top-2 left-2">
                          Before
                        </Badge>
                      </div>
                    </div>
                  )}

                  {stagedImageUrl && (
                    <div>
                      <h3 className="text-sm font-medium mb-2">Staged</h3>
                      <div className="relative">
                        <img
                          src={stagedImageUrl}
                          alt="Staged room"
                          className="w-full h-64 object-cover rounded-lg"
                        />
                        <Badge className="absolute top-2 left-2">
                          After
                        </Badge>
                      </div>
                      <Button 
                        onClick={handleDownload}
                        className="w-full mt-4"
                        variant="outline"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download Staged Photo
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}