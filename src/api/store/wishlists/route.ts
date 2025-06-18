import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework";
import { CreateWishlistInput } from "./validators";
import { PaginatedOutput, Wishlist } from "./types";
import WishlistModuleService from "../../../modules/wishlist/service";
import { WISHLIST_MODULE } from "../../../modules/wishlist";
import { getPagination } from "../../../utils/utils";
import { MedusaError } from "@medusajs/framework/utils";

export async function GET(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse<PaginatedOutput<Wishlist>>
) {
  const customer_id = req.auth_context.actor_id;
  const wishlistService =
    req.scope.resolve<WishlistModuleService>(WISHLIST_MODULE);
  const options = wishlistService._options;

  try {
    const query = req.scope.resolve("query");

    const { data, metadata } = await query.graph({
      entity: "wishlist",
      filters: { customer_id },
      ...req.queryConfig,
      fields: [
        "*",
        ...(options?.fields || []),
        ...(options.includeWishlistItems ? req.queryConfig.fields : []),
      ],
    });

    const enriched_wishlist = await Promise.all(
      data.map(async (wishlist) => {
        const { data: items } = await query.graph({
          entity: "wishlist_item",
          filters: { wishlist_id: wishlist.id },
          fields: [
            "id",
            "product_id",
            "wishlist_id",
            "created_at",
            "updated_at",
            "deleted_at",
            "product_variant.*",
            "product_variant.prices.*",
            "product_variant.calculated_price",
            "product_variant.product.thumbnail",
          ],
          pagination: {
            take: options?.includeWishlistItemsTake || 5,
            skip: 0,
          },
        });

        return {
          ...wishlist,
          items: items.length > 0 ? items : [],
        };
      })
    );

    return res.status(200).json({
      data: enriched_wishlist,
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

  const wishlistService =
    req.scope.resolve<WishlistModuleService>(WISHLIST_MODULE);
  const options = wishlistService._options;

  if (!options.allowGuestWishlist && !customer_id) {
    throw new MedusaError(
      MedusaError.Types.UNAUTHORIZED,
      "Guest wishlists are now allowed"
    );
  }

  try {
    const wishlist = await wishlistService.createWishlists({
      ...input,
      ...(customer_id && { customer_id }),
    });

    return res.status(201).json(wishlist);
  } catch (error) {
    return res.status(500).end();
  }
}
