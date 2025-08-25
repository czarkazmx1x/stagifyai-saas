# Multi-Tenancy Architecture Guide

## Overview

This guide outlines the multi-tenancy architecture for StagifyAI, enabling the platform to serve multiple customers (tenants) with complete data isolation and management capabilities.

## Multi-Tenancy Model

### 1. Tenant Types

#### **Individual Tenants (B2C)**
- Real estate agents
- Individual photographers
- Small property managers

#### **Organization Tenants (B2B)**
- Real estate agencies
- Property management companies
- Photography studios
- Enterprise clients

### 2. Data Isolation Strategy

#### **Database-Level Isolation**
- **Shared Database, Shared Schema** (Current)
- **Row-Level Security** via tenant_id
- **Automatic Filtering** via middleware

#### **Storage-Level Isolation**
- **Tenant-Specific Buckets** in R2
- **Path-Based Organization**
- **Access Control Lists**

## Enhanced Database Schema

### Core Tenant Models

```sql
-- Tenant Model (Organization/Company)
CREATE TABLE tenants (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  domain TEXT UNIQUE,
  logo_url TEXT,
  settings JSON,
  plan_type TEXT DEFAULT 'free',
  status TEXT DEFAULT 'active',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Organization Model (for B2B tenants)
CREATE TABLE organizations (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  name TEXT NOT NULL,
  settings JSON,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (tenant_id) REFERENCES tenants(id)
);

-- Enhanced User Model
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  password TEXT,
  image TEXT,
  tenant_id TEXT NOT NULL,
  organization_id TEXT,
  role TEXT DEFAULT 'member', -- 'owner', 'admin', 'member', 'viewer'
  status TEXT DEFAULT 'active',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (tenant_id) REFERENCES tenants(id),
  FOREIGN KEY (organization_id) REFERENCES organizations(id)
);

-- Enhanced Project Model
CREATE TABLE staging_projects (
  id TEXT PRIMARY KEY,
  original_url TEXT NOT NULL,
  staged_url TEXT,
  style TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  tenant_id TEXT NOT NULL,
  organization_id TEXT,
  user_id TEXT NOT NULL,
  metadata JSON,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (tenant_id) REFERENCES tenants(id),
  FOREIGN KEY (organization_id) REFERENCES organizations(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Tenant Settings Model
CREATE TABLE tenant_settings (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  setting_key TEXT NOT NULL,
  setting_value TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (tenant_id) REFERENCES tenants(id),
  UNIQUE(tenant_id, setting_key)
);

-- Resource Usage Tracking
CREATE TABLE resource_usage (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  resource_type TEXT NOT NULL, -- 'staging', 'storage', 'api_calls'
  amount INTEGER NOT NULL,
  period TEXT NOT NULL, -- 'daily', 'monthly'
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (tenant_id) REFERENCES tenants(id)
);
```

## Implementation Strategy

### Phase 1: Basic Multi-Tenancy (Current)

#### Current State:
- ✅ User-based isolation
- ✅ Basic project management
- ✅ Authentication system

#### Enhancements Needed:
- Add tenant_id to all models
- Implement tenant middleware
- Update all queries to include tenant filtering

### Phase 2: Advanced Multi-Tenancy

#### New Features:
- Tenant management dashboard
- Organization support
- Role-based access control
- Resource usage tracking

#### Implementation:

```typescript
// 1. Tenant Middleware
export async function tenantMiddleware(request: NextRequest) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return NextResponse.redirect('/login');
  }

  // Get tenant from user
  const user = await db.user.findUnique({
    where: { id: session.user.id },
    include: { tenant: true }
  });

  if (!user?.tenant) {
    return NextResponse.redirect('/onboarding');
  }

  // Add tenant to request context
  request.tenant = user.tenant;
  request.user = user;
}

// 2. Tenant-Aware Database Access
export class TenantDB {
  static async findProjects(tenantId: string) {
    return await db.stagingProject.findMany({
      where: { tenantId }
    });
  }

  static async createProject(tenantId: string, data: any) {
    return await db.stagingProject.create({
      data: {
        ...data,
        tenantId
      }
    });
  }
}

// 3. Tenant-Specific Storage
export class TenantStorage {
  static async uploadFile(tenantId: string, file: File) {
    const key = `${tenantId}/${Date.now()}-${file.name}`;
    return await uploadFile(file, key);
  }
}
```

### Phase 3: Enterprise Multi-Tenancy

#### Advanced Features:
- Custom domains
- White-labeling
- Advanced billing
- Team management
- API access
- Webhooks
- Advanced analytics

#### Implementation:

