import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework";
import { MedusaError } from "@medusajs/framework/utils";
import WishlistModuleService from "../../../../modules/wishlist/service";
import { WISHLIST_MODULE } from "../../../../modules/wishlist";
import { Wishlist } from "../types";
import { defaultItemsFields } from "../../../../utils/utils";

export const POST = async (req: AuthenticatedMedusaRequest<{ share_token: string }>, res: MedusaResponse<Wishlist>) => {
  const logger = req.scope.resolve("logger");

  const { share_token } = req.validatedBody;
  const customer_id = req?.auth_context?.actor_id;

  const wishlistService = req.scope.resolve<WishlistModuleService>(WISHLIST_MODULE);
  const options = wishlistService._options;

  if (!options.allowGuestWishlist && !customer_id) {
    throw new MedusaError(MedusaError.Types.UNAUTHORIZED, "Guest wishlists are now allowed");
  }

  let wishlist_id: string | undefined;

  try {
    const decodedToken = await wishlistService.validateToken(share_token);

    wishlist_id = decodedToken?.wishlist_id;
  } catch (e) {
    throw new MedusaError(MedusaError.Types.UNAUTHORIZED, "Invalid share token");
  }

  if (!wishlist_id) {
    throw new MedusaError(MedusaError.Types.NOT_FOUND, "Wishlist not found for the provided share token");
  }

  try {
    const created_wishlist = await wishlistService.importWishlist({ id: wishlist_id, customer_id });

    const query = req.scope.resolve("query");

    const { data: wishlist_items } = await query.graph({
      entity: "wishlist_item",
      filters: {
        wishlist_id: created_wishlist.id,
      },
      fields: [...defaultItemsFields, ...(options?.wishlistItemsFields || [])],
    });

    return res.status(200).json({ ...created_wishlist, items: wishlist_items });
  } catch (error) {
    logger.error("Error importing wishlist:", error);

    return res.status(500).end();
  }
};
