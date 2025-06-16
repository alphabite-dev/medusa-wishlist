import { z } from "zod";

export const CreateWishlistInputSchema = z.object({
  name: z.string().optional(),
});

export const AddItemToWishlistInputSchema = z.object({
  product_id: z.string(),
});
