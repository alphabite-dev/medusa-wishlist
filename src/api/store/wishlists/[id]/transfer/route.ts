import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework";
import WishlistModuleService from "../../../../../modules/wishlist/service";

//-----Transfer wishlists to a specific customer-----//
export async function POST(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse<Record<string, string | boolean>>
) {
  const customer_id = req.auth_context.actor_id;
  const { id } = req.params;

  console.log(
    "Transfer wishlists for customer:",
    customer_id,
    "to wishlist ID:",
    id
  );

  const wishlistService = req.scope.resolve(
    "wishlist"
  ) as WishlistModuleService;

  try {
    //Return only the updated entity
    await wishlistService.updateWishlists({ id, customer_id });

    res.status(200).json({
      success: true,
      message: "Transfer wishlists successful",
      wishlist_id: id,
    });
  } catch (error) {
    console.log("Transfer wishlists failed:", error);

    res
      .status(500)
      .json({ success: false, message: "Transfer wishlists failed" });
  }
}
