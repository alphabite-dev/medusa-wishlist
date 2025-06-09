import { MedusaContext, MedusaService } from "@medusajs/framework/utils";
import { Wishlist } from "./models/wishlist";
import { WishlistItem } from "./models/wishlist-item";
import { InjectManager } from "@medusajs/framework/utils";
import { Context } from "@medusajs/framework/types";
import { EntityManager } from "@mikro-orm/knex";

export default class WishlistModuleService extends MedusaService({
  Wishlist,
  WishlistItem,
}) {
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
