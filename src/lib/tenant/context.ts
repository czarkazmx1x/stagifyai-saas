import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export interface TenantContext {
  tenant: {
    id: string;
    name: string;
    slug: string;
    domain?: string;
    planType: string;
    status: string;
  };
  user: {
    id: string;
    email: string;
    name?: string;
    role: string;
    organizationId?: string;
  };
  organization?: {
    id: string;
    name: string;
  };
}

export async function getTenantContext(request: NextRequest): Promise<TenantContext | null> {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return null;
    }

    // Get user with tenant and organization
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      include: {
        tenant: true,
        organization: true
      }
    });

    if (!user?.tenant) {
      return null;
    }

    // Check if tenant is active
    if (user.tenant.status !== 'active') {
      return null;
    }

    // Check if user is active
    if (user.status !== 'active') {
      return null;
    }

    return {
      tenant: {
        id: user.tenant.id,
        name: user.tenant.name,
        slug: user.tenant.slug,
        domain: user.tenant.domain,
        planType: user.tenant.planType,
        status: user.tenant.status
      },
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        organizationId: user.organizationId
      },
      organization: user.organization ? {
        id: user.organization.id,
        name: user.organization.name
      } : undefined
    };
  } catch (error) {
    console.error('Error getting tenant context:', error);
    return null;
  }
}

export async function requireTenantContext(request: NextRequest): Promise<TenantContext> {
  const context = await getTenantContext(request);
  
  if (!context) {
    throw new Error('Unauthorized: Invalid tenant context');
  }
  
  return context;
}

export async function tenantMiddleware(request: NextRequest): Promise<NextResponse | null> {
  try {
    const context = await getTenantContext(request);
    
    if (!context) {
      // Redirect to login if no session
      return NextResponse.redirect(new URL('/login', request.url));
    }

    // Add tenant context to request headers for downstream use
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-tenant-id', context.tenant.id);
    requestHeaders.set('x-user-id', context.user.id);
    requestHeaders.set('x-user-role', context.user.role);

    // Return modified request
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  } catch (error) {
    console.error('Tenant middleware error:', error);
    return NextResponse.redirect(new URL('/login', request.url));
  }
}

// Role-based access control
export function hasPermission(role: string, requiredRole: string): boolean {
  const roleHierarchy = {
    'viewer': 0,
    'member': 1,
    'admin': 2,
    'owner': 3
  };
  
  return roleHierarchy[role as keyof typeof roleHierarchy] >= 
         roleHierarchy[requiredRole as keyof typeof roleHierarchy];
}

// Plan-based access control
export function hasFeatureAccess(planType: string, feature: string): boolean {
  const featureMatrix = {
    'free': ['basic_staging', '5_projects', '1_user'],
    'pro': ['basic_staging', 'advanced_staging', 'unlimited_projects', 'team_members', 'custom_branding'],
    'enterprise': ['basic_staging', 'advanced_staging', 'unlimited_projects', 'team_members', 'custom_branding', 'api_access', 'priority_support', 'custom_domain']
  };
  
  return featureMatrix[planType as keyof typeof featureMatrix]?.includes(feature) || false;
}