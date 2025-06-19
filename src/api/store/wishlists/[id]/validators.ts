import { z } from "zod";

export const RetrieveWishlistQuerySchema = z.object({
  items_fields: z.array(z.string()).optional(),
});

export type RetrieveWishlistQuery = z.infer<typeof RetrieveWishlistQuerySchema>;
