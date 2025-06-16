import { AuthenticatedMedusaRequest, MedusaRequest, MedusaResponse } from "@medusajs/framework";
import { MedusaError, MedusaErrorTypes } from "@medusajs/framework/utils";
import WishlistModuleService from "../../../../modules/wishlist/service";
import { UpdateWishlistInput } from "../validators";
import { Wishlist } from "../types";
import { WISHLIST_MODULE } from "../../../../modules/wishlist";

//-----Retrieves a specific wishlist by ID-----//
export async function GET(req: AuthenticatedMedusaRequest, res: MedusaResponse<Wishlist>) {
  const { id } = req.params;
  const customer_id = req?.auth_context?.actor_id;

  try {
    const query = req.scope.resolve("query");

    const { data } = await query.graph({
      entity: "wishlist",
      filters: {
        id,
      },
      fields: ["*", ...(req.queryConfig.fields || [])],
    });

    const wishlist = data?.[0];

    if (!wishlist) {
      throw new MedusaError(MedusaErrorTypes.NOT_FOUND, `Wishlist with ID ${id} not found`);
    }

    if (wishlist?.customer_id && wishlist?.customer_id !== customer_id) {
      throw new MedusaError(MedusaErrorTypes.UNAUTHORIZED, "You are not authorized to access this wishlist");
    }

    return res.status(200).json(wishlist);
  } catch (error) {
    console.log("Error fetching wishlists:", error);

    return res.status(500).end();
  }
}

export async function PUT(req: MedusaRequest<UpdateWishlistInput>, res: MedusaResponse<Omit<Wishlist, "items">>) {
  const input = req.body;
  const { id } = req.params;

  try {
    const wishlistService = req.scope.resolve<WishlistModuleService>(WISHLIST_MODULE);

    const updated_wishlist = await wishlistService.updateWishlists({
      id,
      ...input,
    });

    return res.status(200).json(updated_wishlist);
  } catch (error) {
    console.log("Transfer wishlists failed:", error);

    return res.status(500).end();
  }
}

//-----Delete a specific wishlist by ID-----//
export interface DeleteWishlistOutput {
  id: string;
}

export async function DELETE(req: MedusaRequest, res: MedusaResponse<DeleteWishlistOutput>) {
  const { id } = req.params;

  try {
    const wishlistService = req.scope.resolve<WishlistModuleService>(WISHLIST_MODULE);

    const response = await wishlistService.softDeleteWishlists({ id });

    return res.status(200).json({
      id,
    });
  } catch (error) {
    console.log("Wishlist deleting failed.", error);

    return res.status(500).end();
  }
}
