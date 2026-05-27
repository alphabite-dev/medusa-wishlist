import { MedusaRequest, MedusaResponse } from "@medusajs/framework";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import { WISHLIST_MODULE } from "../../../../modules/wishlist";
import WishlistModuleService from "../../../../modules/wishlist/service";

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const logger = req.scope.resolve(ContainerRegistrationKeys.LOGGER);
  const service = req.scope.resolve<WishlistModuleService>(WISHLIST_MODULE);

  try {
    const view = await service.getSettings();
    return res.status(200).json(view);
  } catch (error) {
    logger.error("[store/wishlists/settings] GET error:", error);
    return res.status(500).json({
      error: "Failed to load wishlist settings",
    });
  }
}
