import { AuthenticatedMedusaRequest, MedusaRequest, MedusaResponse } from "@medusajs/framework";
import {
  getVariantAvailability,
  MedusaError,
  QueryContext,
  VariantAvailabilityResult,
} from "@medusajs/framework/utils";
import WishlistModuleService from "../../../../modules/wishlist/service";
import { UpdateWishlistInput } from "../validators";
import { Wishlist } from "../types";
import { WISHLIST_MODULE } from "../../../../modules/wishlist";
import { RetrieveWishlistQuery } from "./validators";
import { defaultFields, defaultItemsFields } from "../../../../utils/utils";
import { WishlistItem } from "../../../../modules/wishlist/models/wishlist-item";
import { CalculatedPriceSet, ProductVariantDTO } from "@medusajs/framework/types";

//-----Retrieves a specific wishlist by ID-----//
export async function GET(req: AuthenticatedMedusaRequest<any, RetrieveWishlistQuery>, res: MedusaResponse<Wishlist>) {
  const logger = req.scope.resolve("logger");

  const { id } = req.params;
  const customer_id = req?.auth_context?.actor_id;
  const { items_fields, include_calculated_price, include_inventory_count } = req.validatedQuery;

  const wishlistService = req.scope.resolve<WishlistModuleService>(WISHLIST_MODULE);
  const options = wishlistService._options;

  if (!options.allowGuestWishlist && !customer_id) {
    throw new MedusaError(MedusaError.Types.UNAUTHORIZED, "Guest wishlists are now allowed");
  }

  try {
    const query = req.scope.resolve("query");

    const { data } = await query.graph({
      entity: "wishlist",
      filters: {
        id,
      },
      ...req.queryConfig,
      fields: [...defaultFields, ...(req.queryConfig?.fields || []), ...(options?.wishlistFields || [])],
    });

    const wishlist = data?.[0];

    if (!wishlist) {
      throw new MedusaError(MedusaError.Types.NOT_FOUND, `Wishlist with ID ${id} not found`);
    }

    if (wishlist?.customer_id && wishlist?.customer_id !== customer_id) {
      throw new MedusaError(MedusaError.Types.UNAUTHORIZED, "You are not authorized to access this wishlist");
    }

    const { data: items, metadata: items_metadata } = await query.graph({
      entity: "wishlist_item",
      filters: { wishlist_id: wishlist.id },
      fields: [...defaultItemsFields, ...(options?.wishlistItemsFields || []), ...(items_fields || [])],
      pagination: {
        take: options?.includeWishlistItemsTake || 5,
        skip: 0,
      },
    });

    let variantsAvailability: VariantAvailabilityResult = {};

    if (include_inventory_count) {
      variantsAvailability = await getVariantAvailability(query, {
        sales_channel_id: wishlist.sales_channel_id,
        variant_ids: items.map((i) => i.product_variant_id),
      });
    }

    let variantsPrices: Record<string, CalculatedPriceSet> = {};

    if (include_calculated_price) {
      for (const item of items as (WishlistItem & { product_variant: ProductVariantDTO })[]) {
        const { data: products } = await query.graph({
          entity: "product",
          fields: ["id", "variants.id", "variants.calculated_price.*"],
          // narrow to a product that contains your variant
          filters: {
            variants: {
              id: item.product_variant_id,
            },
          },
          context: {
            variants: {
              calculated_price: QueryContext({
                region_id: "reg_01J3MRPDNXXXDSCC76Y6YCZARS",
                currency_code: "eur",
              }),
            },
          },
        });

        products.map((product) => {
          product.variants.map((variant: any) => {
            variantsPrices[variant.id] = variant.calculated_price;
          });
        });
      }
    }

    const enrichedItems = items.map(
      (
        item: WishlistItem & {
          product_variant: ProductVariantDTO & {
            calculated_price: CalculatedPriceSet | null;
            availability: number | null;
          };
        }
      ) => {
        const availability = variantsAvailability[item.product_variant_id]?.availability;
        const calculated_price = variantsPrices[item.product_variant_id];

        let enrichedItem = { ...item };

        if (include_inventory_count) {
          enrichedItem.product_variant.availability = availability || null;
        }

        if (include_calculated_price) {
          item.product_variant.calculated_price = calculated_price || null;
        }

        return {
          ...item,
          product_variant: {
            ...item.product_variant,
            availability,
            calculated_price,
          },
        };
      }
    );

    return res.status(200).json({ ...wishlist, items_count: items_metadata?.count, items: enrichedItems });
  } catch (error) {
    logger.error("Error fetching wishlists:", error);

    return res.status(500).end();
  }
}

export async function PUT(
  req: MedusaRequest<UpdateWishlistInput>,
  res: MedusaResponse<Omit<Wishlist, "items" | "items_count">>
) {
  const logger = req.scope.resolve("logger");

  const input = req.body;
  const { id } = req.params;

  try {
    const wishlistService = req.scope.resolve<WishlistModuleService>(WISHLIST_MODULE);

    const updated_wishlist = await wishlistService.updateWishlists({
      id,
      ...input,
    });

    return res.status(200).json(updated_wishlist);
  } catch (error) {
    logger.error("Update wishlists failed:", error);

    return res.status(500).end();
  }
}

//-----Delete a specific wishlist by ID-----//
export interface DeleteWishlistOutput {
  id: string;
}

export async function DELETE(req: MedusaRequest, res: MedusaResponse<DeleteWishlistOutput>) {
  const logger = req.scope.resolve("logger");

  const { id } = req.params;

  try {
    const wishlistService = req.scope.resolve<WishlistModuleService>(WISHLIST_MODULE);

    await wishlistService.deleteWishlists({ id });

    return res.status(200).json({
      id,
    });
  } catch (error) {
    logger.error("Wishlist deleting failed.", error);

    return res.status(500).end();
  }
}
