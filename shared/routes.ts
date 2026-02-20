import { z } from 'zod';
import { insertUserSchema, insertTransactionSchema, users, products, transactions, investments, settings } from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  unauthorized: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  auth: {
    register: {
      method: 'POST' as const,
      path: '/api/register',
      input: insertUserSchema.extend({
        referralCode: z.string().optional(),
      }),
      responses: {
        201: z.custom<typeof users.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    login: {
      method: 'POST' as const,
      path: '/api/login',
      input: z.object({
        phoneNumber: z.string(),
        password: z.string(),
      }),
      responses: {
        200: z.custom<typeof users.$inferSelect>(),
        401: errorSchemas.unauthorized,
      },
    },
    logout: {
      method: 'POST' as const,
      path: '/api/logout',
      responses: {
        200: z.void(),
      },
    },
    me: {
      method: 'GET' as const,
      path: '/api/user',
      responses: {
        200: z.custom<typeof users.$inferSelect>(),
        401: errorSchemas.unauthorized,
      },
    },
  },
  products: {
    list: {
      method: 'GET' as const,
      path: '/api/products',
      responses: {
        200: z.array(z.custom<typeof products.$inferSelect>()),
      },
    },
    invest: {
      method: 'POST' as const,
      path: '/api/invest',
      input: z.object({ productId: z.number() }),
      responses: {
        201: z.custom<typeof investments.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
  },
  transactions: {
    deposit: {
      method: 'POST' as const,
      path: '/api/deposit',
      input: z.object({
        amount: z.number(),
        firstName: z.string(),
        lastName: z.string(),
        country: z.string().optional(),
        method: z.string(),
      }),
      responses: {
        201: z.custom<typeof transactions.$inferSelect>(),
      },
    },
    withdraw: {
      method: 'POST' as const,
      path: '/api/withdraw',
      input: z.object({
        amount: z.number(),
        firstName: z.string(),
        lastName: z.string(),
        method: z.string(),
        mobileNumber: z.string(),
      }),
      responses: {
        201: z.custom<typeof transactions.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    list: {
      method: 'GET' as const,
      path: '/api/transactions',
      responses: {
        200: z.array(z.custom<typeof transactions.$inferSelect>()),
      },
    },
  },
  team: {
    stats: {
      method: 'GET' as const,
      path: '/api/team',
      responses: {
        200: z.object({
          referralLink: z.string(),
          referralCode: z.string(),
          totalReferrals: z.number(),
          totalCommission: z.number(),
          level1: z.number(),
          level2: z.number(),
          level3: z.number(),
          level1Earnings: z.number(),
          level2Earnings: z.number(),
          level3Earnings: z.number(),
        }),
      },
    },
  },
  investments: {
    list: {
      method: 'GET' as const,
      path: '/api/investments',
      responses: {
        200: z.array(z.custom<typeof investments.$inferSelect & { product: typeof products.$inferSelect }>()),
      },
    },
  },
  settings: {
    public: {
      method: 'GET' as const,
      path: '/api/settings/public',
      responses: {
        200: z.array(z.custom<typeof settings.$inferSelect>()),
      },
    },
  },
  profile: {
    updatePayment: {
      method: 'PUT' as const,
      path: '/api/profile/payment',
      input: z.object({
        paymentPhone: z.string(),
        paymentMethod: z.string(),
        paymentName: z.string(),
      }),
      responses: {
        200: z.custom<typeof users.$inferSelect>(),
      },
    },
  },
  admin: {
    stats: {
      method: 'GET' as const,
      path: '/api/admin/stats',
      responses: {
        200: z.object({
          registrationsToday: z.number(),
          depositsToday: z.number(),
        }),
      },
    },
    users: {
      method: 'GET' as const,
      path: '/api/admin/users',
      responses: {
        200: z.array(z.custom<typeof users.$inferSelect>()),
      },
    },
    transactions: {
      method: 'GET' as const,
      path: '/api/admin/transactions',
      responses: {
        200: z.array(z.custom<typeof transactions.$inferSelect>()),
      },
    },
    updateTransaction: {
      method: 'PATCH' as const,
      path: '/api/admin/transactions/:id',
      input: z.object({ status: z.enum(['completed', 'rejected']) }),
      responses: {
        200: z.custom<typeof transactions.$inferSelect>(),
      },
    },
    updateUser: {
      method: 'PATCH' as const,
      path: '/api/admin/users/:id',
      input: z.object({ 
        isBanned: z.boolean().optional(),
        withdrawalBlocked: z.boolean().optional(),
        isAdmin: z.boolean().optional()
      }),
      responses: {
        200: z.custom<typeof users.$inferSelect>(),
      },
    },
    settings: {
      method: 'GET' as const,
      path: '/api/admin/settings',
      responses: {
        200: z.array(z.custom<typeof settings.$inferSelect>()),
      },
    },
    updateSetting: {
      method: 'PUT' as const,
      path: '/api/admin/settings/:key',
      input: z.object({ value: z.string() }),
      responses: {
        200: z.custom<typeof settings.$inferSelect>(),
      },
    },
  },
};