```typescript
// 1. Custom Domain Handling
export async function handleCustomDomain(request: NextRequest) {
  const host = request.headers.get('host');
  
  // Find tenant by custom domain
  const tenant = await db.tenant.findUnique({
    where: { domain: host }
  });

  if (tenant) {
    // Apply tenant branding
    return applyTenantBranding(tenant);
  }
}

// 2. Team Management
export class TeamService {
  static async inviteUser(tenantId: string, email: string, role: string) {
    // Create invitation
    const invitation = await db.invitation.create({
      data: {
        tenantId,
        email,
        role,
        token: generateToken()
      }
    });

    // Send invitation email
    await sendInvitationEmail(invitation);
  }
}

// 3. Resource Quotas
export class QuotaService {
  static async checkQuota(tenantId: string, resourceType: string) {
    const usage = await db.resourceUsage.findMany({
      where: {
        tenantId,
        resourceType,
        period: 'monthly'
      }
    });

    const total = usage.reduce((sum, u) => sum + u.amount, 0);
    const quota = await this.getTenantQuota(tenantId, resourceType);

    return { used: total, limit: quota, remaining: quota - total };
  }
}
```

## Tenant Management Features

### 1. Tenant Dashboard

```typescript
// Tenant Overview
export function TenantDashboard() {
  return (
    <div className="tenant-dashboard">
      <TenantInfo />
      <UsageStats />
      <TeamMembers />
      <BillingInfo />
      <Settings />
    </div>
  );
}
```

### 2. Team Management

```typescript
// Team Management Component
export function TeamManagement() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);

  return (
    <div>
      <TeamList members={members} />
      <InvitationList invitations={invitations} />
      <InviteMemberForm onInvite={handleInvite} />
    </div>
  );
}
```

### 3. Resource Usage Tracking

```typescript
// Resource Usage Component
export function ResourceUsage() {
  const [usage, setUsage] = useState<ResourceUsage[]>([]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <UsageCard 
        title="Staging Projects"
        used={usage.staging?.used || 0}
        limit={usage.staging?.limit || 100}
        icon={ImageIcon}
      />
      <UsageCard 
        title="Storage"
        used={usage.storage?.used || 0}
        limit={usage.storage?.limit || 1000}
        icon={HardDrive}
      />
      <UsageCard 
        title="API Calls"
        used={usage.api?.used || 0}
        limit={usage.api?.limit || 10000}
        icon={Zap}
      />
    </div>
  );
}
```

## Security Considerations

### 1. Data Isolation
- **Row-level security** via tenant_id
- **Query filtering** middleware
- **Access control lists** for shared resources

### 2. Authentication & Authorization
- **Multi-factor authentication** for enterprise tenants
- **Role-based access control** (RBAC)
- **Session isolation** per tenant

### 3. Compliance
- **GDPR compliance** per tenant
- **Data residency** options
- **Audit logging** per tenant

## Migration Strategy

### Step 1: Database Migration
```sql
-- Add tenant_id to existing tables
ALTER TABLE users ADD COLUMN tenant_id TEXT NOT NULL DEFAULT 'default';
ALTER TABLE staging_projects ADD COLUMN tenant_id TEXT NOT NULL DEFAULT 'default';

-- Create tenants table
CREATE TABLE tenants (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create default tenant
INSERT INTO tenants (id, name, slug) VALUES ('default', 'Default Tenant', 'default');

-- Update existing users to reference default tenant
UPDATE users SET tenant_id = 'default';
```

### Step 2: Code Migration
```typescript
// Update all database queries
// Before:
const projects = await db.stagingProject.findMany();

// After:
const projects = await db.stagingProject.findMany({
  where: { tenantId: currentTenant.id }
});
```

### Step 3: Feature Rollout
1. **Basic tenant isolation** (Week 1-2)
2. **Team management** (Week 3-4)
3. **Resource quotas** (Week 5-6)
4. **Advanced features** (Week 7-8)

## Benefits of Multi-Tenancy

### For Business
- **Scalability**: Serve thousands of customers from single instance
- **Cost Efficiency**: Shared infrastructure reduces costs
- **Rapid Deployment**: Quick onboarding of new tenants
- **Consistent Updates**: Single codebase for all customers

### For Customers
- **Custom Branding**: White-label options
- **Team Collaboration**: Multi-user access
- **Resource Control**: Usage monitoring and limits
- **Isolated Data**: Complete data privacy

### For Development
- **Simplified Maintenance**: Single codebase
- **Efficient Testing**: Test once, deploy to all
- **Centralized Monitoring**: Single dashboard
- **Easier Updates**: Roll out features instantly

This multi-tenancy architecture transforms StagifyAI from a single-user application into a scalable B2B/B2C platform capable of serving real estate agencies, property management companies, and individual agents with complete data isolation and enterprise features.