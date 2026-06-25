import {
  makeRng,
  pick,
  pickMany,
  range,
  chance,
  roundTo,
  cover,
  photo,
  avatar,
  isoDate,
} from "./rng";
import { DIRECTIONS, REGIONS, DISTRICTS } from "../constants";
import { packageRegions, packagePriceInRegion } from "../pricing";
import type {
  Account,
  Order,
  OrderStatus,
  PriceType,
  Provider,
  RegionPrice,
  Review,
  Service,
  ServicePackage,
  ServiceStatus,
} from "../types";

/* ---------- Ism manbalari ---------- */
const FIRST_M = ["Bobur","Sardor","Jasur","Aziz","Doston","Bekzod","Otabek","Sherzod","Ulug'bek","Javohir","Akmal","Diyor","Sanjar","Temur","Farrux","Shoxrux","Rustam","Kamron","Islom","Shaxzod"];
const FIRST_F = ["Dilnoza","Madina","Sevara","Nilufar","Gulnora","Zarina","Malika","Shahnoza","Kamola","Lola","Feruza","Munisa","Charos","Dildora","Oysha","Nigora","Sitora","Robiya"];
const LAST = ["Karimov","Yusupov","Rahimov","Tojiyev","Aliyev","Saidov","Ergashev","Qodirov","Mirzayev","Abdullayev","Yo'ldoshev","Nazarov","Ismoilov","Tursunov","Xolmatov","Rashidov","Umarov","G'aniyev"];

/* Yo'nalish bo'yicha narx oralig'i (so'm) */
const PRICE_RANGE: Record<string, [number, number]> = {
  // To'y va Marosimlar
  boshlovchi: [2_000_000, 6_000_000],
  xonanda: [3_000_000, 12_000_000],
  "karnay-surnay": [2_000_000, 7_000_000],
  "foto-video-toy": [2_000_000, 8_000_000],
  dekoratsiya: [2_000_000, 10_000_000],
  // Konsert va Tomoshalar
  estrada: [5_000_000, 20_000_000],
  ovoz: [2_000_000, 7_000_000],
  yoritish: [2_500_000, 9_000_000],
  "sahna-jihoz": [4_000_000, 18_000_000],
  raqs: [3_000_000, 9_000_000],
  // Milliy Madaniyat
  folklor: [4_000_000, 11_000_000],
  baxshi: [2_500_000, 8_000_000],
  maqom: [3_000_000, 9_000_000],
  "milliy-raqs": [3_000_000, 9_000_000],
  // Korporativ Tadbirlar
  moderator: [2_500_000, 8_000_000],
  dj: [2_000_000, 8_000_000],
  "foto-video-korp": [2_500_000, 9_000_000],
  // Festival va Forumlar
  artist: [6_000_000, 25_000_000],
  hostess: [1_000_000, 4_000_000],
  tarjimon: [1_500_000, 5_000_000],
  texnik: [3_000_000, 12_000_000],
};

