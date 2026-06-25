import type {
  Category,
  Direction,
  Role,
  ServiceStatus,
  OrderStatus,
  ProviderType,
  PriceType,
} from "./types";

export const APP_NAME = "Madaniy Xizmatlar";
export const APP_TAGLINE = "Madaniyat, konsert va tadbir xizmatlarini bron qilish platformasi";

/* ============================================================
   Taksonomiya: Kategoriya → Yo'nalish
   ============================================================ */

export const CATEGORIES: Category[] = [
  {
    id: "toy-marosim",
    name: "To'y va Marosimlar",
    slug: "toy-marosim",
    icon: "Gem",
    description: "To'y, nikoh va marosimlar: boshlovchi, xonanda, karnay-surnay, foto/video, dekoratsiya",
    color: "from-primary-100 to-primary-50 text-primary",
  },
  {
    id: "konsert-tomosha",
    name: "Konsert va Tomoshalar",
    slug: "konsert-tomosha",
    icon: "PartyPopper",
    description: "Estrada, ovoz, yoritish, sahna va raqs — konsert va tomoshalar uchun",
    color: "from-secondary-100 to-secondary-50 text-secondary",
  },
  {
    id: "milliy-madaniyat",
    name: "Milliy Madaniyat",
    slug: "milliy-madaniyat",
    icon: "Drum",
    description: "Folklor, baxshichilik, maqom va milliy raqs san'ati",
    color: "from-accent-100 to-accent-50 text-accent-600",
  },
  {
    id: "korporativ",
    name: "Korporativ Tadbirlar",
    slug: "korporativ",
    icon: "Briefcase",
    description: "Korporativ tadbirlar: moderatorlar, DJ va foto/video xizmatlari",
    color: "from-secondary-100 to-secondary-50 text-secondary",
  },
  {
    id: "festival-forum",
    name: "Festival va Forumlar",
    slug: "festival-forum",
    icon: "Sparkles",
    description: "Festival va forumlar: artistlar, hostess, tarjimon va texnik xizmatlar",
    color: "from-primary-100 to-primary-50 text-primary",
  },
];

export const CATEGORY_MAP: Record<string, Category> = Object.fromEntries(
  CATEGORIES.map((c) => [c.id, c]),
);

