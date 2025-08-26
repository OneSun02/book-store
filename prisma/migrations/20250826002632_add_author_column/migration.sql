/*
  Warnings:

  - Added the required column `author` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `publisher` to the `Product` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Product" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "publisher" TEXT NOT NULL,
    "isbn" TEXT,
    "language" TEXT,
    "publishedYear" INTEGER,
    "pages" INTEGER,
    "description" TEXT,
    "category" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    "sold" INTEGER NOT NULL DEFAULT 0
);
INSERT INTO "new_Product" ("category", "description", "id", "name", "price", "quantity", "sold") SELECT "category", "description", "id", "name", "price", "quantity", "sold" FROM "Product";
DROP TABLE "Product";
ALTER TABLE "new_Product" RENAME TO "Product";
CREATE UNIQUE INDEX "Product_isbn_key" ON "Product"("isbn");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
