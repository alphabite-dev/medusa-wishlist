import { Badge, Heading, Select, Table, Text } from "@medusajs/ui";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { sdk } from "../../lib/sdk";

type Delta = { value: number; previous: number; delta_pct: number };

type AnalyticsResponse = {
  range: { from: string; to: string };
  kpis: {
    total_wishlists: Delta;
    total_items: Delta;
    avg_items_per_wishlist: Delta;
    active_wishlists: number;
    empty_wishlists: number;
    guest_wishlists: number;
    registered_wishlists: number;
    unique_customers: Delta;
  };
  trend: Array<{ date: string; wishlists: number; items: number }>;
  top_products: Array<{
    product_id: string;
    title: string;
    thumbnail: string | null;
    wishlist_count: number;
    item_count: number;
  }>;
  top_variants: Array<{
    product_variant_id: string;
    product_id: string;
    title: string;
    wishlist_count: number;
  }>;
  by_sales_channel: Array<{
    sales_channel_id: string;
    name: string;
    wishlist_count: number;
  }>;
};

const RANGE_PRESETS: Record<string, number> = {
  "7": 7,
  "30": 30,
  "90": 90,
};

const KpiCard = ({
  label,
  value,
  delta,
}: {
  label: string;
  value: string;
  delta?: number;
}) => (
  <div className="flex flex-col gap-1 rounded-lg border p-4">
    <Text size="small" className="text-ui-fg-subtle">
      {label}
    </Text>
    <div className="flex items-baseline gap-2">
      <Text size="xlarge" weight="plus">
        {value}
      </Text>
      {delta !== undefined && (
        <Badge
          size="2xsmall"
          color={delta > 0 ? "green" : delta < 0 ? "red" : "grey"}
        >
          {delta > 0 ? "+" : ""}
          {delta}%
        </Badge>
      )}
    </div>
  </div>
);