export const DIRECTIONS: Direction[] = [
  // To'y va Marosimlar
  { id: "boshlovchi", categoryId: "toy-marosim", name: "Boshlovchilar", slug: "boshlovchi", icon: "Mic", description: "Tadbirlaringizni boshqaruvchi tajribali boshlovchilar" },
  { id: "xonanda", categoryId: "toy-marosim", name: "Xonandalar", slug: "xonanda", icon: "Mic2", description: "To'y va tadbirlar uchun professional xonandalar" },
  { id: "karnay-surnay", categoryId: "toy-marosim", name: "Karnay Surnay", slug: "karnay-surnay", icon: "Music", description: "An'anaviy karnay-surnay va milliy cholg'u ansambllari" },
  { id: "foto-video-toy", categoryId: "toy-marosim", name: "Foto Video", slug: "foto-video-toy", icon: "Camera", description: "To'y va marosim foto hamda videosurati" },
  { id: "dekoratsiya", categoryId: "toy-marosim", name: "Dekoratsiya", slug: "dekoratsiya", icon: "Flower2", description: "Sahna va zal bezash, gul kompozitsiyalari" },
  // Konsert va Tomoshalar
  { id: "estrada", categoryId: "konsert-tomosha", name: "Estrada Xonandalari", slug: "estrada", icon: "Radio", description: "Konsert va tomoshalar uchun estrada xonandalari" },
  { id: "ovoz", categoryId: "konsert-tomosha", name: "Ovoz Texnikasi", slug: "ovoz", icon: "Volume2", description: "Tovush kuchaytirgich va musiqa jihozlari" },
  { id: "yoritish", categoryId: "konsert-tomosha", name: "Yoritish", slug: "yoritish", icon: "Lightbulb", description: "Professional yoritish va lazer shou tizimlari" },
  { id: "sahna-jihoz", categoryId: "konsert-tomosha", name: "Sahna Jihozlari", slug: "sahna-jihoz", icon: "Theater", description: "Sahna konstruksiyasi, bezagi va jihozlari" },
  { id: "raqs", categoryId: "konsert-tomosha", name: "Raqs Jamoalari", slug: "raqs", icon: "Drama", description: "Zamonaviy shou-balet va raqs jamoalari" },
  // Milliy Madaniyat
  { id: "folklor", categoryId: "milliy-madaniyat", name: "Folklor", slug: "folklor", icon: "Users", description: "Milliy folklor va xalq ijodi jamoalari" },
  { id: "baxshi", categoryId: "milliy-madaniyat", name: "Baxshichilik", slug: "baxshi", icon: "Drum", description: "Baxshi, doston va xalq og'zaki ijodi ustalari" },
  { id: "maqom", categoryId: "milliy-madaniyat", name: "Maqom", slug: "maqom", icon: "Music", description: "Shashmaqom va mumtoz musiqa ansambllari" },
  { id: "milliy-raqs", categoryId: "milliy-madaniyat", name: "Milliy Raqslar", slug: "milliy-raqs", icon: "Sparkles", description: "Lazgi, an'anaviy va milliy raqs guruhlari" },
  // Korporativ Tadbirlar
  { id: "moderator", categoryId: "korporativ", name: "Moderatorlar", slug: "moderator", icon: "Megaphone", description: "Korporativ tadbir va konferensiya moderatorlari" },
  { id: "dj", categoryId: "korporativ", name: "DJ", slug: "dj", icon: "Disc3", description: "Tadbirlar uchun professional DJ xizmatlari" },
  { id: "foto-video-korp", categoryId: "korporativ", name: "Foto Video", slug: "foto-video-korp", icon: "Video", description: "Korporativ tadbir foto va videosurati" },
  // Festival va Forumlar
  { id: "artist", categoryId: "festival-forum", name: "Artistlar", slug: "artist", icon: "Star", description: "Festival va forumlar uchun taniqli artistlar" },
  { id: "hostess", categoryId: "festival-forum", name: "Hostess", slug: "hostess", icon: "Crown", description: "Tadbir va ko'rgazmalar uchun hostess xizmati" },
  { id: "tarjimon", categoryId: "festival-forum", name: "Tarjimonlar", slug: "tarjimon", icon: "MessageSquare", description: "Sinxron va ketma-ket tarjima xizmatlari" },
  { id: "texnik", categoryId: "festival-forum", name: "Texnik Xizmatlar", slug: "texnik", icon: "Headphones", description: "Festival va forumlar uchun texnik ta'minot" },
];

export const DIRECTION_MAP: Record<string, Direction> = Object.fromEntries(
  DIRECTIONS.map((d) => [d.id, d]),
);

/** Kategoriya id → unga tegishli yo'nalishlar */
export const DIRECTIONS_BY_CATEGORY: Record<string, Direction[]> = CATEGORIES.reduce(
  (acc, c) => {
    acc[c.id] = DIRECTIONS.filter((d) => d.categoryId === c.id);
    return acc;
  },
  {} as Record<string, Direction[]>,
);

/* ---------- Viloyatlar va tumanlar ---------- */
export const REGIONS = [
  "Toshkent shahri",
  "Toshkent viloyati",
  "Samarqand",
  "Buxoro",
  "Andijon",
  "Farg'ona",
  "Namangan",
  "Qashqadaryo",
  "Surxondaryo",
  "Xorazm",
  "Navoiy",
  "Jizzax",
  "Sirdaryo",
  "Qoraqalpog'iston",
] as const;

