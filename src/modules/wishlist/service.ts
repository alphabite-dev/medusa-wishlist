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
  fields: z.array(z.string()).optional(),
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
  async getWishlistsOfProducts(
    productIds: string[],
    @MedusaContext() context: Context<EntityManager> = {}
  ) {
    return await context.manager
      ?.createQueryBuilder("wishlist_item", "wi")
      .where("wi.product_id IN (?)", [productIds])
      .execute();
  }

  @InjectManager()
  async getWishlistItemId(
    customerId: string,
    productId: string,
    @MedusaContext() context: Context<EntityManager> = {}
  ): Promise<string> {
    const wishlist: any = await context.manager
      ?.createQueryBuilder("wishlist", "w")
      .select(["w.id"])
      .where("w.customer_id = ?", [customerId])
      .execute();

    if (!wishlist?.[0]?.id) {
      throw new Error("Wishlist not found");
    }

    const wishlistId = wishlist[0].id;

    const wishlistItem: any = await context.manager
      ?.createQueryBuilder("wishlist_item", "wi")
      .select(["wi.id"])
      .where("wi.wishlist_id = ?", [wishlistId])
      .andWhere("wi.product_id = ?", [productId])
      .andWhere("wi.deleted_at IS NULL")
      .execute();

    if (!wishlistItem?.[0]?.id) {
      throw new Error("Wishlist item not found");
    }

    return wishlistItem[0].id;
  }
}
