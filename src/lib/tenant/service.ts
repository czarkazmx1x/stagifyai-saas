import { db } from '@/lib/db';

export interface TenantCreateInput {
  name: string;
  slug: string;
  domain?: string;
  planType?: string;
  ownerEmail: string;
  ownerName?: string;
}

export interface TenantUpdateInput {
  name?: string;
  domain?: string;
  logoUrl?: string;
  settings?: any;
}

export class TenantService {
  static async createTenant(data: TenantCreateInput) {
    const { name, slug, domain, planType = 'free', ownerEmail, ownerName } = data;

    // Check if slug is available
    const existingTenant = await db.tenant.findUnique({
      where: { slug }
    });

    if (existingTenant) {
      throw new Error('Tenant slug already exists');
    }

    // Check if domain is available
    if (domain) {
      const existingDomain = await db.tenant.findUnique({
        where: { domain }
      });

      if (existingDomain) {
        throw new Error('Domain already exists');
      }
    }

    // Create tenant
    const tenant = await db.tenant.create({
      data: {
        name,
        slug,
        domain,
        planType,
        settings: {
          welcomeMessage: `Welcome to ${name}!`,
          primaryColor: '#6366f1',
          secondaryColor: '#f3f4f6'
        }
      }
    });

    // Create owner user
    const user = await db.user.create({
      data: {
        email: ownerEmail,
        name: ownerName,
        tenantId: tenant.id,
        role: 'owner'
      }
    });

    // Create subscription
    await db.subscription.create({
      data: {
        userId: user.id,
        tenantId: tenant.id,
        plan: planType,
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
      }
    });

    return { tenant, user };
  }

  static async getTenantById(id: string) {
    return await db.tenant.findUnique({
      where: { id },
      include: {
        users: {
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            status: true,
            createdAt: true
          }
        },
        organizations: {
          include: {
            users: {
              select: {
                id: true,
                email: true,
                name: true,
                role: true
              }
            }
          }
        },
        projects: {
          orderBy: {
            createdAt: 'desc'
          },
          take: 10
        },
        _count: {
          select: {
            users: true,
            organizations: true,
            projects: true
          }
        }
      }
    });
  }

  static async getTenantBySlug(slug: string) {
    return await db.tenant.findUnique({
      where: { slug },
      include: {
        users: {
          select: {
            id: true,
            email: true,
            name: true,
            role: true
          }
        }
      }
    });
  }

  static async getTenantByDomain(domain: string) {
    return await db.tenant.findUnique({
      where: { domain }
    });
  }

  static async updateTenant(id: string, data: TenantUpdateInput) {
    return await db.tenant.update({
      where: { id },
      data
    });
  }

  static async deleteTenant(id: string) {
    // This will cascade delete all related data
    return await db.tenant.delete({
      where: { id }
    });
  }

  static async getTenantUsers(tenantId: string) {
    return await db.user.findMany({
      where: { tenantId },
      include: {
        organization: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  }

  static async getTenantStats(tenantId: string) {
    const [userCount, projectCount, organizationCount] = await Promise.all([
      db.user.count({ where: { tenantId } }),
      db.stagingProject.count({ where: { tenantId } }),
      db.organization.count({ where: { tenantId } })
    ]);

    // Get current month's usage
    const currentMonth = new Date();
    currentMonth.setDate(1);
    currentMonth.setHours(0, 0, 0, 0);

    const monthlyUsage = await db.resourceUsage.findMany({
      where: {
        tenantId,
        period: 'monthly',
        createdAt: {
          gte: currentMonth
        }
      }
    });

    const usageByType = monthlyUsage.reduce((acc, usage) => {
      acc[usage.resourceType] = (acc[usage.resourceType] || 0) + usage.amount;
      return acc;
    }, {} as Record<string, number>);

    return {
      userCount,
      projectCount,
      organizationCount,
      monthlyUsage: usageByType
    };
  }

  static async trackResourceUsage(tenantId: string, resourceType: string, amount: number) {
    return await db.resourceUsage.create({
      data: {
        tenantId,
        resourceType,
        amount,
        period: 'monthly'
      }
    });
  }

  static async getTenantSettings(tenantId: string) {
    const settings = await db.tenantSetting.findMany({
      where: { tenantId }
    });

    return settings.reduce((acc, setting) => {
      acc[setting.settingKey] = setting.settingValue;
      return acc;
    }, {} as Record<string, string>);
  }

  static async updateTenantSetting(tenantId: string, key: string, value: string) {
    return await db.tenantSetting.upsert({
      where: {
        tenantId_settingKey: {
          tenantId,
          settingKey: key
        }
      },
      update: {
        settingValue: value
      },
      create: {
        tenantId,
        settingKey: key,
        settingValue: value
      }
    });
  }
}