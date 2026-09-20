// Seed script for Prisma database (Lunara Fashion)

export const categoriesSeed = [
  { name: "3 Piece", nameBn: "থ্রি-পিস", slug: "3-piece", description: "Designer Pakistani & Bangladeshi Lawn, Cotton & Georgette Three Piece sets." },
  { name: "Kameez", nameBn: "কামিজ", slug: "kameez", description: "Elegant single piece embroidered and printed kurtis & kameez." },
  { name: "Saree", nameBn: "শাড়ি", slug: "saree", description: "Traditional Jamdani, Katan, Muslin, Silk and Georgette party sarees." },
  { name: "Hijab", nameBn: "হিজাব", slug: "hijab", description: "Premium chiffon, modal, jersey and silk hijabs with non-slip textures." },
  { name: "Abaya", nameBn: "আবায়া", slug: "abaya", description: "Modest Dubai and Turkish style borka, kimonos and abayas." },
  { name: "Kurti", nameBn: "কুর্তি", slug: "kurti", description: "Casual and semi-formal trendy tunics and festive kurtis." },
  { name: "Salwar Kameez", nameBn: "সেলোয়ার কামিজ", slug: "salwar-kameez", description: "Classic ethnic matching salwar suits with intricate zori embroidery." },
  { name: "Bags", nameBn: "ব্যাগ", slug: "bags", description: "Luxury party clutches, totes and cross-body bags for women." },
  { name: "Jewellery", nameBn: "গহনা", slug: "jewellery", description: "Kundan, meenakari, pearl and antique gold plated jewellery sets." },
  { name: "Shoes", nameBn: "জুতা", slug: "shoes", description: "Festive kolhapuris, pointed kitten heels and comfortable flats." },
  { name: "Accessories", nameBn: "এক্সেসরিজ", slug: "accessories", description: "Hair accessories, hijab pins, scrunchies and brooches." }
];

export const couponsSeed = [
  { code: "LUNARA10", type: "PERCENTAGE", discount: 10, minOrder: 1500, maxDiscount: 500, isActive: true },
  { code: "EIDSPECIAL", type: "FIXED_AMOUNT", discount: 300, minOrder: 3000, isActive: true },
  { code: "FIRSTORDER", type: "PERCENTAGE", discount: 15, minOrder: 1200, maxDiscount: 400, isActive: true }
];

console.log("Database seed schema ready for Prisma deployment.");
