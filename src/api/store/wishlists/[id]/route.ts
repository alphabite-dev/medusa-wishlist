import { MedusaRequest, MedusaResponse } from "@medusajs/framework";
import WishlistModuleService from "../../../../modules/wishlist/service";
import { UpdateWishlistInputSchema } from "../validatiors";
import { Wishlist, WishlistErrorOutput } from "../types";

//-----Retrieves a specific wishlist by ID-----//
export async function GET(
  req: MedusaRequest,
  res: MedusaResponse<Wishlist | WishlistErrorOutput>
) {
  const query = req.scope.resolve("query");
  const { id } = req.params;

  try {
    const { data } = await query.graph({
      entity: "wishlist",
      filters: {
        id,
      },
      fields: ["*", ...(req.queryConfig.fields || [])],
    });

    console.log("Fetched wishlist:", data[0]);

    res.status(200).json(data[0]);
  } catch (error) {
    console.log("Error fetching wishlists:", error);

    res.status(500).json({ message: "Wishlist not found" });
  }
}

//-----Update a specific wishlist by ID-----//
type UpdateWishlistInput = Zod.infer<typeof UpdateWishlistInputSchema>;

export async function PUT(
  req: MedusaRequest<UpdateWishlistInput>,
  res: MedusaResponse<Omit<Wishlist, "items"> | WishlistErrorOutput>
) {
  const input = req.body;
  const { id } = req.params;

  const wishlistService = req.scope.resolve(
    "wishlist"
  ) as WishlistModuleService;

  try {
    //Return only the updated entity
    const updated_wishlist = await wishlistService.updateWishlists({
      id,
      ...input,
    });

    res.status(200).json(updated_wishlist);
  } catch (error) {
    console.log("Transfer wishlists failed:", error);

    res.status(500).json();
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
  const wishlistService = req.scope.resolve(
    "wishlist"
  ) as WishlistModuleService;

  try {
    const response = await wishlistService.softDeleteWishlists({ id });
    console.log("Delete  wishlist response:", response);

    res.status(200).json({
      id,
    });
  } catch (error) {
    console.log("Wishlist deleting failed.", error);

    res.status(500);
  }
}