export const WishlistAnalyticsTab = () => {
  const [rangeDays, setRangeDays] = useState("30");
  const [channelId, setChannelId] = useState<string>("all");

  const { data: channelsRes } = useQuery({
    queryKey: ["wishlist", "analytics", "channels"],
    queryFn: () => sdk.admin.salesChannel.list({ limit: 100 }),
  });

  const range = useMemo(() => {
    const to = new Date();
    const from = new Date(
      to.getTime() - RANGE_PRESETS[rangeDays] * 24 * 60 * 60 * 1000,
    );
    return { from: from.toISOString(), to: to.toISOString() };
  }, [rangeDays]);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["wishlist", "analytics", range, channelId],
    queryFn: () => {
      const params = new URLSearchParams({ from: range.from, to: range.to });
      if (channelId !== "all") params.set("sales_channel_id", channelId);
      return sdk.client.fetch<AnalyticsResponse>(
        `/admin/wishlists/analytics?${params.toString()}`,
        { method: "GET" },
      );
    },
  });

  const maxTrend = useMemo(
    () =>
      Math.max(
        1,
        ...(data?.trend.map((t) => Math.max(t.wishlists, t.items)) ?? [1]),
      ),
    [data],
  );

  if (isError) {
    return (
      <div className="px-6 py-6">
        <Text className="text-ui-fg-error">Failed to load analytics.</Text>
      </div>
    );
  }

  if (isLoading || !data) {
    return (
      <div className="px-6 py-6">
        <Text className="text-ui-fg-subtle">Loading analytics…</Text>
      </div>
    );
  }

  const hasData =
    data.kpis.total_wishlists.value > 0 ||
    data.trend.length > 0 ||
    data.top_products.length > 0;

  return (
    <div className="flex flex-col gap-6 px-6 py-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="w-full sm:w-48">
          <Select value={rangeDays} onValueChange={setRangeDays}>
            <Select.Trigger>
              <Select.Value />
            </Select.Trigger>
            <Select.Content>
              <Select.Item value="7">Last 7 days</Select.Item>
              <Select.Item value="30">Last 30 days</Select.Item>
              <Select.Item value="90">Last 90 days</Select.Item>
            </Select.Content>
          </Select>
        </div>
        <div className="w-full sm:w-64">
          <Select value={channelId} onValueChange={setChannelId}>
            <Select.Trigger>
              <Select.Value placeholder="All sales channels" />
            </Select.Trigger>
            <Select.Content>
              <Select.Item value="all">All sales channels</Select.Item>
              {channelsRes?.sales_channels?.map((c) => (
                <Select.Item key={c.id} value={c.id}>
                  {c.name}
                </Select.Item>
              ))}
            </Select.Content>
          </Select>
        </div>
      </div>

      {!hasData ? (
        <Text className="text-ui-fg-subtle">
          No wishlist activity in this period yet.
        </Text>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <KpiCard
              label="Total wishlists"
              value={String(data.kpis.total_wishlists.value)}
              delta={data.kpis.total_wishlists.delta_pct}
            />
            <KpiCard
              label="Saved items"
              value={String(data.kpis.total_items.value)}
              delta={data.kpis.total_items.delta_pct}
            />
            <KpiCard
              label="Avg items / wishlist"
              value={String(data.kpis.avg_items_per_wishlist.value)}
              delta={data.kpis.avg_items_per_wishlist.delta_pct}
            />
            <KpiCard
              label="Active vs empty"
              value={`${data.kpis.active_wishlists} / ${data.kpis.empty_wishlists}`}
            />
            <KpiCard
              label="Guest vs registered"
              value={`${data.kpis.guest_wishlists} / ${data.kpis.registered_wishlists}`}
            />
            <KpiCard
              label="Unique customers"
              value={String(data.kpis.unique_customers.value)}
              delta={data.kpis.unique_customers.delta_pct}
            />
          </div>

          <div className="flex flex-col gap-2 rounded-lg border p-4">
            <Text size="small" weight="plus">
              Activity over time
            </Text>
            <div className="flex h-40 items-end gap-1 overflow-x-auto">
              {data.trend.map((t) => (
                <div
                  key={t.date}
                  className="flex min-w-[10px] flex-1 flex-col items-center justify-end gap-0.5"
                  title={`${t.date}: ${t.wishlists} wishlists, ${t.items} items`}
                >
                  <div className="flex h-32 w-full items-end justify-center gap-0.5">
                    <div
                      className="w-1/2 rounded-t bg-ui-fg-interactive"
                      style={{
                        height: `${(t.wishlists / maxTrend) * 100}%`,
                        minHeight: t.wishlists > 0 ? "2px" : undefined,
                      }}
                    />
                    <div
                      className="w-1/2 rounded-t bg-ui-fg-muted"
                      style={{
                        height: `${(t.items / maxTrend) * 100}%`,
                        minHeight: t.items > 0 ? "2px" : undefined,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-4">
              <Text size="xsmall" className="text-ui-fg-subtle">
                ▮ Wishlists
              </Text>
              <Text size="xsmall" className="text-ui-fg-muted">
                ▮ Items
              </Text>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Heading level="h3">Most-wishlisted products (top 10)</Heading>
            <Table>
              <Table.Header>
                <Table.Row>
                  <Table.HeaderCell>Product</Table.HeaderCell>
                  <Table.HeaderCell className="text-right">
                    Wishlists
                  </Table.HeaderCell>
                  <Table.HeaderCell className="text-right">
                    Items
                  </Table.HeaderCell>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {data.top_products.map((p) => (
                  <Table.Row key={p.product_id}>
                    <Table.Cell>
                      <div className="flex items-center gap-2">
                        {p.thumbnail ? (
                          <img
                            src={p.thumbnail}
                            alt=""
                            className="h-8 w-8 rounded object-cover"
                          />
                        ) : (
                          <div className="h-8 w-8 rounded bg-ui-bg-subtle" />
                        )}
                        <Text size="small">{p.title}</Text>
                      </div>
                    </Table.Cell>
                    <Table.Cell className="text-right">
                      {p.wishlist_count}
                    </Table.Cell>
                    <Table.Cell className="text-right">
                      {p.item_count}
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table>
          </div>

          <div className="flex flex-col gap-2">
            <Heading level="h3">Most-wishlisted variants (top 10)</Heading>
            <Table>
              <Table.Header>
                <Table.Row>
                  <Table.HeaderCell>Variant</Table.HeaderCell>
                  <Table.HeaderCell className="text-right">
                    Wishlists
                  </Table.HeaderCell>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {data.top_variants.map((v) => (
                  <Table.Row key={v.product_variant_id}>
                    <Table.Cell>
                      <Text size="small">{v.title}</Text>
                    </Table.Cell>
                    <Table.Cell className="text-right">
                      {v.wishlist_count}
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table>
          </div>

          {data.by_sales_channel.length > 0 && (
            <div className="flex flex-col gap-2">
              <Heading level="h3">Wishlists by sales channel</Heading>
              <Table>
                <Table.Header>
                  <Table.Row>
                    <Table.HeaderCell>Channel</Table.HeaderCell>
                    <Table.HeaderCell className="text-right">
                      Wishlists
                    </Table.HeaderCell>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {data.by_sales_channel.map((c) => (
                    <Table.Row key={c.sales_channel_id}>
                      <Table.Cell>{c.name}</Table.Cell>
                      <Table.Cell className="text-right">
                        {c.wishlist_count}
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table>
            </div>
          )}
        </>
      )}
    </div>
  );
};