/* Yo'nalish bo'yicha xizmat sarlavhalari */
const TITLES: Record<string, string[]> = {
  boshlovchi: ["Professional to'y boshlovchisi", "Korporativ tadbir boshlovchisi", "Bayram tadbiri boshlovchisi"],
  xonanda: ["To'ylar uchun xonanda", "Milliy qo'shiqlar ustasi", "Restoran dasturi xonandasi"],
  "karnay-surnay": ["Karnay-surnay ansambli", "Doira va childirma", "An'anaviy cholg'u dasturi"],
  "foto-video-toy": ["To'y foto va video xizmati", "Love Story suratga olish", "Dron bilan suratga olish"],
  dekoratsiya: ["Sahna va zal bezash", "Gul kompozitsiyalari", "Fotozona dizayni", "Yoritish va dekor"],
  estrada: ["Estrada konsert dasturi", "Yulduz xonanda chiqishi", "Korporativ konsert dasturi"],
  ovoz: ["Tovush kuchaytirgich xizmati", "Konsert ovoz tizimi", "Sahna ovozini sozlash", "Karaoke tizimi"],
  yoritish: ["Professional yoritish", "Sahna yoritish tizimi", "Lazer va yoritish shou", "LED ekran va yoritish"],
  "sahna-jihoz": ["Festival sahnasi", "Sahna konstruksiyasi", "Konsert sahnasi bezagi", "Modul sahna tizimi"],
  raqs: ["Zamonaviy shou-balet", "Raqs jamoasi chiqishi", "Konsert raqs dasturi"],
  folklor: ["Milliy folklor jamoasi", "Xalq qo'shiqlari ansambli", "An'anaviy folklor dasturi"],
  baxshi: ["Baxshi dasturi", "Doston ijrosi", "Xalq baxshisi", "An'anaviy doston kechasi"],
  maqom: ["Shashmaqom ansambli", "Mumtoz musiqa ijrosi", "Maqom yo'llari dasturi"],
  "milliy-raqs": ["Lazgi raqs guruhi", "Milliy raqs jamoasi", "An'anaviy raqs dasturi"],
  moderator: ["Konferensiya moderatori", "Korporativ tadbir moderatori", "Forum boshlovchisi"],
  dj: ["Tadbir DJ xizmati", "Klub DJ dasturi", "Korporativ DJ va ovoz"],
  "foto-video-korp": ["Korporativ foto va video", "Tadbir reportaji", "Reklama videosi"],
  artist: ["Taniqli artist chiqishi", "Festival yulduzi dasturi", "Maxsus mehmon artist"],
  hostess: ["Tadbir hostess xizmati", "Ko'rgazma hostesslari", "VIP mehmonlar hostessi"],
  tarjimon: ["Sinxron tarjima xizmati", "Ketma-ket tarjima", "Forum tarjimoni"],
  texnik: ["Festival texnik ta'minoti", "Sahna texnik xizmati", "To'liq texnik jihozlash"],
};

const PACKAGE_TITLES = [
  "Premium To'y to'plami",
  "Standart Marosim paketi",
  "VIP Tadbir to'plami",
  "Milliy bayram dasturi",
  "Yubiley kechasi to'plami",
  "Korporativ tadbir paketi",
  "To'liq xizmat to'plami",
];

const GROUP_NAMES = ["Navro'z","Bahor","Sado","Diyor","Lazgi","Oltin","Mumtoz","Iftixor","Munojot","Sharq","Yulduz","Dilxiroj"];
const ORG_NAMES = [
  "Marvarid Event","Elegant Decor Studio","Farg'ona Sahnasi","Premium Sound Group",
  "Madaniyat saroyi","Sharq San'at studiyasi","Bahor konsert agentligi","Navqiron Art",
  "Oltin Lahza Production","Grand Event Agency","Royal Wedding Studio","Lazgi Dance Company",
  "Mumtoz Maqom Ansambli","Yulduz Show Production","Toshkent Light Systems","Festival Pro Group",
  "Diyor Folklor Markazi","Imperial Decor","Sound & Vision Studio","Star Artists Agency",
];

const BIOS = [
  "10 yildan ortiq tajriba. Toshkent va viloyatlarda 500 dan ortiq tadbir o'tkazgan.",
  "Mijozlar ehtiyojiga moslashgan yondashuv va yuqori sifat kafolati.",
  "Zamonaviy jihozlar va professional jamoa bilan unutilmas tadbir.",
  "Milliy an'analar va zamonaviy uslublarni uyg'unlashtiruvchi xizmat.",
  "Har bir tadbirga individual yondashuv, ijodiy va mas'uliyatli ish.",
];

const REVIEW_TEXTS = [
  "Juda professional jamoa, tadbirimiz a'lo darajada o'tdi. Rahmat!",
  "Hammasi vaqtida va sifatli bajarildi. Albatta tavsiya qilaman.",
  "Mehmonlarimiz juda mamnun bo'lishdi. Yana murojaat qilamiz.",
  "Narxi sifatga mos. Mas'uliyatli va ochiq munosabat.",
  "Kichik kamchiliklar bo'ldi-yu, umuman olganda yaxshi xizmat.",
  "Eng yaxshi tanlov! Professional va e'tiborli yondashuv.",
  "To'yimiz esda qolarli bo'ldi, ish sifatidan juda mamnunmiz.",
];

