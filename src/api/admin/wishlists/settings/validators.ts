import { z } from "@medusajs/framework/zod";

export const UpdateWishlistSettingsSchema = z.object({
  allow_guest_wishlist: z.boolean().optional(),
  allow_multiple_wishlists: z.boolean().optional(),
});

export type UpdateWishlistSettingsInput = z.infer<
  typeof UpdateWishlistSettingsSchema
>;
