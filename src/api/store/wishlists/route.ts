import {
  AuthenticatedMedusaRequest,
  MedusaRequest,
  MedusaResponse,
} from "@medusajs/framework";
import { defaultResponse } from "./[id]/items/default-response-values";
import WishlistModuleService from "../../../modules/wishlist/service";
import { CreateWishlistInputSchema } from "./validatiors";
import { PaginatedOutput, Wishlist } from "./types";

//-----List wishlists-----//
interface ListWishlistsOutput extends PaginatedOutput<Wishlist> {}

export async function GET(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse<ListWishlistsOutput>
) {
  const query = req.scope.resolve("query");
  const customer_id = req.auth_context.actor_id;

  if (!customer_id) {
    throw new Error("customer_id is required for this query");
  }

  try {
    const { data, metadata } = await query.graph({
      entity: "wishlist",
      filters: {
        customer_id,
      },
      // fields: ["*", ...(req.queryConfig.fields || [])],
      fields: [
        "*",
        "items.*",
        "items.product.*",
        "items.product.variants.*",
        "items.product.variants.prices.*",
      ],
    });

    res.status(200).json({
      data,
      take: metadata?.take || 5,
      skip: metadata?.skip || 0,
      count: metadata?.count || 0,
      totalPages: Math.ceil((metadata?.count || 0) / (metadata?.take || 5)),
    });
  } catch (error) {
    console.log("Error fetching wishlists:", error);

    //@ts-ignore
    res.status(500).json(defaultResponse);
  }
}

//-----Create wishlists-----//
type CreateWishlistInput = Zod.infer<typeof CreateWishlistInputSchema>;

export async function POST(
  req: MedusaRequest<CreateWishlistInput>,
  res: MedusaResponse
) {
  const wishlistService = req.scope.resolve(
    "wishlist"
  ) as WishlistModuleService;
  const { ...input } = req.body;

  //@ts-ignore
  const sales_channel_id = req.publishable_key_context.sales_channel_ids[0];
  console.log("Sales channel ID:", sales_channel_id);

  const wishlist = await wishlistService.createWishlists({
    ...input,
    sales_channel_id,
  });

  console.log("Created wishlist:", wishlist);

  res.status(201).json(wishlist);

  try {
  } catch (error) {
    res.status(400).json();
  }
}