const ORDER_NOTES = [
  "200 kishilik to'y marosimi, kechki dastur.",
  "Korporativ tadbir, 3 soatlik dastur kerak.",
  "Yubiley kechasi, milliy va zamonaviy uslublar.",
  "Nikoh to'yi, ertalabki marosim.",
  "Bolalar bayrami uchun quvnoq dastur.",
  "",
];

function fullName(rng: () => number): string {
  const female = chance(rng, 0.45);
  const first = pick(rng, female ? FIRST_F : FIRST_M);
  return `${first} ${pick(rng, LAST)}`;
}

function baseFor(rng: () => number, directionId: string): number {
  const [min, max] = PRICE_RANGE[directionId] ?? [2_000_000, 8_000_000];
  return roundTo(range(rng, min, max), 100_000);
}

/** Taqdimotchi xizmat ko'rsatadigan hududlar (uy hududi + bir nechta qo'shimcha). */
function pickOperatingRegions(rng: () => number, home: string): string[] {
  const others = REGIONS.filter((r) => r !== home);
  const extra = pickMany(rng, others, range(rng, 4, 8));
  return [home, ...extra];
}

/** Xizmat uchun hudud narxlari: operatsion hududlarning kichik to'plami. */
function makeRegionPrices(rng: () => number, directionId: string, operating: string[]): RegionPrice[] {
  const base = baseFor(rng, directionId);
  const count = range(rng, Math.min(3, operating.length), operating.length);
  const regions = pickMany(rng, operating, count);
  return regions.map((region) => ({
    region,
    price: roundTo(range(rng, Math.round(base * 0.85), Math.round(base * 1.25)), 100_000),
  }));
}

// Jamoa (shaxs emas) nomi bilan ataladigan yo'nalishlar
const GROUP_DIRS = new Set(["raqs", "milliy-raqs", "folklor", "maqom", "karnay-surnay"]);
const isGroupDir = (id: string) => GROUP_DIRS.has(id);

/* ============================================================
   1. Individual taqdimotchilar
   ============================================================ */
interface BuildState {
  providers: Provider[];
  /** providerId → operatsion hududlar */
  opRegions: Record<string, string[]>;
}

function buildIndividuals(): BuildState {
  const rng = makeRng(101);
  const providers: Provider[] = [];
  const opRegions: Record<string, string[]> = {};
  let n = 1;
  for (const dir of DIRECTIONS) {
    const perDir = range(rng, 2, 3); // ponytail: 21 yo'nalish × 2-3 ≈ 50 individual taqdimotchi
    for (let i = 0; i < perDir; i++) {
      const region = pick(rng, REGIONS);
      const district = pick(rng, DISTRICTS[region] ?? ["Markaz"]);
      const id = `p${n}`;
      const name = isGroupDir(dir.id)
        ? `"${pick(rng, GROUP_NAMES)}" ${dir.name.toLowerCase()}`
        : fullName(rng);
      providers.push({
        id,
        name,
        type: "individual",
        directionId: dir.id,
        region,
        district,
        avatar: avatar(n),
        cover: cover(`prov-${n}`),
        bio: pick(rng, BIOS),
        gallery: Array.from({ length: range(rng, 4, 8) }, (_, g) => photo(`g-${n}-${g}`)),
        rating: roundTo(range(rng, 38, 50) / 10, 0.1),
        reviewCount: range(rng, 8, 140),
        startingPrice: baseFor(rng, dir.id),
        verified: chance(rng, 0.65),
        completedOrders: range(rng, 12, 320),
        memberSince: isoDate(-range(rng, 200, 1400)),
      });
      opRegions[id] = pickOperatingRegions(rng, region);
      n++;
    }
  }
  return { providers, opRegions };
}

/* ============================================================
   2. Tashkilot taqdimotchilari (individuallardan jamoa to'playdi)
   ============================================================ */
