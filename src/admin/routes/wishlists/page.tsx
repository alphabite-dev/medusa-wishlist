import { defineRouteConfig } from "@medusajs/admin-sdk";
import { Heart } from "@medusajs/icons";
import {
  Container,
  Heading,
  Switch,
  Label,
  Button,
  Text,
  toast,
} from "@medusajs/ui";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { sdk } from "../../../lib/sdk";

type WishlistSettingsView = {
  allow_guest_wishlist: boolean;
  allow_multiple_wishlists: boolean;
};

const QUERY_KEY = ["wishlist", "settings"] as const;

const WishlistSettingsPage = () => {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: QUERY_KEY,
    queryFn: () =>
      sdk.client.fetch<WishlistSettingsView>("/admin/wishlists/settings", {
        method: "GET",
      }),
  });

  const [allowGuest, setAllowGuest] = useState(false);
  const [allowMultiple, setAllowMultiple] = useState(false);

  useEffect(() => {
    if (data) {
      setAllowGuest(data.allow_guest_wishlist);
      setAllowMultiple(data.allow_multiple_wishlists);
    }
  }, [data]);

  const isDirty =
    data !== undefined &&
    (allowGuest !== data.allow_guest_wishlist ||
      allowMultiple !== data.allow_multiple_wishlists);

  const update = useMutation({
    mutationFn: (patch: Partial<WishlistSettingsView>) =>
      sdk.client.fetch<WishlistSettingsView>("/admin/wishlists/settings", {
        method: "PUT",
        body: patch,
      }),
    onSuccess: (next) => {
      queryClient.setQueryData(QUERY_KEY, next);
      toast.success("Wishlist settings updated");
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : "Failed to update";
      toast.error(msg);
    },
  });

  const onSave = () => {
    if (!data) return;
    const patch: Partial<WishlistSettingsView> = {};
    if (allowGuest !== data.allow_guest_wishlist) {
      patch.allow_guest_wishlist = allowGuest;
    }
    if (allowMultiple !== data.allow_multiple_wishlists) {
      patch.allow_multiple_wishlists = allowMultiple;
    }
    update.mutate(patch);
  };

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <div>
          <Heading level="h2">Wishlists</Heading>
          <Text className="text-ui-fg-subtle">
            Control who can use wishlists in your storefront.
          </Text>
        </div>
      </div>

      <div className="flex flex-col gap-6 px-6 py-6">
        {isLoading ? (
          <Text className="text-ui-fg-subtle">Loading…</Text>
        ) : (
          <>
            <div className="flex items-start justify-between gap-4">
              <div className="flex flex-col">
                <Label htmlFor="allow-guest" className="font-medium">
                  Allow guest wishlists
                </Label>
                <Text size="small" className="text-ui-fg-subtle">
                  Anonymous visitors can save items to a wishlist.
                </Text>
              </div>
              <Switch
                id="allow-guest"
                checked={allowGuest}
                onCheckedChange={setAllowGuest}
              />
            </div>

            <div className="flex items-start justify-between gap-4">
              <div className="flex flex-col">
                <Label htmlFor="allow-multiple" className="font-medium">
                  Allow multiple wishlists per customer
                </Label>
                <Text size="small" className="text-ui-fg-subtle">
                  Signed-in customers can create more than one wishlist.
                </Text>
              </div>
              <Switch
                id="allow-multiple"
                checked={allowMultiple}
                onCheckedChange={setAllowMultiple}
              />
            </div>

            <div className="flex justify-end">
              <Button
                variant="primary"
                onClick={onSave}
                disabled={!isDirty || update.isPending}
                isLoading={update.isPending}
              >
                Save
              </Button>
            </div>
          </>
        )}
      </div>
    </Container>
  );
};

export const config = defineRouteConfig({
  label: "Wishlists",
  icon: Heart,
});

export default WishlistSettingsPage;
