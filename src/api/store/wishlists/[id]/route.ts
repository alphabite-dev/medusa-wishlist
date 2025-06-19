import {
  AuthenticatedMedusaRequest,
  MedusaRequest,
  MedusaResponse,
} from "@medusajs/framework";
import { MedusaError, MedusaErrorTypes } from "@medusajs/framework/utils";
import WishlistModuleService from "../../../../modules/wishlist/service";
import { UpdateWishlistInput } from "../validators";
import { Wishlist } from "../types";
import { WISHLIST_MODULE } from "../../../../modules/wishlist";
import { RetrieveWishlistQuery } from "./validators";
import { defaultItemsFields } from "../../../../utils/utils";

//-----Retrieves a specific wishlist by ID-----//
export async function GET(
  req: AuthenticatedMedusaRequest<any, RetrieveWishlistQuery>,
  res: MedusaResponse<Wishlist>
) {
  const { id } = req.params;
  const customer_id = req?.auth_context?.actor_id;
  const { items_fields } = req.validatedQuery;

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
    const query = req.scope.resolve("query");

    const { data } = await query.graph({
      entity: "wishlist",
      filters: {
        id,
      },
      ...req.queryConfig,
      fields: ["*", ...(options?.wishlistFields || [])],
    });

    const wishlist = data?.[0];

    if (!wishlist) {
      throw new MedusaError(
        MedusaErrorTypes.NOT_FOUND,
        `Wishlist with ID ${id} not found`
      );
    }

    if (wishlist?.customer_id && wishlist?.customer_id !== customer_id) {
      throw new MedusaError(
        MedusaErrorTypes.UNAUTHORIZED,
        "You are not authorized to access this wishlist"
      );
    }

    const { data: items, metadata: items_metadata } = await query.graph({
      entity: "wishlist_item",
      filters: { wishlist_id: wishlist.id },
      fields: [
        ...defaultItemsFields,
        ...(options?.wishlistItemsFields || []),
        ...(items_fields || []),
      ],
      pagination: {
        take: options?.includeWishlistItemsTake || 5,
        skip: 0,
      },
    });

    return res
      .status(200)
      .json({ ...wishlist, items_count: items_metadata?.count, items });
  } catch (error) {
    console.log("Error fetching wishlists:", error);

    return res.status(500).end();
  }
}

export async function PUT(
  req: MedusaRequest<UpdateWishlistInput>,
  res: MedusaResponse<Omit<Wishlist, "items" | "items_count">>
) {
  const input = req.body;
  const { id } = req.params;

  try {
    const wishlistService =
      req.scope.resolve<WishlistModuleService>(WISHLIST_MODULE);

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

export async function DELETE(
  req: MedusaRequest,
  res: MedusaResponse<DeleteWishlistOutput>
) {
  const { id } = req.params;

  try {
    const wishlistService =
      req.scope.resolve<WishlistModuleService>(WISHLIST_MODULE);

    await wishlistService.deleteWishlists({ id });

    return res.status(200).json({
      id,
    });
  } catch (error) {
    console.log("Wishlist deleting failed.", error);

    return res.status(500).end();
  }
}
