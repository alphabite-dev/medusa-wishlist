import { z } from "zod";

export const CreateWishlistInputSchema = z.object({
  name: z.string().optional(),
});

//---All params for update must be optional---//
export const UpdateWishlistInputSchema = CreateWishlistInputSchema.pick({
  name: true,
});
