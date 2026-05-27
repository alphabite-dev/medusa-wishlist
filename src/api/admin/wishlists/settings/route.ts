import { MedusaRequest, MedusaResponse } from "@medusajs/framework";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import { WISHLIST_MODULE } from "../../../../modules/wishlist";
import WishlistModuleService from "../../../../modules/wishlist/service";
import { UpdateWishlistSettingsSchema } from "./validators";

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const logger = req.scope.resolve(ContainerRegistrationKeys.LOGGER);
  const service = req.scope.resolve<WishlistModuleService>(WISHLIST_MODULE);

  try {
    const view = await service.getSettings();
    return res.status(200).json(view);
  } catch (error) {
    logger.error("[admin/wishlists/settings] GET error:", error);
    return res.status(500).json({
      error: "Failed to load wishlist settings",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

export async function PUT(req: MedusaRequest, res: MedusaResponse) {
  const logger = req.scope.resolve(ContainerRegistrationKeys.LOGGER);
  const service = req.scope.resolve<WishlistModuleService>(WISHLIST_MODULE);

  const parsed = UpdateWishlistSettingsSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      error: "Invalid wishlist settings payload",
      issues: parsed.error.flatten(),
    });
  }

  try {
    const view = await service.updateSettings(parsed.data);
    return res.status(200).json(view);
  } catch (error) {
    logger.error("[admin/wishlists/settings] PUT error:", error);
    return res.status(500).json({
      error: "Failed to update wishlist settings",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
