import { z } from "zod";

export const PostStoreCreateWishlistItem = z.object({
  product_id: z.string(),
});
