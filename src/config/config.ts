import { Client } from "@medusajs/js-sdk";
import { WishlistOutput } from "../types/wishlist";

type WishlistEndpoints = {
  list: () => Promise<WishlistOutput>;
  add: (productId: string) => Promise<WishlistOutput>;
  remove: (productId: string) => Promise<WishlistOutput>;
};
// Plugin definition
type Plugin<Name extends string, Endpoints> = {
  name: Name;
  endpoints: (client: Client, options?: AlphabiteClientOptions) => Endpoints;
};

export const wishlistPlugin: Plugin<"wishlist", WishlistEndpoints> = {
  name: "wishlist" as const,
  endpoints: (client: Client, options?: AlphabiteClientOptions) => ({
    list: async () =>
      client.fetch("/store/customers/me/wishlists", {
        method: "GET",
        headers: { ...(await options?.getAuthHeader?.()) },
      }),
    add: async (productId: string) =>
      client.fetch("/store/customers/me/wishlists/items", {
        method: "POST",
        body: JSON.stringify({ product_id: productId }),
        headers: { ...(await options?.getAuthHeader?.()) },
      }),
    remove: async (productId: string) =>
      client.fetch(`/store/customers/me/wishlists/items/${productId}`, {
        method: "DELETE",
        headers: { ...(await options?.getAuthHeader?.()) },
      }),
  }),
};

export type AlphabiteClientOptions = {
  getAuthHeader?: () =>
    | Promise<Record<string, string>>
    | Record<string, string>;
};
