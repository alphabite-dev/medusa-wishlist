import { z } from "zod";

export const AddItemToWishlistInputSchema = z.object({
  product_variant_id: z.string(),
});

export type AddItemToWishlistInput = z.infer<typeof AddItemToWishlistInputSchema>;