function buildOrganizations(state: BuildState): Provider[] {
  const rng = makeRng(202);
  const orgs: Provider[] = [];
  let n = 1;
  for (const orgName of ORG_NAMES) {
    const id = `o${n}`;
    const dir = pick(rng, DIRECTIONS);
    const region = pick(rng, REGIONS);
    const district = pick(rng, DISTRICTS[region] ?? ["Markaz"]);
    orgs.push({
      id,
      name: orgName,
      type: "organization",
      directionId: dir.id,
      region,
      district,
      avatar: avatar(50 + n),
      cover: cover(`org-${n}`),
      bio: "Madaniy tadbirlarni tashkil etuvchi tajribali jamoa. Zamonaviy jihozlar va professional yondashuv bilan yuqori sifatli xizmatlarni taklif etadi.",
      gallery: Array.from({ length: range(rng, 4, 6) }, (_, g) => photo(`og-${n}-${g}`)),
      rating: roundTo(range(rng, 40, 50) / 10, 0.1),
      reviewCount: range(rng, 20, 180),
      startingPrice: baseFor(rng, dir.id),
      verified: chance(rng, 0.75),
      completedOrders: range(rng, 40, 500),
      memberSince: isoDate(-range(rng, 300, 1600)),
      phone: `+998 90 ${range(rng, 100, 999)} ${range(rng, 10, 99)} ${range(rng, 10, 99)}`,
      email: `info@${orgName.toLowerCase().replace(/[^a-z]+/g, "")}.uz`,
      responsiblePerson: fullName(rng),
      taxId: `${range(rng, 200, 309)}${range(rng, 100000, 999999)}`,
    });
    state.opRegions[id] = pickOperatingRegions(rng, region);
    n++;
  }
  return orgs;
}

/* ============================================================
   3. Xizmatlar
   ============================================================ */
function makeService(
  rng: () => number,
  id: string,
  owner: Provider,
  performer: Provider,
  operating: string[],
  status: ServiceStatus,
): Service {
  const dir = performer.directionId;
  const titles = TITLES[dir] ?? ["Madaniy xizmat"];
  const reviewCount = status === "PUBLISHED" ? range(rng, 0, 60) : 0;
  const priceType: PriceType = chance(rng, 0.2) ? "negotiable" : "fixed";
  return {
    id,
    title: pick(rng, titles),
    directionId: dir,
    providerId: owner.id,
    performerId: performer.id,
    region: performer.region,
    district: performer.district,
    description:
      "Ushbu xizmat har qanday tadbirni yodda qoladigan voqeaga aylantiradi. Tajribali jamoa, zamonaviy jihozlar va mijozga individual yondashuv kafolatlanadi. Narx tanlangan hududga qarab belgilanadi.",
    images: Array.from({ length: range(rng, 3, 6) }, (_, g) => photo(`svc-${id}-${g}`)),
    regionPrices: makeRegionPrices(rng, dir, operating),
    priceType,
    rating: reviewCount > 0 ? roundTo(range(rng, 40, 50) / 10, 0.1) : 0,
    reviewCount,
    status,
    rejectionReason:
      status === "ADMIN_REJECTED" || status === "MINISTRY_REJECTED"
        ? pick(rng, [
            "Rasm sifati talabga javob bermaydi. Iltimos, aniqroq suratlar yuklang.",
            "Tavsif to'liq emas. Xizmat tarkibini batafsil yozing.",
            "Hudud narxlari noaniq. Narxlarni aniqlashtiring.",
          ])
        : undefined,
    featured: status === "PUBLISHED" && chance(rng, 0.25),
    createdAt: isoDate(-range(rng, 1, 120)),
  };
}

function rollStatus(rng: () => number, pendingBias: boolean): ServiceStatus {
  const r = rng();
  // pendingBias = ko'proq navbatdagi (admin/vazirlik) xizmatlar — demo uchun ikkala navbat ham to'ladi.
  if (pendingBias) {
    if (r < 0.3) return "PENDING_ADMIN_REVIEW";
    if (r < 0.55) return "PENDING_MINISTRY_APPROVAL";
    if (r < 0.85) return "PUBLISHED";
    if (r < 0.95) return "ADMIN_REJECTED";
    return "DRAFT";
  }
  if (r < 0.68) return "PUBLISHED";
  if (r < 0.78) return "PENDING_ADMIN_REVIEW";
  if (r < 0.88) return "PENDING_MINISTRY_APPROVAL";
  if (r < 0.94) return "ADMIN_REJECTED";
  return "DRAFT";
}

