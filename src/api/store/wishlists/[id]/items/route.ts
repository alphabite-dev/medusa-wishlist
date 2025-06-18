import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework";
import { PaginatedOutput, WishlistItem } from "../../types";
import { getPagination } from "../../../../../utils/utils";
import WishlistModuleService from "../../../../../modules/wishlist/service";
import { WISHLIST_MODULE } from "../../../../../modules/wishlist";
import { MedusaError, MedusaErrorTypes } from "@medusajs/framework/utils";

export const GET = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse<PaginatedOutput<WishlistItem>>
) => {
  const { id } = req.params;
  const customer_id = req?.auth_context?.actor_id;

  const wishlistService =
    req.scope.resolve<WishlistModuleService>(WISHLIST_MODULE);
  const options = wishlistService._options;

  if (!options.allowGuestWishlist && !customer_id) {
    throw new MedusaError(
      MedusaError.Types.UNAUTHORIZED,
      "Guest wishlists are now allowed"
    );
  }

  try {
    const query = req.scope.resolve("query");

    const { data: wishlist_items, metadata } = await query.graph({
      entity: "wishlist_item",
      filters: {
        wishlist_id: id,
      },
      ...req.queryConfig,
      fields: [
        ...(req.queryConfig.fields || []),
        ...(options?.wishlistItemsFields || []),
      ],
    });

    if (customer_id && wishlist_items[0].wishlist.customer_id !== customer_id) {
      throw new MedusaError(
        MedusaErrorTypes.UNAUTHORIZED,
        "You are not authorized to access this wishlist items"
      );
    }

    return res.status(200).json({
      data: wishlist_items.map(
        ({ wishlist, ...wishlist_item }) => wishlist_item
      ),
      skip: metadata?.skip || 0,
      take: metadata?.take || 5,
      ...getPagination(metadata!),
    });
  } catch (error) {
    console.log("Error fetching wishlist items:", error);

    return res.status(500).end();
  }
};
