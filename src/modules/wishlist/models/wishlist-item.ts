import { model } from "@medusajs/framework/utils";
import { Wishlist } from "./wishlist";
import { InferTypeOf } from "@medusajs/framework/types";

export const WishlistItem = model
  .define("wishlist_item", {
    id: model.id({ prefix: "wli" }).primaryKey(),
    product_variant_id: model.text(),
    wishlist: model.belongsTo(() => Wishlist, {
      mappedBy: "items",
    }),
  })
  .indexes([
    {
      on: ["product_variant_id", "wishlist_id"],
      unique: true,
    },
  ]);