function buildServices(allProviders: Provider[], opRegions: Record<string, string[]>): Service[] {
  const rng = makeRng(303);
  const out: Service[] = [];
  let n = 1;
  // Barcha taqdimotchilar (individual va tashkilot) bir xil tarzda o'z xizmatlarini yaratadi
  for (const p of allProviders) {
    const isOrg = p.type === "organization";
    // ko'proq xizmat → marketplace to'la + ko'proq provider jamlanma sharti (≥2)ga mos keladi
    const count = isOrg ? range(rng, 3, 5) : range(rng, 2, 3);
    for (let i = 0; i < count; i++) {
      out.push(
        makeService(rng, `s${n}`, p, p, opRegions[p.id] ?? [p.region], rollStatus(rng, isOrg)),
      );
      n++;
    }
  }
  return out;
}

/* ============================================================
   4. Jamlanmalar (paketlar)
   ============================================================ */
function buildPackages(providers: Provider[], services: Service[]): ServicePackage[] {
  const rng = makeRng(707);
  const getService = (id: string) => services.find((s) => s.id === id);
  const out: ServicePackage[] = [];
  let n = 1;

  for (const owner of providers) {
    if (out.length >= 20) break; // ponytail: spec 20 ta jamlanma
    const ownServices = services.filter((s) => s.providerId === owner.id && s.status === "PUBLISHED");
    if (ownServices.length < 2) continue;
    // Tashkilotlar har doim, individuallar ~65% jamlanma yaratadi
    if (owner.type === "individual" && !chance(rng, 0.65)) continue;

    // hududlar kesishmasini saqlab qoladigan a'zolarni tanlash
    const shuffled = pickMany(rng, ownServices, ownServices.length);
    const chosen: Service[] = [];
    for (const svc of shuffled) {
      const trial = [...chosen, svc];
      if (packageRegions(trial.map((s) => s.id), getService).length > 0) chosen.push(svc);
      if (chosen.length >= range(rng, 2, 4)) break;
    }
    if (chosen.length < 2) continue;

    const status = rollStatus(rng, owner.type === "organization");
    const reviewCount = status === "PUBLISHED" ? range(rng, 0, 30) : 0;
    out.push({
      id: `pkg${n}`,
      title: pick(rng, PACKAGE_TITLES),
      providerId: owner.id,
      performerId: owner.type === "individual" ? owner.id : undefined,
      serviceIds: chosen.map((s) => s.id),
      description:
        "Tadbiringiz uchun bir nechta xizmatni yagona to'plamda taklif etamiz. Har bir xizmat alohida tanlangandan ko'ra qulayroq va muvofiqlashtirilgan.",
      images: chosen[0].images.slice(0, 1),
      rating: reviewCount > 0 ? roundTo(range(rng, 42, 50) / 10, 0.1) : 0,
      reviewCount,
      status,
      rejectionReason:
        status === "ADMIN_REJECTED" || status === "MINISTRY_REJECTED"
          ? "To'plam tarkibi yoki narxlari aniq emas. Iltimos, xizmatlarni qayta ko'rib chiqing."
          : undefined,
      featured: status === "PUBLISHED" && chance(rng, 0.3),
      createdAt: isoDate(-range(rng, 1, 90)),
    });
    n++;
  }
  return out;
}

/* ============================================================
   5. Sharhlar
   ============================================================ */
