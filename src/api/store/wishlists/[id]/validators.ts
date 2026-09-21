import { z } from "@medusajs/framework/zod";

export const RetrieveWishlistQuerySchema = z.object({
  items_fields: z.array(z.string()).optional(),
  include_inventory_count: z.coerce.boolean().optional(),
  include_calculated_price: z.coerce.boolean().optional(),
  region_id: z.string().optional(),
  currency_code: z.string().optional(),
});

export type RetrieveWishlistQuery = z.infer<typeof RetrieveWishlistQuerySchema>;
