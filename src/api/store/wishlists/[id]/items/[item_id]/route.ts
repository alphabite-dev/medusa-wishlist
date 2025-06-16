import { MedusaRequest, MedusaResponse } from "@medusajs/framework";
import WishlistModuleService from "../../../../../../modules/wishlist/service";

import { WISHLIST_MODULE } from "../../../../../../modules/wishlist";

//-----Delete item from wishlist-----//
export interface DeleteWishlistItemOutput {
  id: string;
}

export const DELETE = async (
  req: MedusaRequest,
  res: MedusaResponse<DeleteWishlistItemOutput>
) => {
  const { item_id } = req.params;
  const wishlistService =
    req.scope.resolve<WishlistModuleService>(WISHLIST_MODULE);

  try {
    //Remove item from wishlist
    await wishlistService.deleteWishlistItems(item_id);

    res.status(200).json({
      id: item_id,
    });
  } catch (error) {
    console.log("Error fetching wishlists:", error);

    res.status(500);
  }
};
