import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework";
import { PaginatedOutput, WishlistItem } from "../../types";
import { getPagination } from "../../../../../utils/utils";
import WishlistModuleService from "../../../../../modules/wishlist/service";
import { WISHLIST_MODULE } from "../../../../../modules/wishlist";

export const GET = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse<PaginatedOutput<WishlistItem>>
) => {
  const { id } = req.params;
  const customer_id = req?.auth_context?.actor_id;

  try {
    const query = req.scope.resolve("query");
    const wishlistService =
      req.scope.resolve<WishlistModuleService>(WISHLIST_MODULE);
    const options = wishlistService._options;

    const { data: wishlist_items, metadata } = await query.graph({
      entity: "wishlist_item",
      filters: {
        wishlist_id: id,
        ...(customer_id && { customer_id }),
      },
      ...req.queryConfig,
      fields: [...(req.queryConfig.fields || []), ...(options?.fields || [])],
    });

    return res.status(200).json({
      data: wishlist_items,
      skip: metadata?.skip || 0,
      take: metadata?.take || 5,
      ...getPagination(metadata!),
    });
  } catch (error) {
    console.log("Error fetching wishlist items:", error);

    return res.status(500).end();
  }
};
