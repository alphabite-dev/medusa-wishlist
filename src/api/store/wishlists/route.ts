import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework";
import { CreateWishlistInput } from "./validators";
import { PaginatedOutput, Wishlist } from "./types";
import WishlistModuleService from "../../../modules/wishlist/service";
import { WISHLIST_MODULE } from "../../../modules/wishlist";
import { getPagination } from "../../../utils/utils";

export async function GET(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse<PaginatedOutput<Wishlist>>
) {
  const customer_id = req.auth_context.actor_id;

  try {
    const query = req.scope.resolve("query");
    const wishlistService =
      req.scope.resolve<WishlistModuleService>(WISHLIST_MODULE);
    const options = wishlistService._options;

    const { data, metadata } = await query.graph({
      entity: "wishlist",
      filters: { customer_id },
      ...req.queryConfig,
      fields: [
        "*",
        // ...(req.queryConfig.fields || []),
        ...(options?.fields || []),
        ...(options.includeWishlistItems ? req.queryConfig.fields : []),
      ],
    });

    return res.status(200).json({
      data,
      take: metadata?.take || 5,
      skip: metadata?.skip || 0,
      ...getPagination(metadata!),
    });
  } catch (error) {
    console.log("Error fetching wishlists:", error);

    return res.status(500).end();
  }
}

//-----Create wishlists-----//

export async function POST(
  req: AuthenticatedMedusaRequest<CreateWishlistInput>,
  res: MedusaResponse
) {
  const customer_id = req?.auth_context?.actor_id;
  const { ...input } = req.body;

  try {
    const wishlistService =
      req.scope.resolve<WishlistModuleService>(WISHLIST_MODULE);

    const wishlist = await wishlistService.createWishlists({
      ...input,
      ...(customer_id && { customer_id }),
    });

    return res.status(201).json(wishlist);
  } catch (error) {
    return res.status(500).end();
  }
}
