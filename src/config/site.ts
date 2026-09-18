export const SITE_CONFIG = {
  name: "AMAZON SELLER",
  tagline: "UP TO 70% OFF ON AMAZON DEALS",
  subtagline: "Discover trending products, limited-time offers and handpicked Amazon deals worth checking out.",
  announcement: "🔥 Great Amazon Deals • Up to 70% Off • Limited-Time Finds",
  
  // WhatsApp Configuration - Centralized
  whatsapp: {
    rawNumber: "+91 75030 28035",
    linkNumber: "917503028035",
    defaultMessage: "Hi, I am interested in checking out deals on AMAZON SELLER.",
  },

  // Fixed exact 9 categories
  categories: [
    "Electronic",
    "Personal Care",
    "Crockery",
    "Toys",
    "Baby Toys",
    "Cars",
    "Sliders",
    "Swing",
    "Bikes"
  ] as const,

  // Configurable Admin Credentials (overridable via process.env)
  admin: {
    username: process.env.ADMIN_ID || "admin1",
    password: process.env.ADMIN_PASSWORD || "1!admin",
  }
};

export type CategoryName = typeof SITE_CONFIG.categories[number];