function buildReviews(services: Service[]): Review[] {
  const rng = makeRng(404);
  const out: Review[] = [];
  let n = 1;
  for (const s of services) {
    if (s.status !== "PUBLISHED") continue;
    const count = Math.min(s.reviewCount, range(rng, 0, 5));
    for (let i = 0; i < count; i++) {
      out.push({
        id: `rv${n}`,
        serviceId: s.id,
        providerId: s.providerId,
        authorId: `guest-${n}`,
        authorName: fullName(rng),
        authorAvatar: avatar(n + 7),
        rating: range(rng, 4, 5),
        text: pick(rng, REVIEW_TEXTS),
        status: chance(rng, 0.92) ? "visible" : "hidden",
        createdAt: isoDate(-range(rng, 1, 90)),
      });
      n++;
    }
  }
  return out;
}

/* ============================================================
   6. Hisoblar (demo + foydalanuvchilar)
   ============================================================ */
function buildAccounts(providers: Provider[]): Account[] {
  const rng = makeRng(505);
  const demoIndividual = providers.find((p) => p.type === "individual")!;
  const demoOrg = providers.find((p) => p.type === "organization")!;

  const accounts: Account[] = [
    {
      id: "acc-user",
      fullName: "Dilshod Yusupov",
      email: "user@madaniy.uz",
      phone: "+998 90 123 45 67",
      password: "12345678",
      role: "user",
      avatar: avatar(3),
      region: "Toshkent shahri",
      status: "active",
      createdAt: isoDate(-120),
    },
    {
      id: "acc-provider",
      fullName: demoIndividual.name,
      email: "provider@madaniy.uz",
      phone: "+998 90 222 33 44",
      password: "12345678",
      role: "provider",
      avatar: demoIndividual.avatar,
      region: demoIndividual.region,
      status: "active",
      createdAt: demoIndividual.memberSince,
      providerId: demoIndividual.id,
    },
    {
      id: "acc-org",
      fullName: demoOrg.name,
      email: "org@madaniy.uz",
      phone: demoOrg.phone ?? "+998 71 200 11 22",
      password: "12345678",
      role: "provider",
      avatar: demoOrg.avatar,
      region: demoOrg.region,
      status: "active",
      createdAt: demoOrg.memberSince,
      providerId: demoOrg.id,
    },
    {
      id: "acc-admin",
      fullName: "Administrator",
      email: "admin@madaniy.uz",
      phone: "+998 71 200 00 00",
      password: "12345678",
      role: "admin",
      avatar: avatar(60),
      region: "Toshkent shahri",
      status: "active",
      createdAt: isoDate(-1000),
    },
    {
      id: "acc-ministry",
      fullName: "Vazirlik koordinatori",
      email: "vazirlik@madaniy.uz",
      phone: "+998 71 200 55 55",
      password: "12345678",
      role: "ministry",
      avatar: avatar(52),
      region: "Toshkent shahri",
      status: "active",
      createdAt: isoDate(-900),
    },
  ];

  for (let i = 0; i < 14; i++) {
    const region = pick(rng, REGIONS);
    accounts.push({
      id: `acc-u${i + 1}`,
      fullName: fullName(rng),
      email: `user${i + 1}@mail.uz`,
      phone: `+998 9${range(rng, 0, 9)} ${range(rng, 100, 999)} ${range(rng, 10, 99)} ${range(rng, 10, 99)}`,
      password: "12345678",
      role: "user",
      avatar: avatar(i + 12),
      region,
      status: chance(rng, 0.9) ? "active" : "blocked",
      createdAt: isoDate(-range(rng, 5, 400)),
    });
  }
  return accounts;
}

/* ============================================================
   7. Buyurtmalar (xizmat + jamlanma)
   ============================================================ */
