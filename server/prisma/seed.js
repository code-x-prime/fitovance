import { prisma } from "../config/db.js";

async function main() {
  console.log("=== FITOVANCE Navigation Seed ===\n");

  // ----------------------------------------------------
  // CLEANUP - Delete ALL old navigation data (rugs era)
  // ----------------------------------------------------
  console.log("[1/5] Cleaning up old navigation data...");
  await prisma.navbarLink.deleteMany({});
  await prisma.navbarColumn.deleteMany({});
  await prisma.navbarItem.deleteMany({});

  // Delete old rug-specific categories & subcategories
  const oldSlugs = [
    "rugs", "manchaha", "home-textile", "wall-art", "furniture", "accessories",
    "clearance", "abstract", "geometrical", "moroccan", "oriental", "vintage--distressed",
  ];
  for (const slug of oldSlugs) {
    const cat = await prisma.category.findUnique({ where: { slug } });
    if (cat) {
      await prisma.subCategory.deleteMany({ where: { categoryId: cat.id } });
      await prisma.category.delete({ where: { slug } });
      console.log(`  Deleted old category: ${slug}`);
    }
  }

  // Delete old attributes that were rug-specific
  const oldAttrs = ["Size", "Color", "Material", "Construction", "Room"];
  for (const name of oldAttrs) {
    const attr = await prisma.attribute.findFirst({ where: { name } });
    if (attr) {
      await prisma.attributeValue.deleteMany({ where: { attributeId: attr.id } });
      await prisma.attribute.delete({ where: { id: attr.id } });
      console.log(`  Deleted old attribute: ${name}`);
    }
  }

  // ----------------------------------------------------
  // 2. Create FITOVANCE Categories
  // ----------------------------------------------------
  console.log("\n[2/5] Creating FITOVANCE categories...");

  const categories = [
    { name: "Protein Bars", slug: "protein-bars", description: "Premium protein bars for on-the-go nutrition" },
    { name: "Protein Powders", slug: "protein-powders", description: "High-quality protein powders for muscle building" },
    { name: "Whey Protein", slug: "whey-protein", description: "Premium whey protein for serious athletes" },
    { name: "Pre Workout", slug: "pre-workout", description: "Energy-boosting pre-workout supplements" },
    { name: "Creatine", slug: "creatine", description: "Pure creatine for strength & performance" },
    { name: "Healthy Snacks", slug: "healthy-snacks", description: "Healthy snacks for fitness enthusiasts" },
    { name: "Combo Packs", slug: "combo-packs", description: "Value combo packs & supplement stacks" },
    { name: "Accessories", slug: "accessories", description: "Shakers, gym gear & accessories" },
    { name: "Mass Gainer", slug: "mass-gainer", description: "Mass gainers for bulking" },
    { name: "Plant Protein", slug: "plant-protein", description: "Vegan & plant-based protein" },
    { name: "Clearance", slug: "clearance", description: "Clearance sale items" },
  ];

  for (const cat of categories) {
    const existing = await prisma.category.findUnique({ where: { slug: cat.slug } });
    if (!existing) {
      await prisma.category.create({ data: cat });
      console.log(`  Created: ${cat.name}`);
    }
  }

  // ----------------------------------------------------
  // 3. Create SubCategories
  // ----------------------------------------------------
  console.log("\n[3/5] Creating subcategories...");

  const subCategories = {
    "protein-bars": [
      { name: "Whey Protein Bars", slug: "whey-protein-bars" },
      { name: "Vegan Protein Bars", slug: "vegan-protein-bars" },
      { name: "Meal Replacement Bars", slug: "meal-replacement-bars" },
      { name: "Peanut Butter Bars", slug: "peanut-butter-bars" },
    ],
    "protein-powders": [
      { name: "Whey Protein Powder", slug: "whey-protein-powder" },
      { name: "Casein Protein", slug: "casein-protein" },
      { name: "Soy Protein", slug: "soy-protein" },
      { name: "Egg White Protein", slug: "egg-white-protein" },
    ],
    "whey-protein": [
      { name: "Whey Isolate", slug: "whey-isolate" },
      { name: "Whey Concentrate", slug: "whey-concentrate" },
      { name: "Whey Blend", slug: "whey-blend" },
    ],
    "pre-workout": [
      { name: "Pre-Workout Powder", slug: "pre-workout-powder" },
      { name: "BCAAs", slug: "bcaas" },
      { name: "Energy Boosters", slug: "energy-boosters" },
    ],
    "creatine": [
      { name: "Creatine Monohydrate", slug: "creatine-monohydrate" },
      { name: "Creatine HCL", slug: "creatine-hcl" },
      { name: "Creatine Blend", slug: "creatine-blend" },
    ],
    "healthy-snacks": [
      { name: "Protein Cookies", slug: "protein-cookies" },
      { name: "Protein Chips", slug: "protein-chips" },
      { name: "Trail Mix", slug: "trail-mix" },
    ],
    "combo-packs": [
      { name: "Protein Combos", slug: "protein-combos" },
      { name: "Supplement Stacks", slug: "supplement-stacks" },
      { name: "Starter Packs", slug: "starter-packs" },
    ],
    "accessories": [
      { name: "Shakers", slug: "shakers" },
      { name: "Gym Gloves", slug: "gym-gloves" },
      { name: "Resistance Bands", slug: "resistance-bands" },
    ],
    "clearance": [
      { name: "Under ₹999", slug: "under-999" },
      { name: "Under ₹1999", slug: "under-1999" },
      { name: "50% Off & Above", slug: "50-off-above" },
    ],
  };

  for (const [catSlug, subs] of Object.entries(subCategories)) {
    const cat = await prisma.category.findUnique({ where: { slug: catSlug } });
    if (!cat) continue;
    for (const sub of subs) {
      const existing = await prisma.subCategory.findFirst({
        where: { categoryId: cat.id, slug: sub.slug },
      });
      if (!existing) {
        await prisma.subCategory.create({
          data: {
            categoryId: cat.id,
            name: sub.name,
            slug: sub.slug,
            description: sub.name,
            isActive: true,
          },
        });
      }
    }
  }
  console.log("  All subcategories created.");

  // ----------------------------------------------------
  // 4. Create Navigation Menu Items
  // ----------------------------------------------------
  console.log("\n[4/5] Creating navigation menu items...");

  // --- SHOP (COLUMNS_WITH_BANNER) ---
  const shopMenu = await prisma.navbarItem.create({
    data: {
      label: "SHOP",
      order: 0,
      layout: "COLUMNS_WITH_BANNER",
      isActive: true,
      bannerImage: null,
      bannerTitle: "PREMIUM SPORTS NUTRITION",
      bannerSubtitle: "SHOP NOW",
      bannerLink: "/products",
    },
  });

  const shopCol1 = await prisma.navbarColumn.create({
    data: { navbarItemId: shopMenu.id, title: "SHOP BY CATEGORY", order: 0 },
  });
  await prisma.navbarLink.createMany({
    data: [
      { columnId: shopCol1.id, label: "Protein Bars", url: "/products?category=protein-bars", order: 0 },
      { columnId: shopCol1.id, label: "Protein Powders", url: "/products?category=protein-powders", order: 1 },
      { columnId: shopCol1.id, label: "Whey Protein", url: "/products?category=whey-protein", order: 2 },
      { columnId: shopCol1.id, label: "Pre Workout", url: "/products?category=pre-workout", order: 3 },
      { columnId: shopCol1.id, label: "Creatine", url: "/products?category=creatine", order: 4 },
      { columnId: shopCol1.id, label: "Healthy Snacks", url: "/products?category=healthy-snacks", order: 5 },
      { columnId: shopCol1.id, label: "Combo Packs", url: "/products?category=combo-packs", order: 6 },
      { columnId: shopCol1.id, label: "Accessories", url: "/products?category=accessories", order: 7 },
      { columnId: shopCol1.id, label: "View All Products", url: "/products", order: 8, badge: "ALL" },
    ],
  });

  const shopCol2 = await prisma.navbarColumn.create({
    data: { navbarItemId: shopMenu.id, title: "POPULAR", order: 1 },
  });
  await prisma.navbarLink.createMany({
    data: [
      { columnId: shopCol2.id, label: "Best Sellers", url: "/products?sort=bestselling", badge: "HOT", order: 0 },
      { columnId: shopCol2.id, label: "New Arrivals", url: "/products?sort=createdAt&order=desc", badge: "NEW", order: 1 },
      { columnId: shopCol2.id, label: "On Sale", url: "/products?sale=true", order: 2 },
      { columnId: shopCol2.id, label: "Combo Deals", url: "/products?category=combo-packs", order: 3 },
    ],
  });

  // --- PROTEIN (COLUMNS_WITH_BANNER) ---
  const proteinMenu = await prisma.navbarItem.create({
    data: {
      label: "PROTEIN",
      order: 1,
      layout: "COLUMNS_WITH_BANNER",
      isActive: true,
      bannerTitle: "BUILD. RECOVER. GROW.",
      bannerSubtitle: "EXPLORE PROTEIN",
      bannerLink: "/products?category=whey-protein",
    },
  });

  const protCol1 = await prisma.navbarColumn.create({
    data: { navbarItemId: proteinMenu.id, title: "WHEY PROTEIN", order: 0 },
  });
  await prisma.navbarLink.createMany({
    data: [
      { columnId: protCol1.id, label: "Whey Protein", url: "/products?category=whey-protein", order: 0 },
      { columnId: protCol1.id, label: "Isolate Protein", url: "/products?category=whey-protein&subcategory=whey-isolate", order: 1 },
      { columnId: protCol1.id, label: "Concentrate", url: "/products?category=whey-protein&subcategory=whey-concentrate", order: 2 },
      { columnId: protCol1.id, label: "Mass Gainer", url: "/products?category=mass-gainer", order: 3 },
      { columnId: protCol1.id, label: "Plant Protein", url: "/products?category=plant-protein", order: 4 },
    ],
  });

  const protCol2 = await prisma.navbarColumn.create({
    data: { navbarItemId: proteinMenu.id, title: "PROTEIN BARS", order: 1 },
  });
  await prisma.navbarLink.createMany({
    data: [
      { columnId: protCol2.id, label: "Protein Bars", url: "/products?category=protein-bars", order: 0 },
      { columnId: protCol2.id, label: "Whey Bars", url: "/products?category=protein-bars&subcategory=whey-protein-bars", order: 1 },
      { columnId: protCol2.id, label: "Vegan Bars", url: "/products?category=protein-bars&subcategory=vegan-protein-bars", order: 2 },
      { columnId: protCol2.id, label: "Meal Replacement", url: "/products?category=protein-bars&subcategory=meal-replacement-bars", order: 3 },
    ],
  });

  // --- GOALS (COLUMNS_WITH_BANNER) ---
  const goalsMenu = await prisma.navbarItem.create({
    data: {
      label: "GOALS",
      order: 2,
      layout: "COLUMNS_WITH_BANNER",
      isActive: true,
      bannerTitle: "FUEL YOUR PERFORMANCE",
      bannerSubtitle: "SHOP BY GOAL",
      bannerLink: "/products",
    },
  });

  const goalsCol1 = await prisma.navbarColumn.create({
    data: { navbarItemId: goalsMenu.id, title: "YOUR FITNESS GOAL", order: 0 },
  });
  await prisma.navbarLink.createMany({
    data: [
      { columnId: goalsCol1.id, label: "Build Muscle", url: "/products?search=build+muscle", order: 0 },
      { columnId: goalsCol1.id, label: "Weight Loss", url: "/products?search=weight+loss", order: 1 },
      { columnId: goalsCol1.id, label: "Strength", url: "/products?search=strength", order: 2 },
      { columnId: goalsCol1.id, label: "Endurance", url: "/products?search=endurance", order: 3 },
      { columnId: goalsCol1.id, label: "Recovery", url: "/products?search=recovery", order: 4 },
      { columnId: goalsCol1.id, label: "Daily Nutrition", url: "/products?search=daily+nutrition", order: 5 },
      { columnId: goalsCol1.id, label: "Energy", url: "/products?search=energy", order: 6 },
    ],
  });

  const goalsCol2 = await prisma.navbarColumn.create({
    data: { navbarItemId: goalsMenu.id, title: "SUPPLEMENTS", order: 1 },
  });
  await prisma.navbarLink.createMany({
    data: [
      { columnId: goalsCol2.id, label: "Pre Workout", url: "/products?category=pre-workout", order: 0 },
      { columnId: goalsCol2.id, label: "Creatine", url: "/products?category=creatine", order: 1 },
      { columnId: goalsCol2.id, label: "BCAAs", url: "/products?category=pre-workout&subcategory=bcaas", order: 2 },
      { columnId: goalsCol2.id, label: "Mass Gainer", url: "/products?category=mass-gainer", order: 3 },
    ],
  });

  // --- NEW ARRIVALS (COLUMNS_WITH_BANNER) ---
  const newArrivalsMenu = await prisma.navbarItem.create({
    data: {
      label: "NEW ARRIVALS",
      order: 3,
      layout: "COLUMNS_WITH_BANNER",
      isActive: true,
      bannerTitle: "JUST DROPPED",
      bannerSubtitle: "SHOP NEW",
      bannerLink: "/products?sort=createdAt&order=desc",
    },
  });

  const newCol1 = await prisma.navbarColumn.create({
    data: { navbarItemId: newArrivalsMenu.id, title: "JUST DROPPED", order: 0 },
  });
  await prisma.navbarLink.createMany({
    data: [
      { columnId: newCol1.id, label: "Latest Products", url: "/products?sort=createdAt&order=desc", badge: "NEW", order: 0 },
      { columnId: newCol1.id, label: "Featured Products", url: "/products?featured=true", order: 1 },
      { columnId: newCol1.id, label: "Recently Added", url: "/products?productType=new", order: 2 },
    ],
  });

  const newCol2 = await prisma.navbarColumn.create({
    data: { navbarItemId: newArrivalsMenu.id, title: "NEW IN", order: 1 },
  });
  await prisma.navbarLink.createMany({
    data: [
      { columnId: newCol2.id, label: "New Protein Bars", url: "/products?category=protein-bars&sort=createdAt&order=desc", order: 0 },
      { columnId: newCol2.id, label: "New Supplements", url: "/products?category=pre-workout&sort=createdAt&order=desc", order: 1 },
      { columnId: newCol2.id, label: "New Accessories", url: "/products?category=accessories&sort=createdAt&order=desc", order: 2 },
    ],
  });

  // --- BEST SELLERS (COLUMNS_WITH_BANNER) ---
  const bestSellersMenu = await prisma.navbarItem.create({
    data: {
      label: "BEST SELLERS",
      order: 4,
      layout: "COLUMNS_WITH_BANNER",
      isActive: true,
      bannerTitle: "CUSTOMER FAVORITES",
      bannerSubtitle: "SHOP TOP RATED",
      bannerLink: "/products?sort=bestselling",
    },
  });

  const bestCol1 = await prisma.navbarColumn.create({
    data: { navbarItemId: bestSellersMenu.id, title: "TOP PRODUCTS", order: 0 },
  });
  await prisma.navbarLink.createMany({
    data: [
      { columnId: bestCol1.id, label: "Top Rated", url: "/products?sort=rating&order=desc", badge: "TOP", order: 0 },
      { columnId: bestCol1.id, label: "Most Popular", url: "/products?sort=bestselling", order: 1 },
      { columnId: bestCol1.id, label: "Trending Products", url: "/products?sort=trending", badge: "TRENDING", order: 2 },
    ],
  });

  const bestCol2 = await prisma.navbarColumn.create({
    data: { navbarItemId: bestSellersMenu.id, title: "BY CATEGORY", order: 1 },
  });
  await prisma.navbarLink.createMany({
    data: [
      { columnId: bestCol2.id, label: "Best in Protein", url: "/products?category=whey-protein&sort=bestselling", order: 0 },
      { columnId: bestCol2.id, label: "Best in Supplements", url: "/products?category=pre-workout&sort=bestselling", order: 1 },
      { columnId: bestCol2.id, label: "Best in Snacks", url: "/products?category=healthy-snacks&sort=bestselling", order: 2 },
    ],
  });

  // --- OFFERS (COLUMNS_WITH_BANNER) ---
  const offersMenu = await prisma.navbarItem.create({
    data: {
      label: "OFFERS",
      order: 5,
      layout: "COLUMNS_WITH_BANNER",
      isActive: true,
      bannerTitle: "SAVE BIG TODAY",
      bannerSubtitle: "SHOP DEALS",
      bannerLink: "/products?sale=true",
    },
  });

  const offerCol1 = await prisma.navbarColumn.create({
    data: { navbarItemId: offersMenu.id, title: "DEALS", order: 0 },
  });
  await prisma.navbarLink.createMany({
    data: [
      { columnId: offerCol1.id, label: "Today's Deals", url: "/products?sale=true", badge: "SALE", order: 0 },
      { columnId: offerCol1.id, label: "Combo Offers", url: "/products?category=combo-packs", order: 1 },
      { columnId: offerCol1.id, label: "Bundles", url: "/products?search=bundle", order: 2 },
      { columnId: offerCol1.id, label: "Clearance", url: "/products?category=clearance", badge: "CLEARANCE", order: 3 },
    ],
  });

  const offerCol2 = await prisma.navbarColumn.create({
    data: { navbarItemId: offersMenu.id, title: "SAVINGS", order: 1 },
  });
  await prisma.navbarLink.createMany({
    data: [
      { columnId: offerCol2.id, label: "Under ₹999", url: "/products?maxPrice=999", order: 0 },
      { columnId: offerCol2.id, label: "Under ₹1999", url: "/products?maxPrice=1999", order: 1 },
      { columnId: offerCol2.id, label: "50% Off & Above", url: "/products?sale=true", badge: "HOT", order: 2 },
    ],
  });

  // --- ABOUT (SIMPLE) ---
  await prisma.navbarItem.create({
    data: { label: "ABOUT", order: 6, layout: "SIMPLE", slug: "/about", isActive: true },
  });

  // --- CONTACT (SIMPLE) ---
  await prisma.navbarItem.create({
    data: { label: "CONTACT", order: 7, layout: "SIMPLE", slug: "/contact", isActive: true },
  });

  // ----------------------------------------------------
  // 5. Summary
  // ----------------------------------------------------
  const totalItems = await prisma.navbarItem.count();
  const totalColumns = await prisma.navbarColumn.count();
  const totalLinks = await prisma.navbarLink.count();
  const totalCategories = await prisma.category.count();
  const totalSubs = await prisma.subCategory.count();

  console.log(`\n[5/5] Seed Complete!\n`);
  console.log(`  Navigation Items:  ${totalItems}`);
  console.log(`  Navigation Columns: ${totalColumns}`);
  console.log(`  Navigation Links:  ${totalLinks}`);
  console.log(`  Categories:        ${totalCategories}`);
  console.log(`  Subcategories:     ${totalSubs}`);
  console.log(`\n  Main Nav: SHOP | PROTEIN | GOALS | NEW ARRIVALS | BEST SELLERS | OFFERS | ABOUT | CONTACT`);
}

main()
  .catch((e) => {
    console.error("Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
