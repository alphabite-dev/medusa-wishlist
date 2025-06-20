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

    await wishlistService.updateWishlists({ id, customer_id });

    return res.status(200).json({ id });
  } catch (error) {
    logger.error("Transfer wishlists failed:", error);

    return res.status(500).end();
  }
}
