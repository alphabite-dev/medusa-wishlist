import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework";
import WishlistModuleService from "../../../../modules/wishlist/service";
import { WISHLIST_MODULE } from "../../../../modules/wishlist";
import { TotalItemsCountInput } from "./validators";

//-----Get total wishlist items count for a customer-----/
export interface TotalItemsCountOutput {
  total_items_count: number;
}

export async function GET(
  req: AuthenticatedMedusaRequest<any, TotalItemsCountInput>,
  res: MedusaResponse<TotalItemsCountOutput>
) {
  const { wishlist_id } = req.validatedQuery;

  const customer_id = req?.auth_context?.actor_id;

  if (!wishlist_id && !customer_id) {
    return res.status(200).json({
      total_items_count: 0,
    });
  }

  const wishlistService =
    req.scope.resolve<WishlistModuleService>(WISHLIST_MODULE);

  try {
    const count = await wishlistService.totalItemsCount({
      customer_id,
      wishlist_id,
    });

    return res.status(200).json({
      total_items_count: count,
    });
  } catch (error) {
    console.log("Error fetching wishlists:", error);

    return res.status(500).end();
  }
}
