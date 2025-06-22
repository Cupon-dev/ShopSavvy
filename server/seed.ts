import { db } from "./db";
import { products } from "@shared/schema";

const sampleProducts = [
  {
    name: "Pink Bra",
    brand: "PINK",
    description: "Comfortable and stylish pink bra with premium materials",
    price: "1.00",
    originalPrice: "100.00",
    category: "clothing",
    imageUrl: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
    rating: "4.9",
    reviewCount: 789,
    viewCount: 7202,
    soldCount: 6057,
    inStock: 50,
    isHighDemand: false,
    hasInstantAccess: true,
  },
  {
    name: "Mallu bgrade collection",
    brand: "B-Grade",
    description: "Exclusive collection with unique designs",
    price: "129.99",
    originalPrice: "179.00",
    category: "clothing",
    imageUrl: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
    rating: "4.7",
    reviewCount: 789,
    viewCount: 6986,
    soldCount: 6381,
    inStock: 25,
    isHighDemand: false,
    hasInstantAccess: true,
  },
  {
    name: "Vintage Leather Handbag",
    brand: "Heritage Craft",
    description: "Handcrafted vintage leather handbag with classic design",
    price: "89.99",
    originalPrice: "129.99",
    category: "bags",
    imageUrl: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
    rating: "4.8",
    reviewCount: 156,
    viewCount: 4101,
    soldCount: 11458,
    inStock: 12,
    isHighDemand: false,
    hasInstantAccess: true,
  },
  {
    name: "Classic Comfort Essential",
    brand: "Essentials",
    description: "Essential comfort wear for everyday use",
    price: "19.99",
    originalPrice: "29.99",
    category: "clothing",
    imageUrl: "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
    rating: "4.9",
    reviewCount: 567,
    viewCount: 9743,
    soldCount: 11275,
    inStock: 30,
    isHighDemand: true,
    hasInstantAccess: true,
  },
  {
    name: "Urban Style Casual Shirt",
    brand: "Urban Trends",
    description: "Modern casual shirt with urban styling",
    price: "32.99",
    originalPrice: "45.99",
    category: "clothing",
    imageUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
    rating: "4.7",
    reviewCount: 896,
    viewCount: 9140,
    soldCount: 3454,
    inStock: 40,
    isHighDemand: true,
    hasInstantAccess: true,
  },
  {
    name: "Classic Black Tee",
    brand: "Minimalist",
    description: "Simple and elegant black t-shirt",
    price: "24.99",
    originalPrice: "35.99",
    category: "clothing",
    imageUrl: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
    rating: "4.6",
    reviewCount: 234,
    viewCount: 7873,
    soldCount: 5223,
    inStock: 60,
    isHighDemand: false,
    hasInstantAccess: true,
  },
  {
    name: "Business Portrait Collection",
    brand: "Professional",
    description: "Professional business portrait collection",
    price: "49.99",
    originalPrice: "75.99",
    category: "accessories",
    imageUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
    rating: "4.8",
    reviewCount: 445,
    viewCount: 10815,
    soldCount: 10428,
    inStock: 20,
    isHighDemand: false,
    hasInstantAccess: true,
  },
  {
    name: "Premium Accessory Set",
    brand: "Luxury Leather",
    description: "Premium leather accessory set with multiple items",
    price: "79.99",
    originalPrice: "129.99",
    category: "accessories",
    imageUrl: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
    rating: "4.9",
    reviewCount: 312,
    viewCount: 2237,
    soldCount: 10704,
    inStock: 15,
    isHighDemand: false,
    hasInstantAccess: true,
  },
  {
    name: "Designer Wallet Collection",
    brand: "Elite Designs",
    description: "Premium designer wallet with RFID protection",
    price: "45.99",
    originalPrice: "69.99",
    category: "wallets",
    imageUrl: "https://images.unsplash.com/photo-1627123424574-724758594e93?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
    rating: "4.7",
    reviewCount: 298,
    viewCount: 5432,
    soldCount: 7891,
    inStock: 35,
    isHighDemand: false,
    hasInstantAccess: true,
  },
  {
    name: "Athletic Running Shoes",
    brand: "SportMax",
    description: "High-performance running shoes for athletes",
    price: "89.99",
    originalPrice: "119.99",
    category: "shoes",
    imageUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
    rating: "4.8",
    reviewCount: 567,
    viewCount: 8934,
    soldCount: 4567,
    inStock: 25,
    isHighDemand: true,
    hasInstantAccess: true,
  }
];

async function seedDatabase() {
  try {
    console.log("Seeding database with sample products...");
    
    // Check if products already exist
    const existingProducts = await db.select().from(products).limit(1);
    
    if (existingProducts.length > 0) {
      console.log("Products already exist in database. Skipping seed.");
      return;
    }
    
    // Insert sample products
    await db.insert(products).values(sampleProducts);
    
    console.log(`Successfully seeded ${sampleProducts.length} products!`);
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}

// Run seed if this file is executed directly
if (require.main === module) {
  seedDatabase().then(() => {
    console.log("Seeding completed");
    process.exit(0);
  }).catch((error) => {
    console.error("Seeding failed:", error);
    process.exit(1);
  });
}

export { seedDatabase };