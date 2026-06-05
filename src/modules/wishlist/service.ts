import {
  MedusaContext,
  MedusaError,
  MedusaService,
} from "@medusajs/framework/utils";
import { Wishlist } from "./models/wishlist";
import { WishlistItem } from "./models/wishlist-item";
import { WishlistSettings } from "./models/wishlist-settings";
import { InjectManager } from "@medusajs/framework/utils";
import { Context } from "@medusajs/framework/types";
import { EntityManager } from "@mikro-orm/knex";
import type { Knex } from "knex";
import jwt from "jsonwebtoken";
import { z } from "@medusajs/framework/zod";
import { Wishlist as WishlistType } from "../../api/store/wishlists/types";
import type {
  WishlistSettingsView,
  WishlistSettingsPatch,
} from "./types/settings";
import type {
  WishlistAnalyticsParams,
  WishlistAnalyticsView,
  Delta,
} from "./types/analytics";
import { pickTrendBucket, trendBuckets, TREND_SQL_FORMAT } from "./trend";

const WISHLIST_SETTINGS_SINGLETON_ID = "wls_singleton";

/**
 * Options for configuring the Alphabite Wishlist Plugin
 */
export type AlphabiteWishlistPluginOptions = {
  /**
   * List of fields to retrieve when fetching a wishlist.
   * Example: ['id', 'name', 'createdAt']
   */
  wishlistFields?: string[];

  /**
   * List of fields to retrieve for each wishlist item.
   * Example: ['id', 'name', 'price']
   */
  wishlistItemsFields?: string[];

  /**
   * Whether to include wishlist items when fetching a wishlist.
   * Default: false
   */
  includeWishlistItems?: boolean;

  /**
   * Number of wishlist items to include when `includeWishlistItems` is true.
   * Default: 5
   */
  includeWishlistItemsTake?: number;

  /**
   * Whether guests (non-logged-in users) can have a wishlist.
   * Default: false
   */
  allowGuestWishlist?: boolean;

  /**
   * Secret used for generating share tokens for wishlists.
   * Default: 'default_secret'
   */
  shareTokenSecret?: string;
};

const optionsSchema = z.object({
  wishlistFields: z.array(z.string()).optional(),
  wishlistItemsFields: z.array(z.string()).optional(),
  includeWishlistItems: z.boolean().default(false),
  includeWishlistItemsTake: z.number().default(5),
  allowGuestWishlist: z.boolean().default(false),
  shareTokenSecret: z.string().default("default_secret"),
});

export type AlphabiteWishlistPluginOptionsType = z.infer<typeof optionsSchema>;

