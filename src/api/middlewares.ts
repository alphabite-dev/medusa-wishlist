import {
  defineMiddlewares,
  authenticate,
  validateAndTransformBody,
  validateAndTransformQuery,
} from "@medusajs/framework/http";
import { createFindParams } from "@medusajs/medusa/api/utils/validators";
import {
  CreateWishlistInputSchema,
  ListWishlistsQuerySchema,
  UpdateWishlistInputSchema,
} from "./store/wishlists/validators";
import { AddItemToWishlistInputSchema } from "./store/wishlists/[id]/add-item/validators";
import { TotalItemsCountInputSchema } from "./store/wishlists/total-items-count/validators";
import { RetrieveWishlistQuerySchema } from "./store/wishlists/[id]/validators";
import { defaultItemsFields } from "../utils/utils";

export default defineMiddlewares({
  routes: [
    //----List Wishlists-----//
    {
      matcher: "/store/wishlists",
      methods: ["GET"],
      middlewares: [
        authenticate("customer", ["bearer"]),
        validateAndTransformQuery(
          createFindParams().extend(ListWishlistsQuerySchema.shape),
          {
            isList: true,
          }
        ),
      ],
    },
    //----Total Items Count-----//
    {
      matcher: "/store/wishlists/total-items-count",
      methods: ["GET"],
      middlewares: [
        validateAndTransformQuery(TotalItemsCountInputSchema, {}),
        authenticate("customer", ["bearer"], {
          allowUnauthenticated: true,
          allowUnregistered: true,
        }),
      ],
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
        validateAndTransformQuery(
          createFindParams().extend(RetrieveWishlistQuerySchema.shape),
          {}
        ),
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
          defaults: defaultItemsFields,
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
          defaults: defaultItemsFields,
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
