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
  const settings = await wishlistService.getSettings();

  if (!settings.allow_guest_wishlist && !customer_id) {
    throw new MedusaError(MedusaError.Types.UNAUTHORIZED, "Guest wishlists are not allowed");
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

  const query = req.scope.resolve("query");

  try {
    // Single-list mode: if multi is disabled and the customer already has a list,
    // replace its items with the source list's items in place.
    if (!settings.allow_multiple_wishlists && customer_id) {
      const existing = await wishlistService.listWishlists(
        { customer_id },
        { take: 1 },
      );
      const target = existing[0];

      if (target) {
        // Load source items
        const { data: source_items } = await query.graph({
          entity: "wishlist_item",
          filters: { wishlist_id },
          fields: ["id", "product_variant_id", "product_id"],
        });

        // Load target items so we can delete them
        const { data: target_items } = await query.graph({
          entity: "wishlist_item",
          filters: { wishlist_id: target.id },
          fields: ["id"],
        });

        if (target_items.length > 0) {
          await wishlistService.deleteWishlistItems(target_items.map((i) => i.id));
        }

        await Promise.all(
          source_items.map((item) =>
            wishlistService.createWishlistItems({
              product_variant_id: item.product_variant_id,
              product_id: item.product_id,
              wishlist_id: target.id,
            }),
          ),
        );

        // Re-fetch the enriched items for the response
        const { data: enriched_items } = await query.graph({
          entity: "wishlist_item",
          filters: { wishlist_id: target.id },
          fields: [...defaultItemsFields, ...(options?.wishlistItemsFields || [])],
        });

        return res.status(200).json({
          ...target,
          items: enriched_items,
          items_count: enriched_items.length,
        } as Wishlist);
      }
    }

    // Default path: create a new wishlist via importWishlist (used when multi is
    // enabled, or when the customer has no existing list).
    const created_wishlist = await wishlistService.importWishlist({ id: wishlist_id, customer_id });

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
