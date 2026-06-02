import { defineRouteConfig } from "@medusajs/admin-sdk";
import { Heart } from "@medusajs/icons";
import { Container, Heading, Tabs } from "@medusajs/ui";
import { WishlistAnalyticsTab } from "../../components/wishlist/analytics-tab";
import { WishlistSettingsTab } from "../../components/wishlist/settings-tab";

const WishlistPage = () => {
  return (
    <Container className="p-0">
      <Tabs defaultValue="analytics">
        <div className="flex flex-col gap-3 border-b px-6 py-4">
          <Heading level="h2">Wishlists</Heading>
          <Tabs.List>
            <Tabs.Trigger value="analytics">Analytics</Tabs.Trigger>
            <Tabs.Trigger value="settings">Settings</Tabs.Trigger>
          </Tabs.List>
        </div>
        <Tabs.Content value="analytics">
          <WishlistAnalyticsTab />
        </Tabs.Content>
        <Tabs.Content value="settings">
          <WishlistSettingsTab />
        </Tabs.Content>
      </Tabs>
    </Container>
  );
};

export const config = defineRouteConfig({
  label: "Wishlists",
  icon: Heart,
});

export default WishlistPage;
