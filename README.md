# 🧞‍♂️ Wishlist Plugin for Medusa

The **Alphabite Wishlist Plugin** is the most feature-rich wishlist system built for [MedusaJS](https://medusajs.com). It supports both authenticated and guest users, allowing seamless wishlist creation, management, and transfer across sessions and logins.

This plugin includes a **fully typed SDK client** and a **Postman collection** for fast integration and testing.

---

## ✨ Features

- ✅ Create, update, delete, and retrieve wishlists  
- ✅ Add and remove items (product variants)  
- ✅ Paginated listing of wishlists and their items  
- ✅ Guest wishlist support
- ✅ Transfer wishlist (e.g. guest → logged-in customer)  
- ✅ Fully typed client integration with `@alphabite/medusa-client`  
- ✅ Postman collection for all routes  

---

## 📦 API Endpoints

All endpoints are exposed under the `/store/wishlists` path.

| Method | Endpoint                             | Description                          |
|--------|--------------------------------------|--------------------------------------|
| GET    | `/store/wishlists`                   | List customer wishlists              |
| POST   | `/store/wishlists`                   | Create a new wishlist                |
| GET    | `/store/wishlists/:id`               | Retrieve a specific wishlist         |
| PUT    | `/store/wishlists/:id`               | Update wishlist (e.g. name)          |
| DELETE | `/store/wishlists/:id`               | Delete a wishlist                    |
| GET    | `/store/wishlists/:id/items`         | List wishlist items                  |
| POST   | `/store/wishlists/:id/items`         | Add an item to a wishlist            |
| DELETE | `/store/wishlists/:id/items/:item_id`    | Remove an item from a wishlist       |
| POST   | `/store/wishlists/:id/transfer`      | Transfer wishlist (guest to user)    |

---

## 🧑‍💻 SDK Client

We provide a plug-and-play client plugin for `@medusajs/js-sdk`.

```ts
import Medusa from "@medusajs/js-sdk"
import { wishlistPlugin } from "alphabite-sdk"

const medusa = new Medusa({
  baseUrl: "https://your-medusa-url.com",
  plugins: [wishlistPlugin],
})

// Create a wishlist
await medusa.alphabite.wishlist.create({ name: "My Sneakers" })

// Add product to wishlist
await medusa.alphabite.wishlist.addItem({
  id: "wishlist_id",
  product_id: "prod_variant_id"
})
```

---

## 🔌 TypeScript Support

Includes full typings for:

- `Wishlist`, `WishlistItem`
- `CreateWishlistInput`, `ListWishlistsOutput`
- `AddItemToWishlistInput`, `RemoveItemFromWishlistInput`
- `TransferWishlistInput`, `PaginatedInput`, `PaginatedOutput`

---

## 📭 Postman Collection

A full Postman collection is available for testing all supported endpoints.

🗂️ **Location**: `docs/postman/WishlistPlugin.postman_collection.json`

---

## 🛠 Planned Features

- [ ] Guest wishlist (ID saved in cookie)
- [ ] Admin dashboard integration
- [ ] Product recommendation support

---

## 🧩 Requirements

- MedusaJS v2+
- Redis (optional, for guest wishlist caching)
- Customer authentication enabled

---

## 🤝 Contributing

We welcome issues, feedback, and PRs. Let us know how we can improve!
