import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework";
import { CreateWishlistInput, ListWishlistsQuery } from "./validators";
import { PaginatedOutput, Wishlist } from "./types";
import WishlistModuleService from "../../../modules/wishlist/service";
import { WISHLIST_MODULE } from "../../../modules/wishlist";
import { defaultItemsFields, getPagination } from "../../../utils/utils";
import { MedusaError, promiseAll } from "@medusajs/framework/utils";

export async function GET(
  req: AuthenticatedMedusaRequest<any, ListWishlistsQuery>,
  res: MedusaResponse<PaginatedOutput<Wishlist>>
) {
  const logger = req.scope.resolve("logger");

  const customer_id = req.auth_context.actor_id;
  const wishlistService = req.scope.resolve<WishlistModuleService>(WISHLIST_MODULE);
  const options = wishlistService._options;
  const { items_fields } = req.validatedQuery;

  try {
    const query = req.scope.resolve("query");

    const { data, metadata } = await query.graph({
      entity: "wishlist",
      filters: { customer_id },
      ...req.queryConfig,
      fields: ["*", ...(options?.wishlistFields || []), ...req.queryConfig.fields],
    });

    const wishlists: Wishlist[] = options.includeWishlistItems
      ? await Promise.all(
          data.map(async (wishlist) => {
            const { data: items, metadata } = await query.graph({
              entity: "wishlist_item",
              filters: { wishlist_id: wishlist.id },
              fields: [...defaultItemsFields, ...(items_fields || [])],
              pagination: {
                take: options?.includeWishlistItemsTake || 5,
                skip: 0,
              },
            });

            return {
              ...wishlist,
              items: items.length > 0 ? items : [],
              items_count: metadata?.count,
            };
          })
        )
      : data;

    return res.status(200).json({
      data: wishlists,
      take: metadata?.take || 5,
      skip: metadata?.skip || 0,
      ...getPagination(metadata),
    });
  } catch (error) {
    logger.error("Error fetching wishlists:", error);

    return res.status(500).end();
  }
}

//-----Create wishlists-----//

export async function POST(req: AuthenticatedMedusaRequest<CreateWishlistInput>, res: MedusaResponse<Wishlist>) {
  const logger = req.scope.resolve("logger");

  const customer_id = req?.auth_context?.actor_id;
  const { ...input } = req.body;

  const wishlistService = req.scope.resolve<WishlistModuleService>(WISHLIST_MODULE);
  const options = wishlistService._options;

  if (!options.allowGuestWishlist && !customer_id) {
    throw new MedusaError(MedusaError.Types.UNAUTHORIZED, "Guest wishlists are now allowed");
  }

  try {
    const wishlist = await wishlistService.createWishlists({
      ...input,
      ...(customer_id && { customer_id }),
    });

    return res.status(201).json({ ...wishlist, items_count: 0, items: [] });
  } catch (error) {
    logger.error("Error creating wishlist:", error);

    return res.status(500).end();
  }
}
