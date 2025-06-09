import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk";
import WishlistModuleService from "../../modules/wishlist/service";
import { WISHLIST_MODULE } from "../../modules/wishlist";

type DeleteWishlistItemStepInput = {
  product_id: string;
  customer_id: string;
};

export const deleteWishlistItemStep = createStep(
  "delete-wishlist-item",
  async (
    { product_id, customer_id }: DeleteWishlistItemStepInput,
    { container }
  ) => {
    const wishlistModuleService: WishlistModuleService =
      container.resolve(WISHLIST_MODULE);

    const wishlist_item_id = await wishlistModuleService.getWishlistItemId(
      customer_id,
      product_id
    );

    await wishlistModuleService.softDeleteWishlistItems(wishlist_item_id);

    return new StepResponse(void 0, wishlist_item_id);
  },
  async (wishlistItemId, { container }) => {
    const wishlistModuleService: WishlistModuleService =
      container.resolve(WISHLIST_MODULE);

    await wishlistModuleService.restoreWishlistItems([wishlistItemId]);
  }
);
