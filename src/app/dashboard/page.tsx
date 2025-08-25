"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "next/link";
import { 
  Home, 
  Upload, 
  Download, 
  Settings, 
  CreditCard,
  Image as ImageIcon,
  Clock,
  CheckCircle,
  XCircle,
  Loader2
} from "lucide-react";

interface StagingProject {
  id: string;
  originalUrl: string;
  stagedUrl?: string;
  style: string;
  status: string;
  createdAt: string;
}

export default function DashboardPage() {
  const [projects, setProjects] = useState<StagingProject[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Mock data - in real app, fetch from API
    const mockProjects: StagingProject[] = [
      {
        id: "1",
        originalUrl: "/placeholder-room.jpg",
        stagedUrl: "/placeholder-staged.jpg",
        style: "Modern",
        status: "completed",
        createdAt: "2024-01-15"
      },
      {
        id: "2",
        originalUrl: "/placeholder-room2.jpg",
        style: "Traditional",
        status: "processing",
        createdAt: "2024-01-16"
      },
      {
        id: "3",
        originalUrl: "/placeholder-room3.jpg",
        style: "Minimalist",
        status: "pending",
        createdAt: "2024-01-17"
      }
    ];
    
    setTimeout(() => {
      setProjects(mockProjects);
      setIsLoading(false);
    }, 1000);
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "processing":
        return <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />;
      case "failed":
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      completed: "default",
      processing: "secondary",
      failed: "destructive",
      pending: "outline"
    } as const;

    return (
      <Badge variant={variants[status as keyof typeof variants] || "outline"}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      {/* Navigation */}
      <nav className="px-4 py-4 border-b bg-white dark:bg-slate-800">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-2xl font-bold text-primary">StagifyAI</Link>
            <div className="flex gap-2">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm">
                  <Home className="w-4 h-4 mr-2" />
                  Dashboard
                </Button>
              </Link>
              <Link href="/staging">
                <Button variant="ghost" size="sm">
                  <Upload className="w-4 h-4 mr-2" />
                  Stage Room
                </Button>
              </Link>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm">
              <Settings className="w-4 h-4" />
            </Button>
            <Avatar>
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </nav>

      <div className="p-4 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
            Welcome back, John!
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Here's an overview of your virtual staging projects
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
              <ImageIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{projects.length}</div>
              <p className="text-xs text-muted-foreground">
                +2 from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {projects.filter(p => p.status === 'completed').length}
              </div>
              <p className="text-xs text-muted-foreground">
                Ready to download
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">In Progress</CardTitle>
              <Loader2 className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {projects.filter(p => p.status === 'processing').length}
              </div>
              <p className="text-xs text-muted-foreground">
                Being processed
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Plan Usage</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">7/10</div>
              <Progress value={70} className="mt-2" />
              <p className="text-xs text-muted-foreground">
                Free plan this month
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="projects" className="space-y-4">
          <TabsList>
            <TabsTrigger value="projects">My Projects</TabsTrigger>
            <TabsTrigger value="recent">Recent Activity</TabsTrigger>
            <TabsTrigger value="settings">Account Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="projects" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">Your Staging Projects</h2>
              <Link href="/staging">
                <Button>
                  <Upload className="w-4 h-4 mr-2" />
                  New Project
                </Button>
              </Link>
            </div>

            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin" />
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.map((project) => (
                  <Card key={project.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">
                            {project.style} Style
                          </CardTitle>
                          <CardDescription>
                            {new Date(project.createdAt).toLocaleDateString()}
                          </CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(project.status)}
                          {getStatusBadge(project.status)}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="relative">
                          <img
                            src={project.originalUrl}
                            alt="Original room"
                            className="w-full h-48 object-cover rounded-lg"
                          />
                          <Badge variant="secondary" className="absolute top-2 left-2">
                            Original
                          </Badge>
                        </div>
                        
                        {project.stagedUrl && (
                          <div className="relative">
                            <img
                              src={project.stagedUrl}
                              alt="Staged room"
                              className="w-full h-48 object-cover rounded-lg"
                            />
                            <Badge className="absolute top-2 left-2">
                              Staged
                            </Badge>
                          </div>
                        )}

                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" className="flex-1">
                            <Download className="w-4 h-4 mr-2" />
                            Download
                          </Button>
                          <Button size="sm" variant="outline">
                            View Details
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="recent">
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>
                  Your latest virtual staging activities
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  No recent activity to display.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Account Settings</CardTitle>
                <CardDescription>
                  Manage your account settings and preferences
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium">Subscription Plan</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      You're currently on the Free plan
                    </p>
                    <Button className="mt-2">Upgrade Plan</Button>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium">Account Information</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Email: john.doe@example.com
                    </p>
                    <Button variant="outline" className="mt-2">Edit Profile</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}