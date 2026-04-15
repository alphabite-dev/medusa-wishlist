import { Migration } from "@mikro-orm/migrations";
export class Migration20260415155648 extends Migration {
  override async up(): Promise<void> {
    this.addSql(
      `alter table if exists "wishlist_item" add column if not exists "product_id" text;`,
    );

    this.addSql(
      `update "wishlist_item" set "product_id" = 'temp_placeholder' where "product_id" is null;`,
    );
    this.addSql(
      `alter table if exists "wishlist_item" alter column "product_id" set not null;`,
    );
  }
  override async down(): Promise<void> {
    this.addSql(
      `alter table if exists "wishlist_item" drop column if exists "product_id";`,
    );
  }
}
