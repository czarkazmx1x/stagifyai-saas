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

    if (!user || !user.tenant) {
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

export function withTenant(handler: (request: NextRequest, context: TenantContext) => Promise<NextResponse>) {
  return async (request: NextRequest) => {
    try {
      const context = await requireTenantContext(request);
      return await handler(request, context);
    } catch (error) {
      if (error instanceof Error && error.message === 'Unauthorized: Invalid tenant context') {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        );
      }
      
      console.error('Tenant middleware error:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  };
}