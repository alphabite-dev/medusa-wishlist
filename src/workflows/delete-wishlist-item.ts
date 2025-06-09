import {
  createWorkflow,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk";
import { deleteWishlistItemStep } from "./steps/delete-wishlist-item";
import { useQueryGraphStep } from "@medusajs/medusa/core-flows";
import { validateItemInWishlistStep } from "./steps/validate-item-in-wishlist";
import { validateWishlistExistsStep } from "./steps/validate-wishlist-exists";

type DeleteWishlistItemWorkflowInput = {
  product_id: string;
  customer_id: string;
};

export const deleteWishlistItemWorkflow = createWorkflow(
  "delete-wishlist-item",
  (input: DeleteWishlistItemWorkflowInput) => {
    const { data: wishlists } = useQueryGraphStep({
      entity: "wishlist",
      fields: ["*", "items.*"],
      filters: {
        customer_id: input.customer_id,
      },
    }) as any;

    validateWishlistExistsStep({
      wishlists,
    });

    validateItemInWishlistStep({
      wishlist: wishlists[0],
      product_id: input.product_id,
    });

    deleteWishlistItemStep({
      customer_id: input.customer_id,
      product_id: input.product_id,
    });

    // refetch wishlist
    const { data: updatedWishlists } = useQueryGraphStep({
      entity: "wishlist",
      fields: ["*", "items.*", "items.product.*"],
      filters: {
        id: wishlists[0].id,
      },
    }).config({ name: "refetch-wishlist" }) as any;

    return new WorkflowResponse({
      wishlist: updatedWishlists[0],
    });
  }
);
