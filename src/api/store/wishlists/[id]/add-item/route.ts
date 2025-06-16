import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework";
import WishlistModuleService from "../../../../../modules/wishlist/service";
import { WishlistItem } from "../../types";
import { WISHLIST_MODULE } from "../../../../../modules/wishlist";
import { AddItemToWishlistInput } from "./validators";

export const POST = async (
  req: AuthenticatedMedusaRequest<AddItemToWishlistInput>,
  res: MedusaResponse<WishlistItem>
) => {
  const { product_variant_id } = req.body;
  const { id } = req.params;

  try {
    const wishlistService = req.scope.resolve<WishlistModuleService>(WISHLIST_MODULE);
    const query = req.scope.resolve("query");

    const created_item = await wishlistService.createWishlistItems({
      product_variant_id,
      wishlist_id: id,
    });

    const { data: enriched_wishlist_item } = await query.graph({
      entity: "wishlist_item",
      filters: {
        id: created_item.id,
      },
      ...req.queryConfig,
      fields: req.queryConfig?.fields || [],
    });

    return res.status(201).json(enriched_wishlist_item[0]);
  } catch (error) {
    console.log("Add item to wishlist failed", error);

    return res.status(500).end();
  }
};
