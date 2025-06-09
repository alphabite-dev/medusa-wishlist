import { InferTypeOf } from "@medusajs/framework/types";
import { Wishlist } from "../../modules/wishlist/models/wishlist";
import { createStep } from "@medusajs/framework/workflows-sdk";
import {
  ContainerRegistrationKeys,
  MedusaError,
} from "@medusajs/framework/utils";
import type { Query } from "@medusajs/framework";

type ValidateProductWishlistStepInput = {
  product_id: string;
  sales_channel_id: string;
  wishlist: InferTypeOf<typeof Wishlist>;
};

export const validateProductWishlistStep = createStep(
  "validate-product-in-wishlist",
  async (
    {
      product_id,
      sales_channel_id,
      wishlist,
    }: ValidateProductWishlistStepInput,
    { container }
  ) => {
    const isInWishlist = wishlist.items?.some(
      (item) => item.product_id === product_id
    );

    if (isInWishlist) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Product is already in wishlist"
      );
    }

    const query = container.resolve(ContainerRegistrationKeys.QUERY);

    const { data } = await query.graph({
      entity: "product",
      fields: ["sales_channels.*"],
      filters: {
        id: product_id,
      },
    });

    const productInSalesChannel = data[0].sales_channels?.some(
      (sc) => sc?.id === sales_channel_id
    );

    if (!productInSalesChannel) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Product is not available in the specified sales channel"
      );
    }
  }
);
