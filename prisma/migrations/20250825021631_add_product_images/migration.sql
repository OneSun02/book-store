/*
  Warnings:

  - You are about to drop the column `image` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `sold` on the `Product` table. All the data in the column will be lost.
  - You are about to alter the column `price` on the `Product` table. The data in that column could be lost. The data in that column will be cast from `Float` to `Int`.

*/
-- CreateTable
CREATE TABLE "ProductImage" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "url" TEXT NOT NULL,
    "productId" INTEGER NOT NULL,
    CONSTRAINT "ProductImage_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Product" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL
);
INSERT INTO "new_Product" ("category", "description", "id", "name", "price", "quantity") SELECT "category", "description", "id", "name", "price", "quantity" FROM "Product";
DROP TABLE "Product";
ALTER TABLE "new_Product" RENAME TO "Product";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
