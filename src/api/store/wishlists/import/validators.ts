import { z } from "zod";

export const ImportWishlistInputSchema = z.object({
  share_token: z.string().min(1, "Share token is required"),
});

export type ImportWishlistInput = z.infer<typeof ImportWishlistInputSchema>;
