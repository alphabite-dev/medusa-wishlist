import {
  defineMiddlewares,
  authenticate,
  validateAndTransformBody,
  validateAndTransformQuery,
} from "@medusajs/framework/http";
import { createFindParams } from "@medusajs/medusa/api/utils/validators";
import {
  CreateWishlistInputSchema,
  UpdateWishlistInputSchema,
} from "./store/wishlists/validators";
import { AddItemToWishlistInputSchema } from "./store/wishlists/[id]/add-item/validators";

export default defineMiddlewares({
  routes: [
    //----List Wishlists-----//
    {
      matcher: "/store/wishlists",
      methods: ["GET"],
      middlewares: [
        authenticate("customer", ["bearer"]),
        validateAndTransformQuery(createFindParams(), {
          defaults: [],
          isList: true,
        }),
      ],
    },
    //----Total Items Count-----//
    {
      matcher: "/store/wishlists/total-items-count",
      methods: ["GET"],
      middlewares: [authenticate("customer", ["bearer"])],
    },
    //----Retrieve Wishlist-----//
    {
      matcher: "/store/wishlists/:id",
      methods: ["GET"],
      middlewares: [
        authenticate("customer", ["bearer"], {
          allowUnregistered: true,
          allowUnauthenticated: true,
        }),
        validateAndTransformQuery(createFindParams(), {
          defaults: [
            "items.*",
            "items.product_variant.*",
            "items.product_variant.prices.*",
            "items.product_variant.product.thumbnail",
            "items.product_variant.product.id",
          ],
        }),
      ],
    },
    //----Create wishlist-----//
    {
      matcher: "/store/wishlists",
      methods: ["POST"],
      middlewares: [
        authenticate("customer", ["bearer"], {
          allowUnregistered: true,
          allowUnauthenticated: true,
        }),
        validateAndTransformBody(CreateWishlistInputSchema),
      ],
    },
    //----Update wishlist-----//
    {
      matcher: "/store/wishlists/:id",
      methods: ["PUT"],
      middlewares: [
        authenticate("customer", ["bearer"]),
        validateAndTransformBody(UpdateWishlistInputSchema),
      ],
    },
    //----Delete wishlist-----//
    {
      matcher: "/store/wishlists/:id",
      methods: ["DELETE"],
      middlewares: [authenticate("customer", ["bearer"])],
    },
    //----Transfer wishlist-----//
    {
      matcher: "/store/wishlists/:id/transfer",
      methods: ["POST"],
      middlewares: [authenticate("customer", ["bearer"])],
    },
    //----List Wishlist Items-----//
    {
      matcher: "/store/wishlists/:id/items",
      methods: ["GET"],
      middlewares: [
        authenticate("customer", ["bearer"], {
          allowUnregistered: true,
          allowUnauthenticated: true,
        }),
        validateAndTransformQuery(createFindParams(), {
          defaults: [
            "id",
            "product_id",
            "wishlist_id",
            "created_at",
            "wishlist.customer_id",
            "updated_at",
            "deleted_at",
            "product_variant.*",
            "product_variant.prices.*",
            "product_variant.calculated_price",
            "product_variant.product.thumbnail",
          ],
          isList: true,
        }),
      ],
    },
    //----Add item to wishlist-----//
    {
      matcher: "/store/wishlists/:id/add-item",
      methods: ["POST"],
      middlewares: [
        authenticate("customer", ["bearer"], {
          allowUnregistered: true,
          allowUnauthenticated: true,
        }),
        validateAndTransformBody(AddItemToWishlistInputSchema),
        validateAndTransformQuery(createFindParams(), {
          defaults: [
            "id",
            "product_variant_id",
            "wishlist_id",
            "created_at",
            "updated_at",
            "deleted_at",
            "product_variant.*",
            "product_variant.prices.*",
            "product_variant.calculated_price",
            "product_variant.product.thumbnail",
            "product_variant.product.id",
          ],
        }),
      ],
    },
    //----Remove item from wishlist-----//
    {
      matcher: "/store/wishlists/:id/remove-item/:item_id",
      methods: ["DELETE"],
      middlewares: [
        authenticate("customer", ["bearer"], {
          allowUnregistered: true,
          allowUnauthenticated: true,
        }),
      ],
    },
  ],
});
