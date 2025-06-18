import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework";
import WishlistModuleService from "../../../../modules/wishlist/service";
import { WISHLIST_MODULE } from "../../../../modules/wishlist";

//-----Get total wishlist items count for a customer-----/
export interface TotalItemsCountOutput {
  total_items_count: number;
}

export async function GET(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse<TotalItemsCountOutput>
) {
  const customer_id = req.auth_context.actor_id;
  const wishlistService =
    req.scope.resolve<WishlistModuleService>(WISHLIST_MODULE);
  const options = wishlistService._options;

  try {
    // const query = req.scope.resolve("query");

    // const total_test = await wishlistService.totalItemsCount(customer_id);

    // console.log("Total items count:", total_test);

    // const { data } = await query.graph({
    //   entity: "wishlist",
    //   filters: { customer_id },
    //   ...req.queryConfig,
    //   fields: [
    //     "*",
    //     ...(options?.wishlistFields || []),
    //     ...(options.includeWishlistItems ? req.queryConfig.fields : []),
    //   ],
    // });

    return res.status(200).json({
      total_items_count: 0,
    });
  } catch (error) {
    console.log("Error fetching wishlists:", error);

    return res.status(500).end();
  }
}
