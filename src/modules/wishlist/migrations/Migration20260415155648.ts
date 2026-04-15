import { Migration } from "@mikro-orm/migrations";

export class Migration20260415155648 extends Migration {
  override async up(): Promise<void> {
    this.addSql(
      `alter table if exists "wishlist_item" add column if not exists "product_id" text not null;`,
    );
  }

  override async down(): Promise<void> {
    this.addSql(
      `alter table if exists "wishlist_item" drop column if exists "product_id";`,
    );
  }
}
