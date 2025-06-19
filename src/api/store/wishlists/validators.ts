import { z } from "zod";

export const CreateWishlistInputSchema = z.object({
  name: z.string().optional(),
  sales_channel_id: z.string(),
});

export type CreateWishlistInput = Zod.infer<typeof CreateWishlistInputSchema>;

//---All params for update must be optional---//
export const UpdateWishlistInputSchema = CreateWishlistInputSchema.pick({
  name: true,
});

export type UpdateWishlistInput = Zod.infer<typeof UpdateWishlistInputSchema>;

export const ListWishlistsQuerySchema = z.object({
  items_fields: z.array(z.string()).optional(),
});

export type ListWishlistsQuery = Zod.infer<typeof ListWishlistsQuerySchema>;
