import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework";
import WishlistModuleService from "../../../../../../modules/wishlist/service";
import { WISHLIST_MODULE } from "../../../../../../modules/wishlist";
import { MedusaError } from "@medusajs/framework/utils";
import { assertWishlistAccess } from "../../../../../../utils/wishlist-access";

//-----Delete item from wishlist-----//
export interface DeleteWishlistItemOutput {
  id: string;
}

export const DELETE = async (req: AuthenticatedMedusaRequest, res: MedusaResponse<DeleteWishlistItemOutput>) => {
  const logger = req.scope.resolve("logger");

  const { item_id, id: wishlist_id } = req.params;
  const customer_id = req?.auth_context?.actor_id;

  const wishlistService = req.scope.resolve<WishlistModuleService>(WISHLIST_MODULE);
  const settings = await wishlistService.getSettings();

  if (!settings.allow_guest_wishlist && !customer_id) {
    throw new MedusaError(MedusaError.Types.UNAUTHORIZED, "Guest wishlists are not allowed");
  }

  try {
    const query = req.scope.resolve("query");

    const { data: wishlist } = await query.graph({
      entity: "wishlist",
      filters: { id: wishlist_id },
      fields: ["id", "customer_id"],
    });

    assertWishlistAccess(wishlist[0], customer_id, "remove items from");

    const { data: items } = await query.graph({
      entity: "wishlist_item",
      filters: { id: item_id, wishlist_id },
      fields: ["id"],
    });

    if (!items.length) {
      throw new MedusaError(
        MedusaError.Types.NOT_FOUND,
        `Item with ID ${item_id} not found in wishlist ${wishlist_id}`
      );
    }

    //Remove item from wishlist
    await wishlistService.deleteWishlistItems(item_id);

    return res.status(200).json({ id: item_id });
  } catch (error) {
    logger.error("Error fetching wishlists:", error);

    return res.status(500).end();
  }
};
