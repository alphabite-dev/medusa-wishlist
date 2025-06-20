import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework";
import { MedusaError } from "@medusajs/framework/utils";
import WishlistModuleService from "../../../../../modules/wishlist/service";
import { WISHLIST_MODULE } from "../../../../../modules/wishlist";

export const POST = async (req: AuthenticatedMedusaRequest, res: MedusaResponse<{ share_token: string }>) => {
  const logger = req.scope.resolve("logger");

  const { id } = req.params;
  const customer_id = req?.auth_context?.actor_id;

  const wishlistService = req.scope.resolve<WishlistModuleService>(WISHLIST_MODULE);
  const options = wishlistService._options;

  if (!options.allowGuestWishlist && !customer_id) {
    throw new MedusaError(MedusaError.Types.UNAUTHORIZED, "Guest wishlists are now allowed");
  }

  try {
    const share_token = await wishlistService.createShareToken({ wishlist_id: id });

    return res.status(200).json({
      share_token,
    });
  } catch (error) {
    logger.error("Error creating wishlist share token:", error);

    return res.status(500).end();
  }
};
