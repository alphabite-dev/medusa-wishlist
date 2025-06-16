import {
  AuthenticatedMedusaRequest,
  MedusaRequest,
  MedusaResponse,
} from "@medusajs/framework";
import { defaultResponse } from "./default-response-values";
import WishlistModuleService from "../../../../../modules/wishlist/service";
import { AddItemToWishlistInputSchema } from "./validators";
import {
  PaginatedOutput,
  WishlistErrorOutput,
  WishlistItem,
} from "../../types";
import { WISHLIST_MODULE } from "../../../../../modules/wishlist";

//-----List wishlist items-----//
export interface ListWishlistItemsOutput
  extends PaginatedOutput<WishlistItem> {}

export const GET = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse<ListWishlistItemsOutput>
) => {
  const { id } = req.params;
  const customer_id = req.auth_context.actor_id;
  const query = req.scope.resolve("query");

  try {
    const { data: wishlist_items, metadata } = await query.graph({
      entity: "wishlist_item",
      filters: {
        wishlist_id: id,
        ...(customer_id && { customer_id }),
      },
      ...req.queryConfig,
    });

    if (!wishlist_items) {
      return res.status(404).json(defaultResponse);
    }

    res.status(200).json({
      data: wishlist_items,
      skip: metadata?.skip || 0,
      take: metadata?.take || 5,
      count: metadata?.count || 0,
      totalPages: Math.ceil((metadata?.count || 0) / (metadata?.take || 5)),
    });
  } catch (error) {
    console.log("Error fetching wishlist items:", error);

    res.status(500).json(defaultResponse);
  }
};

//-----Add item to wishlist-----//
type AddItemToWishlistInput = Zod.infer<typeof AddItemToWishlistInputSchema>;

export const POST = async (
  req: MedusaRequest<AddItemToWishlistInput>,
  res: MedusaResponse<WishlistItem | WishlistErrorOutput>
) => {
  const { product_id } = req.body;
  const { id } = req.params;
  const query = req.scope.resolve("query");
  const wishlistService =
    req.scope.resolve<WishlistModuleService>(WISHLIST_MODULE);

  try {
    //Add item to wishlist
    const created_item = await wishlistService.createWishlistItems({
      product_id,
      wishlist_id: id,
    });

    const { wishlist, ...wishlist_item } =
      await wishlistService.retrieveWishlistItem(created_item.id, {
        relations: [],
      });

    console.log("Added item to wishlist:", wishlist_item);

    //@ts-ignore
    res.status(201).json(wishlist_item);
  } catch (error) {
    console.log("Add item to wishlist failed", error);

    res.status(500).json({
      message: "Failed to add item to wishlist",
    });
  }
};