export const DISTRICTS: Record<string, string[]> = {
  "Toshkent shahri": [
    "Chilonzor",
    "Yunusobod",
    "Mirzo Ulug'bek",
    "Yashnobod",
    "Sergeli",
    "Shayxontohur",
    "Olmazor",
    "Uchtepa",
    "Yakkasaroy",
    "Bektemir",
  ],
  "Toshkent viloyati": ["Nurafshon", "Chirchiq", "Angren", "Bekobod", "Yangiyo'l", "Olmaliq"],
  Samarqand: ["Samarqand shahri", "Urgut", "Kattaqo'rg'on", "Bulung'ur", "Ishtixon"],
  Buxoro: ["Buxoro shahri", "G'ijduvon", "Kogon", "Vobkent", "Romitan"],
  Andijon: ["Andijon shahri", "Asaka", "Xonobod", "Shahrixon", "Marhamat"],
  "Farg'ona": ["Farg'ona shahri", "Marg'ilon", "Qo'qon", "Quvasoy", "Rishton"],
  Namangan: ["Namangan shahri", "Chust", "Pop", "Chortoq", "Uchqo'rg'on"],
  Qashqadaryo: ["Qarshi", "Shahrisabz", "Kitob", "G'uzor", "Koson"],
  Surxondaryo: ["Termiz", "Denov", "Sho'rchi", "Boysun", "Sherobod"],
  Xorazm: ["Urganch", "Xiva", "Hazorasp", "Shovot", "Gurlan"],
  Navoiy: ["Navoiy shahri", "Zarafshon", "Konimex", "Karmana"],
  Jizzax: ["Jizzax shahri", "G'allaorol", "Zomin", "Forish"],
  Sirdaryo: ["Guliston", "Yangiyer", "Sirdaryo", "Boyovut"],
  "Qoraqalpog'iston": ["Nukus", "Beruniy", "Xo'jayli", "Chimboy", "To'rtko'l"],
};

/* ---------- Tadbir turlari ---------- */
export const EVENT_TYPES = [
  "To'y marosimi",
  "Nikoh to'yi",
  "Yubiley",
  "Korporativ tadbir",
  "Konsert",
  "Milliy bayram",
  "Festival",
  "Ochilish marosimi",
  "Bolalar bayrami",
] as const;

/* ---------- Rol meta ma'lumotlari ---------- */
export const ROLE_LABELS: Record<Role, string> = {
  user: "Foydalanuvchi",
  provider: "Xizmat ko'rsatuvchi",
  ministry: "Vazirlik koordinatori",
  admin: "Administrator",
};

export const ROLE_HOME: Record<Role, string> = {
  user: "/kabinet/foydalanuvchi",
  provider: "/kabinet/taqdimotchi",
  ministry: "/vazirlik",
  admin: "/admin",
};

export const ROLE_ICONS: Record<Role, string> = {
  user: "User",
  provider: "Briefcase",
  ministry: "Landmark",
  admin: "ShieldCheck",
};

/* ---------- Taqdimotchi turi ---------- */
export const PROVIDER_TYPE_LABELS: Record<ProviderType, string> = {
  individual: "Individual ijrochi",
  organization: "Tashkilot",
};

/* ---------- Narx turi ---------- */
export const PRICE_TYPE_LABELS: Record<PriceType, string> = {
  fixed: "Belgilangan narx",
  negotiable: "Kelishuv asosida",
};

/* ---------- Holat yorliqlari ---------- */
export const SERVICE_STATUS_LABELS: Record<ServiceStatus, string> = {
  DRAFT: "Qoralama",
  PENDING_ADMIN_REVIEW: "Admin tekshiruvida",
  ADMIN_APPROVED: "Admin tasdiqladi",
  PENDING_MINISTRY_APPROVAL: "Vazirlik kelishuvida",
  MINISTRY_APPROVED: "Vazirlik kelishdi",
  PUBLISHED: "E'lon qilingan",
  ADMIN_REJECTED: "Admin rad etdi",
  MINISTRY_REJECTED: "Vazirlik rad etdi",
};

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "Kutilmoqda",
  accepted: "Qabul qilindi",
  rejected: "Rad etildi",
  completed: "Bajarildi",
  cancelled: "Bekor qilindi",
};

/* ---------- Narx oralig'i filtri uchun ---------- */
export const PRICE_MIN = 0;
export const PRICE_MAX = 30_000_000;
export const RATING_OPTIONS = [4.5, 4.0, 3.5, 3.0] as const;

/** Solishtirishga qo'shish chegarasi */
export const COMPARE_MAX = 4;
