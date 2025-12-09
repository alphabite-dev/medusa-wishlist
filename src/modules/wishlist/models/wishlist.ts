import { model } from "@medusajs/framework/utils";
import { WishlistItem } from "./wishlist-item";
import { InferTypeOf } from "@medusajs/framework/types";

export const Wishlist = model
  .define("wishlist", {
    id: model.id({ prefix: "wl" }).primaryKey(),
    name: model.text().nullable(),
    customer_id: model.text().nullable(),
    sales_channel_id: model.text(),
    items: model.hasMany(() => WishlistItem),
  })
  .indexes([
    {
      on: ["customer_id", "sales_channel_id"],
      where: { customer_id: { $ne: null } },
    },
  ]);

export type WishlistType = InferTypeOf<typeof Wishlist>;
