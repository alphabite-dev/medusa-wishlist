// medusa-source/wishlist/src/modules/wishlist/models/wishlist-settings.ts
import { model } from "@medusajs/framework/utils";
import { InferTypeOf } from "@medusajs/framework/types";

export const WishlistSettings = model.define("wishlist_settings", {
  id: model.id({ prefix: "wls" }).primaryKey(),
  allow_guest_wishlist: model.boolean().default(false),
  allow_multiple_wishlists: model.boolean().default(false),
});

export type WishlistSettingsType = InferTypeOf<typeof WishlistSettings>;
