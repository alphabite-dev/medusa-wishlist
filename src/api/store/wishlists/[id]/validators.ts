import { z } from "@medusajs/framework/zod";

export const RetrieveWishlistQuerySchema = z.object({
  items_fields: z.array(z.string()).optional(),
  include_inventory_count: z.coerce.boolean().optional(),
  include_calculated_price: z.coerce.boolean().optional(),
  items_limit: z.coerce.number().int().positive().optional(),
  items_offset: z.coerce.number().int().nonnegative().optional(),
});

export type RetrieveWishlistQuery = z.infer<typeof RetrieveWishlistQuerySchema>;
