import { z } from "@medusajs/framework/zod";

export const CreateWishlistInputSchema = z.object({
  name: z.string().optional(),
  sales_channel_id: z.string(),
});

export type CreateWishlistInput = z.infer<typeof CreateWishlistInputSchema>;

//---All params for update must be optional---//
export const UpdateWishlistInputSchema = CreateWishlistInputSchema.pick({
  name: true,
});

export type UpdateWishlistInput = z.infer<typeof UpdateWishlistInputSchema>;

export const ListWishlistsQuerySchema = z.object({
  items_fields: z.array(z.string()).optional(),
});

export type ListWishlistsQuery = z.infer<typeof ListWishlistsQuerySchema>;
