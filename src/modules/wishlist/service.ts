import {
  MedusaContext,
  MedusaError,
  MedusaService,
} from "@medusajs/framework/utils";
import { Wishlist } from "./models/wishlist";
import { WishlistItem } from "./models/wishlist-item";
import { InjectManager } from "@medusajs/framework/utils";
import { Context } from "@medusajs/framework/types";
import { EntityManager } from "@mikro-orm/knex";
import z from "zod";

const optionsSchema = z.object({
  wishlistFields: z.array(z.string()).optional(),
  wishlistItemsFields: z.array(z.string()).optional(),
  includeWishlistItems: z.boolean().default(false),
  includeWishlistItemsTake: z.number().default(5),
  allowGuestWishlist: z.boolean().default(false),
});

export type AlphabiteWishlistPluginOptions = z.infer<typeof optionsSchema>;

export default class WishlistModuleService extends MedusaService({
  Wishlist,
  WishlistItem,
}) {
  public _options: AlphabiteWishlistPluginOptions;

  static validateOptions(
    _options: AlphabiteWishlistPluginOptions
  ): void | never {
    const parsed = optionsSchema.safeParse(_options);
    if (!parsed.success) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        `Invalid options provided for WishlistModuleService: ${parsed.error.message}`
      );
    }
  }

  constructor({}, options: AlphabiteWishlistPluginOptions) {
    super(...arguments);
    this._options = options || {};
  }

  @InjectManager()
  async getWishlistCountsOfProduct(
    productId: string,
    @MedusaContext() context: Context<EntityManager> = {}
  ): Promise<number> {
    return (
      (
        await context.manager
          ?.createQueryBuilder("wishlist_item", "wi")
          .select(["wi.wishlist_id"], true)
          .where("wi.product_id = ?", [productId])
          .execute()
      )?.length || 0
    );
  }

  @InjectManager()
  async totalItemsCount(
    {
      customer_id,
      wishlist_id,
    }: { customer_id?: string; wishlist_id?: string },

    @MedusaContext() context: Context<EntityManager> = {}
  ): Promise<number> {
    const wishlist_items_count = await context.manager?.count(WishlistItem, {
      wishlist: {
        ...(customer_id && { customer_id }),
        ...(wishlist_id &&
          !customer_id && { id: wishlist_id, customer_id: null }),
      },
    });

    return Number(wishlist_items_count || 0);
  }
}
