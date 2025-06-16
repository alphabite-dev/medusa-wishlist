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