export default class WishlistModuleService extends MedusaService({
  Wishlist,
  WishlistItem,
  WishlistSettings,
}) {
  public _options: AlphabiteWishlistPluginOptionsType;

  static validateOptions(
    _options: AlphabiteWishlistPluginOptionsType,
  ): void | never {
    const parsed = optionsSchema.safeParse(_options);
    if (!parsed.success) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        `Invalid options provided for WishlistModuleService: ${parsed.error.message}`,
      );
    }
  }

  constructor({}, options: AlphabiteWishlistPluginOptionsType) {
    super(...arguments);
    this._options = options || {};
  }

  @InjectManager()
  async getWishlistCountsOfProduct(
    productId: string,
    @MedusaContext() context: Context<EntityManager> = {},
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
  async getAnalytics(
    params: WishlistAnalyticsParams = {},
    @MedusaContext() context: Context<EntityManager> = {},
  ): Promise<WishlistAnalyticsView> {
    const knex = context.manager!.getConnection().getKnex();
    const scopeItemsToChannel = <T extends Knex.QueryBuilder>(qb: T): T => {
      if (channelId) {
        qb.join("wishlist as w", "w.id", "wi.wishlist_id").where(
          "w.sales_channel_id",
          channelId,
        );
      }
      return qb;
    };
    const n = (v: unknown): number => Number(v ?? 0);

    const DAY_MS = 24 * 60 * 60 * 1000;
    const to = params.to ? new Date(params.to) : new Date();
    const from = params.from
      ? new Date(params.from)
      : new Date(to.getTime() - 30 * DAY_MS);
    const periodMs = to.getTime() - from.getTime();
    const prevFrom = new Date(from.getTime() - periodMs);
    const prevTo = from;

    const channelId = params.sales_channel_id;
    const bucket = pickTrendBucket(periodMs);

    const mkDelta = (value: number, previous: number): Delta => ({
      value,
      previous,
      delta_pct:
        previous === 0
          ? value > 0
            ? 100
            : 0
          : Math.round(((value - previous) / previous) * 1000) / 10,
    });

    const countWishlists = async (lo: Date, hi: Date): Promise<number> => {
      const qb = knex("wishlist")
        .where("created_at", ">=", lo)
        .andWhere("created_at", "<", hi);
      if (channelId) qb.where("sales_channel_id", channelId);
      const row = await qb.count<{ c: string }[]>("* as c");
      return n(row[0]?.c);
    };

    const countItems = async (lo: Date, hi: Date): Promise<number> => {
      const qb = scopeItemsToChannel(
        knex("wishlist_item as wi")
          .where("wi.created_at", ">=", lo)
          .andWhere("wi.created_at", "<", hi),
      );
      const row = await qb.count<{ c: string }[]>("* as c");
      return n(row[0]?.c);
    };

    const countUniqueCustomers = async (lo: Date, hi: Date): Promise<number> => {
      const qb = knex("wishlist")
        .where("created_at", ">=", lo)
        .andWhere("created_at", "<", hi)
        .whereNotNull("customer_id");
      if (channelId) qb.where("sales_channel_id", channelId);
      const row = await qb.countDistinct<{ c: string }[]>("customer_id as c");
      return n(row[0]?.c);
    };

    const [
      totalWishlists,
      prevTotalWishlists,
      totalItems,
      prevTotalItems,
      uniqueCustomers,
      prevUniqueCustomers,
    ] = await Promise.all([
      countWishlists(from, to),
      countWishlists(prevFrom, prevTo),
      countItems(from, to),
      countItems(prevFrom, prevTo),
      countUniqueCustomers(from, to),
      countUniqueCustomers(prevFrom, prevTo),
    ]);

    const activeQb = knex("wishlist as w")
      .where("w.created_at", ">=", from)
      .andWhere("w.created_at", "<", to)
      .whereExists(function () {
        this.select(knex.raw("1"))
          .from("wishlist_item as wi")
          .where("wi.wishlist_id", knex.ref("w.id"));
      });
    if (channelId) activeQb.where("w.sales_channel_id", channelId);
    const activeWishlists = n(
      (await activeQb.count<{ c: string }[]>("* as c"))[0]?.c,
    );
    const emptyWishlists = totalWishlists - activeWishlists;

    const guestQb = knex("wishlist")
      .where("created_at", ">=", from)
      .andWhere("created_at", "<", to)
      .whereNull("customer_id");
    if (channelId) guestQb.where("sales_channel_id", channelId);
    const guestWishlists = n(
      (await guestQb.count<{ c: string }[]>("* as c"))[0]?.c,
    );
    const registeredWishlists = totalWishlists - guestWishlists;

    const wishlistTrendQb = knex("wishlist")
      .where("created_at", ">=", from)
      .andWhere("created_at", "<", to)
      .select(
        // Truncate in UTC so the bucket label doesn't depend on the DB session
        // timezone (it must match the JS zero-fill in `trendBuckets`).
        knex.raw(
          "to_char(date_trunc(?, created_at at time zone 'UTC'), ?) as date",
          [bucket, TREND_SQL_FORMAT[bucket]],
        ),
      )
      .count("* as count")
      // Group/order by the SELECT ordinal: repeating date_trunc(?, ...) here
      // would bind a *separate* parameter, which Postgres does not treat as the
      // same expression as the one in SELECT ("must appear in GROUP BY").
      .groupByRaw("1")
      .orderByRaw("1");
    if (channelId) wishlistTrendQb.where("sales_channel_id", channelId);

    const itemTrendQb = scopeItemsToChannel(
      knex("wishlist_item as wi")
        .where("wi.created_at", ">=", from)
        .andWhere("wi.created_at", "<", to)
        .select(
          knex.raw(
            "to_char(date_trunc(?, wi.created_at at time zone 'UTC'), ?) as date",
            [bucket, TREND_SQL_FORMAT[bucket]],
          ),
        )
        .count("* as count")
        .groupByRaw("1")
        .orderByRaw("1"),
    );

    const [wishlistTrendRows, itemTrendRows] = (await Promise.all([
      wishlistTrendQb,
      itemTrendQb,
    ])) as [
      { date: string; count: string }[],
      { date: string; count: string }[],
    ];

    const trendMap = new Map<string, { wishlists: number; items: number }>();
    for (const r of wishlistTrendRows) {
      trendMap.set(r.date, { wishlists: n(r.count), items: 0 });
    }
    for (const r of itemTrendRows) {
      const e = trendMap.get(r.date) ?? { wishlists: 0, items: 0 };
      e.items = n(r.count);
      trendMap.set(r.date, e);
    }
    // Zero-fill so the chart shows every bucket, not just buckets with activity.
    const trend = trendBuckets(from, to, bucket).map((date) => {
      const v = trendMap.get(date);
      return { date, wishlists: v?.wishlists ?? 0, items: v?.items ?? 0 };
    });

    const topProductsQb = scopeItemsToChannel(
      knex("wishlist_item as wi")
        .where("wi.created_at", ">=", from)
        .andWhere("wi.created_at", "<", to),
    );
    const topProductsRows = (await topProductsQb
      .select("wi.product_id")
      .countDistinct("wi.wishlist_id as wishlist_count")
      .count("* as item_count")
      .groupBy("wi.product_id")
      .orderBy("wishlist_count", "desc")
      .limit(10)) as {
      product_id: string;
      wishlist_count: string;
      item_count: string;
    }[];

    const topVariantsQb = scopeItemsToChannel(
      knex("wishlist_item as wi")
        .where("wi.created_at", ">=", from)
        .andWhere("wi.created_at", "<", to),
    );
    const topVariantsRows = (await topVariantsQb
      .select("wi.product_variant_id", "wi.product_id")
      .countDistinct("wi.wishlist_id as wishlist_count")
      .groupBy("wi.product_variant_id", "wi.product_id")
      .orderBy("wishlist_count", "desc")
      .limit(10)) as {
      product_variant_id: string;
      product_id: string;
      wishlist_count: string;
    }[];

    const avgCurrent = totalWishlists ? totalItems / totalWishlists : 0;
    const avgPrev = prevTotalWishlists
      ? prevTotalItems / prevTotalWishlists
      : 0;

    return {
      range: { from: from.toISOString(), to: to.toISOString() },
      kpis: {
        total_wishlists: mkDelta(totalWishlists, prevTotalWishlists),
        total_items: mkDelta(totalItems, prevTotalItems),
        avg_items_per_wishlist: mkDelta(
          Math.round(avgCurrent * 100) / 100,
          Math.round(avgPrev * 100) / 100,
        ),
        active_wishlists: activeWishlists,
        empty_wishlists: emptyWishlists,
        guest_wishlists: guestWishlists,
        registered_wishlists: registeredWishlists,
        unique_customers: mkDelta(uniqueCustomers, prevUniqueCustomers),
      },
      trend,
      top_products: topProductsRows.map((r) => ({
        product_id: r.product_id,
        wishlist_count: n(r.wishlist_count),
        item_count: n(r.item_count),
      })),
      top_variants: topVariantsRows.map((r) => ({
        product_variant_id: r.product_variant_id,
        product_id: r.product_id,
        wishlist_count: n(r.wishlist_count),
      })),
    };
  }

  @InjectManager()
  async totalItemsCount(
    {
      customer_id,
      wishlist_id,
    }: { customer_id?: string; wishlist_id?: string },
    @MedusaContext() context: Context<EntityManager> = {},
  ): Promise<number> {
    const wishlist_items_count = await context.manager?.count(WishlistItem, {
      wishlist: {
        ...(customer_id && { customer_id }),
        ...(wishlist_id && { id: wishlist_id }),
        ...(wishlist_id && !customer_id && { customer_id: null }),
      },
    });

    return Number(wishlist_items_count || 0);
  }

  async createShareToken({
    wishlist_id,
  }: {
    wishlist_id: string;
  }): Promise<string> {
    const shareToken = jwt.sign(
      { wishlist_id },
      this._options.shareTokenSecret,
      { expiresIn: "7d" },
    );

    return shareToken;
  }

  async validateToken(
    shareToken: string,
  ): Promise<{ wishlist_id: string } | null> {
    const decoded = jwt.verify(shareToken, this._options.shareTokenSecret);

    return decoded as { wishlist_id: string };
  }

  async importWishlist({
    id,
    customer_id,
  }: {
    id: string;
    customer_id?: string;
  }): Promise<WishlistType> {
    const wishlist = await this.retrieveWishlist(id, { relations: ["items"] });

    if (!wishlist) {
      throw new MedusaError(
        MedusaError.Types.NOT_FOUND,
        `Wishlist with ID ${id} not found`,
      );
    }

    const newWishlist = await this.createWishlists({
      ...(customer_id && { customer_id }),
      sales_channel_id: wishlist.sales_channel_id,
      name: wishlist.name,
    });

    if (!newWishlist) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        `Failed to create new wishlist for import`,
      );
    }

    await Promise.all(
      wishlist.items.map(async (item) => {
        return this.createWishlistItems({
          product_variant_id: item.product_variant_id,
          product_id: item.product_id,
          wishlist_id: newWishlist.id,
        });
      }),
    );

    return { ...newWishlist, items_count: wishlist.items.length, items: [] };
  }

  async getSettings(): Promise<WishlistSettingsView> {
    const rows = await this.listWishlistSettings(
      { id: WISHLIST_SETTINGS_SINGLETON_ID },
      { take: 1 },
    );
    const row = rows[0];

    if (!row) {
      return {
        allow_guest_wishlist: this._options?.allowGuestWishlist ?? false,
        allow_multiple_wishlists: false,
      };
    }

    return {
      allow_guest_wishlist: row.allow_guest_wishlist,
      allow_multiple_wishlists: row.allow_multiple_wishlists,
    };
  }

  async updateSettings(
    patch: WishlistSettingsPatch,
  ): Promise<WishlistSettingsView> {
    const writePatch: Record<string, boolean> = {};
    if (typeof patch.allow_guest_wishlist === "boolean") {
      writePatch.allow_guest_wishlist = patch.allow_guest_wishlist;
    }
    if (typeof patch.allow_multiple_wishlists === "boolean") {
      writePatch.allow_multiple_wishlists = patch.allow_multiple_wishlists;
    }

    if (Object.keys(writePatch).length === 0) {
      return this.getSettings();
    }

    await this.updateWishlistSettings({
      id: WISHLIST_SETTINGS_SINGLETON_ID,
      ...writePatch,
    });

    return this.getSettings();
  }
}
