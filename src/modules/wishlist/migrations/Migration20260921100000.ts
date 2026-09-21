import { Migration } from "@mikro-orm/migrations";

export class Migration20260921100000 extends Migration {
  async up(): Promise<void> {
    this.addSql(
      `CREATE INDEX IF NOT EXISTS "IDX_wishlist_item_product_id" ON "wishlist_item" (product_id) WHERE deleted_at IS NULL;`
    );
  }

  async down(): Promise<void> {
    this.addSql(`DROP INDEX IF EXISTS "IDX_wishlist_item_product_id";`);
  }
}
