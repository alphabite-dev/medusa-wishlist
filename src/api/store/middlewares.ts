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
} from "./wishlists/validatiors";
import { AddItemToWishlistInputSchema } from "./wishlists/[id]/items/validators";

export default defineMiddlewares({
  routes: [
    //WISHLIST NEW ROUTES
    //----List wishlists-----//
    {
      matcher: "/store/wishlists",
      methods: ["GET"],
      middlewares: [
        authenticate("customer", ["session", "bearer"]),
        validateAndTransformQuery(createFindParams(), {
          defaults: [
            "items.*",
            "items.product.*",
            "items.product.variants.*",
            "items.product.variants.prices.*",
          ],
          isList: true,
        }),
      ],
    },
    //----Create wishlist-----//
    {
      matcher: "/store/wishlists",
      methods: ["POST"],
      middlewares: [validateAndTransformBody(CreateWishlistInputSchema)],
    },
    {
      matcher: "/store/wishlists/:id",
      methods: ["GET"],
      middlewares: [
        validateAndTransformQuery(createFindParams(), {
          defaults: [
            "items.*",
            "items.product.*",
            "items.product.variants.*",
            "items.product.variants.prices.*",
          ],
        }),
      ],
    },
    //----Update wishlist-----//
    {
      matcher: "/store/wishlists/:id",
      methods: ["PUT"],
      middlewares: [validateAndTransformBody(UpdateWishlistInputSchema)],
    },
    {
      matcher: "/store/wishlists/:id",
      methods: ["DELETE"],
    },
    {
      matcher: "/store/wishlists/:id/items",
      methods: ["GET"],
      middlewares: [
        authenticate("customer", ["session", "bearer"]),
        validateAndTransformQuery(createFindParams(), {
          defaults: [
            "id",
            "product_id",
            "wishlist_id",
            "created_at",
            "updated_at",
            "deleted_at",
            "product.*",
            "product.variants.*",
          ],
          isList: true,
        }),
      ],
    },
    {
      matcher: "/store/wishlists/:id/items",
      methods: ["POST"],
      middlewares: [
        validateAndTransformBody(AddItemToWishlistInputSchema),
        validateAndTransformQuery(createFindParams(), {
          defaults: [
            "id",
            "product_id",
            "wishlist_id",
            "created_at",
            "updated_at",
            "deleted_at",
            "product.*",
            "product.variants.*",
          ],
        }),
      ],
    },
    {
      matcher: "/store/wishlists/:id/transfer",
      methods: ["POST"],
      middlewares: [
        authenticate("customer", ["bearer"]),
        validateAndTransformQuery(createFindParams(), {}),
      ],
    },
    {
      matcher: "/store/wishlists/:id/items/:item_id",
      methods: ["DELETE"],
      middlewares: [authenticate("customer", ["session", "bearer"])],
    },
  ],
});
