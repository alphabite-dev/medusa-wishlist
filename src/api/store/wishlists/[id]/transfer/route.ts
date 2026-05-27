import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework";
import WishlistModuleService from "../../../../../modules/wishlist/service";
import { WISHLIST_MODULE } from "../../../../../modules/wishlist";

//-----Transfer wishlists to a specific customer-----//
export interface TransferWishlistOutput {
  id: string;
}

export async function POST(req: AuthenticatedMedusaRequest, res: MedusaResponse<TransferWishlistOutput>) {
  const logger = req.scope.resolve("logger");

  const customer_id = req.auth_context.actor_id;
  const { id } = req.params;

  try {
    const wishlistService = req.scope.resolve<WishlistModuleService>(WISHLIST_MODULE);
    const settings = await wishlistService.getSettings();
    const query = req.scope.resolve("query");

    // Single-list mode: if multi is disabled and the customer already has a list,
    // merge guest items into the existing list and delete the guest list.
    if (!settings.allow_multiple_wishlists) {
      const existing = await wishlistService.listWishlists(
        { customer_id },
        { take: 1 },
      );
      const target = existing[0];

      if (target && target.id !== id) {
        const { data: guest_items } = await query.graph({
          entity: "wishlist_item",
          filters: { wishlist_id: id },
          fields: ["id", "product_variant_id", "product_id"],
        });

        const { data: target_items } = await query.graph({
          entity: "wishlist_item",
          filters: { wishlist_id: target.id },
          fields: ["id", "product_variant_id"],
        });

        const existingVariantIds = new Set(
          target_items.map((i) => i.product_variant_id),
        );
        const itemsToCopy = guest_items.filter(
          (i) => !existingVariantIds.has(i.product_variant_id),
        );

        await Promise.all(
          itemsToCopy.map((item) =>
            wishlistService.createWishlistItems({
              product_variant_id: item.product_variant_id,
              product_id: item.product_id,
              wishlist_id: target.id,
            }),
          ),
        );

        await wishlistService.deleteWishlists(id);

        return res.status(200).json({ id: target.id });
      }
    }

    // Default path: reassign the guest list to the customer.
    await wishlistService.updateWishlists({ id, customer_id });

    return res.status(200).json({ id });
  } catch (error) {
    logger.error("Transfer wishlists failed:", error);

    return res.status(500).end();
  }
}
