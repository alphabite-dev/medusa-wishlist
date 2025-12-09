import { z } from "zod";

export const RetrieveWishlistQuerySchema = z.object({
  items_fields: z.array(z.string()).optional(),
  include_inventory_count: z.coerce.boolean().optional(),
  include_calculated_price: z.coerce.boolean().optional(),
});

export type RetrieveWishlistQuery = z.infer<typeof RetrieveWishlistQuerySchema>;
