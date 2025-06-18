import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework";
import WishlistModuleService from "../../../../../modules/wishlist/service";
import { WishlistItem } from "../../types";
import { WISHLIST_MODULE } from "../../../../../modules/wishlist";
import { AddItemToWishlistInput } from "./validators";
import { MedusaError } from "@medusajs/framework/utils";

export const POST = async (
  req: AuthenticatedMedusaRequest<AddItemToWishlistInput>,
  res: MedusaResponse<WishlistItem>
) => {
  const { product_variant_id } = req.body;
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

    const { data: wishlist } = await query.graph({
      entity: "wishlist",
      filters: { id },
      fields: ["id", "customer_id"],
    });

    if (wishlist[0]?.customer_id && !customer_id) {
      throw new MedusaError(
        MedusaError.Types.UNAUTHORIZED,
        "You are not authorized to add items to this wishlist"
      );
    }

    if (
      customer_id &&
      wishlist[0]?.customer_id &&
      wishlist[0]?.customer_id !== customer_id
    ) {
      throw new MedusaError(
        MedusaError.Types.UNAUTHORIZED,
        "You are not authorized to add items to this wishlist"
      );
    }

    // console.log("wishlist", wishlist);

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
      fields: [
        ...(req.queryConfig.fields || []),
        ...(options?.wishlistItemsFields || []),
      ],
    });

    return res.status(201).json(enriched_wishlist_item[0]);
  } catch (error) {
    console.log("Add item to wishlist failed", error);

    return res.status(500).end();
  }
};