function buildOrders(
  services: Service[],
  packages: ServicePackage[],
  accounts: Account[],
): Order[] {
  const rng = makeRng(606);
  const getService = (id: string) => services.find((s) => s.id === id);
  const approvedServices = services.filter((s) => s.status === "PUBLISHED" && s.regionPrices.length > 0);
  const approvedPackages = packages.filter((p) => p.status === "PUBLISHED");
  const users = accounts.filter((a) => a.role === "user");
  const statuses: OrderStatus[] = ["pending", "accepted", "rejected", "completed", "cancelled"];
  const out: Order[] = [];

  const makeServiceOrder = (id: string, svc: Service, u: Account, status: OrderStatus): Order => {
    const region = pick(rng, svc.regionPrices).region;
    const negotiated = svc.priceType === "negotiable";
    const price = svc.regionPrices.find((rp) => rp.region === region)?.price ?? 0;
    const past = status === "completed";
    return {
      id,
      kind: "service",
      serviceId: svc.id,
      serviceTitle: svc.title,
      customerId: u.id,
      customerName: u.fullName,
      customerPhone: u.phone,
      providerId: svc.providerId,
      eventDate: isoDate(past ? -range(rng, 5, 60) : range(rng, 3, 90)),
      region,
      address: `${pick(rng, DISTRICTS[region] ?? ["Markaz"])} tumani, ${range(rng, 1, 120)}-uy`,
      note: pick(rng, ORDER_NOTES),
      amount: negotiated ? 0 : price,
      priceType: svc.priceType,
      negotiated,
      status,
      rejectionReason:
        status === "rejected" ? "Belgilangan sanada band, boshqa kun taklif qilamiz." : undefined,
      createdAt: isoDate(-range(rng, 1, 70)),
    };
  };

  for (let i = 0; i < 48 && approvedServices.length; i++) {
    const s = pick(rng, approvedServices);
    out.push(makeServiceOrder(`ord${i + 1}`, s, pick(rng, users), pick(rng, statuses)));
  }

  // Jamlanma buyurtmalari
  let pn = 1;
  for (const pkg of approvedPackages.slice(0, 18)) {
    const regions = packageRegions(pkg.serviceIds, getService);
    if (!regions.length) continue;
    const region = pick(rng, regions);
    const u = pick(rng, users);
    const sum = packagePriceInRegion(pkg.serviceIds, getService, region) ?? 0;
    const negotiated = pkg.serviceIds.some((id) => getService(id)?.priceType === "negotiable");
    const status = pick(rng, statuses);
    out.push({
      id: `ordpkg${pn++}`,
      kind: "package",
      serviceId: pkg.id,
      serviceTitle: pkg.title,
      packageId: pkg.id,
      customerId: u.id,
      customerName: u.fullName,
      customerPhone: u.phone,
      providerId: pkg.providerId,
      eventDate: isoDate(status === "completed" ? -range(rng, 5, 50) : range(rng, 3, 80)),
      region,
      address: `${pick(rng, DISTRICTS[region] ?? ["Markaz"])} tumani, ${range(rng, 1, 120)}-uy`,
      note: pick(rng, ORDER_NOTES),
      amount: negotiated ? 0 : sum,
      priceType: negotiated ? "negotiable" : "fixed",
      negotiated,
      status,
      createdAt: isoDate(-range(rng, 1, 60)),
    });
  }

  // Demo foydalanuvchiga kafolatlangan buyurtmalar
  const demoUser = accounts.find((a) => a.id === "acc-user")!;
  for (let i = 0; i < 3 && approvedServices[i]; i++) {
    const o = makeServiceOrder(
      `ord-demo${i + 1}`,
      approvedServices[i],
      demoUser,
      (["pending", "accepted", "completed"] as OrderStatus[])[i],
    );
    out.push(o);
  }
  return out;
}

/* ============================================================
   Yig'ilgan ma'lumotlar bazasi (deterministik)
   ============================================================ */
const individualState = buildIndividuals();
export const organizationProviders = buildOrganizations(individualState);
export const providers: Provider[] = [...individualState.providers, ...organizationProviders];
export const services = buildServices(providers, individualState.opRegions);
export const packages = buildPackages(providers, services);
export const reviews = buildReviews(services);
export const accounts = buildAccounts(providers);
export const orders = buildOrders(services, packages, accounts);

export const providerMap: Record<string, Provider> = Object.fromEntries(
  providers.map((p) => [p.id, p]),
);
export const serviceMap: Record<string, Service> = Object.fromEntries(
  services.map((s) => [s.id, s]),
);
export const packageMap: Record<string, ServicePackage> = Object.fromEntries(
  packages.map((p) => [p.id, p]),
);
