import { MedusaError } from "@medusajs/framework/utils";

export type WishlistOwner = { id: string; customer_id: string | null };

/**
 * A wishlist is reachable by its owner, or by any caller holding the id while
 * it has no owner yet (guest lists). Everything else is a cross-account access.
 */
export const assertWishlistAccess = (
  wishlist: WishlistOwner | undefined,
  customer_id: string | undefined,
  action: string,
): WishlistOwner => {
  if (!wishlist) {
    throw new MedusaError(MedusaError.Types.NOT_FOUND, "Wishlist not found");
  }

  if (wishlist.customer_id && wishlist.customer_id !== customer_id) {
    throw new MedusaError(
      MedusaError.Types.UNAUTHORIZED,
      `You are not authorized to ${action} this wishlist`,
    );
  }

  return wishlist;
};
