import { Migration } from '@mikro-orm/migrations';

export class Migration20250616131527 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`drop index if exists "IDX_wishlist_customer_id_sales_channel_id_unique";`);

    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_wishlist_customer_id_sales_channel_id" ON "wishlist" (customer_id, sales_channel_id) WHERE customer_id IS NOT NULL AND deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop index if exists "IDX_wishlist_customer_id_sales_channel_id";`);

    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_wishlist_customer_id_sales_channel_id_unique" ON "wishlist" (customer_id, sales_channel_id) WHERE customer_id IS NOT NULL AND deleted_at IS NULL;`);
  }

}
