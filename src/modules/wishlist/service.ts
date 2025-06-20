import { MedusaContext, MedusaError, MedusaService } from "@medusajs/framework/utils";
import { Wishlist } from "./models/wishlist";
import { WishlistItem } from "./models/wishlist-item";
import { InjectManager } from "@medusajs/framework/utils";
import { Context } from "@medusajs/framework/types";
import { EntityManager } from "@mikro-orm/knex";
import jwt from "jsonwebtoken";
import z from "zod";
import { Wishlist as WishlistType } from "../../api/store/wishlists/types";
import { Logger } from "@medusajs/medusa";

const optionsSchema = z.object({
  wishlistFields: z.array(z.string()).optional(),
  wishlistItemsFields: z.array(z.string()).optional(),
  includeWishlistItems: z.boolean().default(false),
  includeWishlistItemsTake: z.number().default(5),
  allowGuestWishlist: z.boolean().default(false),
  shareTokenSecret: z.string().default("default_secret"),
});

export type AlphabiteWishlistPluginOptions = z.infer<typeof optionsSchema>;

export default class WishlistModuleService extends MedusaService({
  Wishlist,
  WishlistItem,
}) {
  public _options: AlphabiteWishlistPluginOptions;

  static validateOptions(_options: AlphabiteWishlistPluginOptions): void | never {
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
    { customer_id, wishlist_id }: { customer_id?: string; wishlist_id?: string },
    @MedusaContext() context: Context<EntityManager> = {}
  ): Promise<number> {
    const wishlist_items_count = await context.manager?.count(WishlistItem, {
      wishlist: {
        ...(customer_id && { customer_id }),
        ...(wishlist_id && !customer_id && { id: wishlist_id, customer_id: null }),
      },
    });

    return Number(wishlist_items_count || 0);
  }

  async createShareToken({ wishlist_id }: { wishlist_id: string }): Promise<string> {
    const shareToken = jwt.sign({ wishlist_id }, this._options.shareTokenSecret, { expiresIn: "7d" });

    return shareToken;
  }

  async validateToken(shareToken: string): Promise<{ wishlist_id: string } | null> {
    const decoded = jwt.verify(shareToken, this._options.shareTokenSecret);

    return decoded as { wishlist_id: string };
  }

  async importWishlist({ id, customer_id }: { id: string; customer_id?: string }): Promise<WishlistType> {
    const wishlist = await this.retrieveWishlist(id, { relations: ["items"] });

    if (!wishlist) {
      throw new MedusaError(MedusaError.Types.NOT_FOUND, `Wishlist with ID ${id} not found`);
    }

    const newWishlist = await this.createWishlists({
      ...(customer_id && { customer_id }),
      sales_channel_id: wishlist.sales_channel_id,
      name: wishlist.name,
    });

    if (!newWishlist) {
      throw new MedusaError(MedusaError.Types.INVALID_DATA, `Failed to create new wishlist for import`);
    }

    await Promise.all(
      wishlist.items.map(async (item) => {
        return this.createWishlistItems({
          product_variant_id: item.product_variant_id,
          wishlist_id: newWishlist.id,
        });
      })
    );

    return { ...newWishlist, items_count: wishlist.items.length, items: [] };
  }
}
