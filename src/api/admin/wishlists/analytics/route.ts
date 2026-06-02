import { MedusaRequest, MedusaResponse } from "@medusajs/framework";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import { WISHLIST_MODULE } from "../../../../modules/wishlist";
import WishlistModuleService from "../../../../modules/wishlist/service";
import { WishlistAnalyticsQuerySchema } from "./validators";
import type { WishlistAnalyticsResponse } from "./types";

type ProductRow = { id: string; title: string; thumbnail: string | null };
type VariantRow = { id: string; title: string };
type ChannelRow = { id: string; name: string };

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const logger = req.scope.resolve(ContainerRegistrationKeys.LOGGER);
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);
  const service = req.scope.resolve<WishlistModuleService>(WISHLIST_MODULE);

  const parsed = WishlistAnalyticsQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    return res.status(400).json({
      error: "Invalid analytics query",
      issues: parsed.error.flatten(),
    });
  }

  try {
    const view = await service.getAnalytics(parsed.data);

    const productIds = view.top_products.map((p) => p.product_id);
    const variantIds = view.top_variants.map((v) => v.product_variant_id);
    const channelIds = view.by_sales_channel.map((c) => c.sales_channel_id);

    const [products, variants, channels] = await Promise.all([
      productIds.length
        ? query.graph({
            entity: "product",
            fields: ["id", "title", "thumbnail"],
            filters: { id: productIds },
          })
        : Promise.resolve({ data: [] }),
      variantIds.length
        ? query.graph({
            entity: "product_variant",
            fields: ["id", "title"],
            filters: { id: variantIds },
          })
        : Promise.resolve({ data: [] }),
      channelIds.length
        ? query.graph({
            entity: "sales_channel",
            fields: ["id", "name"],
            filters: { id: channelIds },
          })
        : Promise.resolve({ data: [] }),
    ]);

    const productRows = products.data as ProductRow[];
    const variantRows = variants.data as VariantRow[];
    const channelRows = channels.data as ChannelRow[];

    const productMap = new Map(productRows.map((p) => [p.id, p]));
    const variantMap = new Map(variantRows.map((v) => [v.id, v]));
    const channelMap = new Map(channelRows.map((c) => [c.id, c]));

    const response: WishlistAnalyticsResponse = {
      ...view,
      top_products: view.top_products.map((p) => {
        const product = productMap.get(p.product_id);

        return {
          ...p,
          title: product?.title ?? p.product_id,
          thumbnail: product?.thumbnail ?? null,
        };
      }),
      top_variants: view.top_variants.map((v) => ({
        ...v,
        title: variantMap.get(v.product_variant_id)?.title ?? v.product_variant_id,
      })),
      by_sales_channel: view.by_sales_channel.map((c) => ({
        ...c,
        name: channelMap.get(c.sales_channel_id)?.name ?? c.sales_channel_id,
      })),
    };

    return res.status(200).json(response);
  } catch (error) {
    logger.error("[admin/wishlists/analytics] GET error:", error);
    return res.status(500).json({
      error: "Failed to load wishlist analytics",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
