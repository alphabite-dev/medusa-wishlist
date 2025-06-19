import { z } from "zod";

export const TotalItemsCountInputSchema = z.object({
  wishlist_id: z.string().optional(),
});

export type TotalItemsCountInput = z.infer<typeof TotalItemsCountInputSchema>;
