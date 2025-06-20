import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework";
import WishlistModuleService from "../../../../../../modules/wishlist/service";
import { WISHLIST_MODULE } from "../../../../../../modules/wishlist";
import { MedusaError } from "@medusajs/framework/utils";

//-----Delete item from wishlist-----//
export interface DeleteWishlistItemOutput {
  id: string;
}

export const DELETE = async (req: AuthenticatedMedusaRequest, res: MedusaResponse<DeleteWishlistItemOutput>) => {
  const logger = req.scope.resolve("logger");

  const { item_id, id: wishlist_id } = req.params;
  const customer_id = req?.auth_context?.actor_id;

  const wishlistService = req.scope.resolve<WishlistModuleService>(WISHLIST_MODULE);
  const options = wishlistService._options;

  if (!options.allowGuestWishlist && !customer_id) {
    throw new MedusaError(MedusaError.Types.UNAUTHORIZED, "Guest wishlists are now allowed");
  }

  try {
    const query = req.scope.resolve("query");

    const { data: wishlist } = await query.graph({
      entity: "wishlist",
      filters: { id: wishlist_id },
      fields: ["id", "customer_id"],
    });

    if (wishlist[0]?.customer_id && !customer_id) {
      throw new MedusaError(
        MedusaError.Types.UNAUTHORIZED,
        "You are not authorized to remove items from this wishlist"
      );
    }

    if (customer_id && wishlist[0]?.customer_id && wishlist[0]?.customer_id !== customer_id) {
      throw new MedusaError(
        MedusaError.Types.UNAUTHORIZED,
        "You are not authorized to remove items from this wishlist"
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
