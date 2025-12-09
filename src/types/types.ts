import { type AlphabiteWishlistPluginOptions } from "../modules/wishlist/service";
import { type Wishlist, type WishlistItem } from "../api/store/wishlists/types";
import {
  type CreateWishlistInput,
  type CreateWishlistInputSchema,
  type ListWishlistsQuery,
  type UpdateWishlistInput,
} from "../api/store/wishlists/validators";

import { type TotalItemsCountInput } from "../api/store/wishlists/total-items-count/validators";
import { type ImportWishlistInput } from "../api/store/wishlists/import/validators";
import { type RetrieveWishlistQuery } from "../api/store/wishlists/[id]/validators";
import { type AddItemToWishlistInput } from "../api/store/wishlists/[id]/add-item/validators";

export type {
  AlphabiteWishlistPluginOptions,
  Wishlist,
  WishlistItem,
  CreateWishlistInput,
  CreateWishlistInputSchema,
  ListWishlistsQuery,
  UpdateWishlistInput,
  TotalItemsCountInput,
  ImportWishlistInput,
  RetrieveWishlistQuery,
  AddItemToWishlistInput,
};
