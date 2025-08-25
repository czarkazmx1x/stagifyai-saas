"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { 
  Users, 
  Building2, 
  Image as ImageIcon, 
  Settings, 
  Plus,
  BarChart3,
  Activity,
  Star,
  Crown,
  Shield
} from "lucide-react";

interface TenantStats {
  userCount: number;
  projectCount: number;
  organizationCount: number;
  monthlyUsage: Record<string, number>;
}

interface TenantUser {
  id: string;
  email: string;
  name?: string;
  role: string;
  organization?: {
    id: string;
    name: string;
  };
}

interface Tenant {
  id: string;
  name: string;
  slug: string;
  domain?: string;
  planType: string;
  status: string;
  _count: {
    users: number;
    organizations: number;
    projects: number;
  };
}

export default function TenantDashboard() {
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [stats, setStats] = useState<TenantStats | null>(null);
  const [users, setUsers] = useState<TenantUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Mock data - in real app, fetch from API
    const mockTenant: Tenant = {
      id: "1",
      name: "Premium Real Estate",
      slug: "premium-real-estate",
      domain: "premium.example.com",
      planType: "pro",
      status: "active",
      _count: {
        users: 5,
        organizations: 2,
        projects: 23
      }
    };

    const mockStats: TenantStats = {
      userCount: 5,
      projectCount: 23,
      organizationCount: 2,
      monthlyUsage: {
        staging: 18,
        storage: 450,
        api_calls: 1250
      }
    };

    const mockUsers: TenantUser[] = [
      {
        id: "1",
        email: "john@premium.com",
        name: "John Smith",
        role: "owner",
        organization: {
          id: "1",
          name: "Main Office"
        }
      },
      {
        id: "2",
        email: "sarah@premium.com",
        name: "Sarah Johnson",
        role: "admin",
        organization: {
          id: "1",
          name: "Main Office"
        }
      },
      {
        id: "3",
        email: "mike@premium.com",
        name: "Mike Davis",
        role: "member",
        organization: {
          id: "2",
          name: "Branch Office"
        }
      }
    ];

    setTimeout(() => {
      setTenant(mockTenant);
      setStats(mockStats);
      setUsers(mockUsers);
      setIsLoading(false);
    }, 1000);
  }, []);

  const getPlanIcon = (planType: string) => {
    switch (planType) {
      case 'enterprise':
        return <Crown className="w-4 h-4" />;
      case 'pro':
        return <Star className="w-4 h-4" />;
      default:
        return <Shield className="w-4 h-4" />;
    }
  };

  const getPlanColor = (planType: string) => {
    switch (planType) {
      case 'enterprise':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'pro':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRoleBadge = (role: string) => {
    const variants = {
      owner: 'default',
      admin: 'secondary',
      member: 'outline',
      viewer: 'outline'
    } as const;

    return (
      <Badge variant={variants[role as keyof typeof variants] || 'outline'}>
        {role.charAt(0).toUpperCase() + role.slice(1)}
      </Badge>
    );
  };

  const getUsageLimit = (resourceType: string) => {
    const limits = {
      staging: tenant?.planType === 'enterprise' ? 1000 : tenant?.planType === 'pro' ? 100 : 10,
      storage: tenant?.planType === 'enterprise' ? 50000 : tenant?.planType === 'pro' ? 10000 : 1000,
      api_calls: tenant?.planType === 'enterprise' ? 100000 : tenant?.planType === 'pro' ? 10000 : 1000
    };

    return limits[resourceType as keyof typeof limits] || 0;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!tenant) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Tenant Not Found</h2>
          <p className="text-slate-600">Please contact your administrator.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
              {tenant.name}
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              Tenant Dashboard
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge className={getPlanColor(tenant.planType)}>
              {getPlanIcon(tenant.planType)}
              <span className="ml-2 capitalize">{tenant.planType} Plan</span>
            </Badge>
            <Badge variant={tenant.status === 'active' ? 'default' : 'secondary'}>
              {tenant.status}
            </Badge>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.userCount}</div>
              <p className="text-xs text-muted-foreground">
                Active team members
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Organizations</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.organizationCount}</div>
              <p className="text-xs text-muted-foreground">
                Business units
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Projects</CardTitle>
              <ImageIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.projectCount}</div>
              <p className="text-xs text-muted-foreground">
                Staging projects
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Plan Usage</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Math.round((stats?.projectCount || 0) / (tenant.planType === 'enterprise' ? 1000 : tenant.planType === 'pro' ? 100 : 10) * 100)}%
              </div>
              <Progress 
                value={(stats?.projectCount || 0) / (tenant.planType === 'enterprise' ? 1000 : tenant.planType === 'pro' ? 100 : 10) * 100} 
                className="mt-2" 
              />
              <p className="text-xs text-muted-foreground">
                This month
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">Team Members</TabsTrigger>
            <TabsTrigger value="usage">Resource Usage</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Resource Usage</CardTitle>
                  <CardDescription>
                    Current month's resource consumption
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {stats?.monthlyUsage && Object.entries(stats.monthlyUsage).map(([resource, amount]) => (
                    <div key={resource}>
                      <div className="flex justify-between text-sm">
                        <span className="capitalize">{resource.replace('_', ' ')}</span>
                        <span>{amount} / {getUsageLimit(resource)}</span>
                      </div>
                      <Progress 
                        value={(amount / getUsageLimit(resource)) * 100} 
                        className="mt-1" 
                      />
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>
                    Common tenant management tasks
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full justify-start">
                    <Plus className="w-4 h-4 mr-2" />
                    Invite Team Member
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Building2 className="w-4 h-4 mr-2" />
                    Create Organization
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Settings className="w-4 h-4 mr-2" />
                    Tenant Settings
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Activity className="w-4 h-4 mr-2" />
                    View Reports
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>Team Members</CardTitle>
                <CardDescription>
                  Manage users and their access levels
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {users.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <Avatar>
                          <AvatarFallback>
                            {user.name?.charAt(0) || user.email.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{user.name || user.email}</div>
                          <div className="text-sm text-slate-600">{user.email}</div>
                          {user.organization && (
                            <div className="text-xs text-slate-500">{user.organization.name}</div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getRoleBadge(user.role)}
                        <Button variant="outline" size="sm">
                          Edit
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="usage">
            <Card>
              <CardHeader>
                <CardTitle>Resource Usage</CardTitle>
                <CardDescription>
                  Detailed resource consumption analytics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-600">
                  Resource usage analytics will be displayed here.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Tenant Settings</CardTitle>
                <CardDescription>
                  Configure your tenant preferences and branding
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-2">General Information</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium">Tenant Name</label>
                        <div className="p-2 border rounded bg-slate-50">{tenant.name}</div>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Slug</label>
                        <div className="p-2 border rounded bg-slate-50">{tenant.slug}</div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium mb-2">Plan Information</h3>
                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium capitalize">{tenant.planType} Plan</div>
                          <div className="text-sm text-slate-600">
                            {tenant.planType === 'enterprise' ? 'Unlimited everything' :
                             tenant.planType === 'pro' ? 'Advanced features for teams' :
                             'Basic features for individuals'}
                          </div>
                        </div>
                        <Button>Upgrade Plan</Button>
                      </div>
                    </div>
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