import { z } from "@medusajs/framework/zod";

export const WishlistAnalyticsQuerySchema = z.object({
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
  sales_channel_id: z.string().optional(),
});

export type WishlistAnalyticsQueryInput = z.infer<
  typeof WishlistAnalyticsQuerySchema
>;
