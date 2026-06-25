import { avatar, photo, isoDate } from "./rng";
import type { Testimonial, UpcomingEvent } from "../types";

/* Foydalanuvchi fikrlari */
export const testimonials: Testimonial[] = [
  {
    id: "t1",
    name: "Sevara Karimova",
    role: "Kelin-kuyov",
    avatar: avatar(21),
    text: "To'yimiz uchun xonanda va fotografni shu platformadan topdik. Hammasi g'oyat darajada o'tdi, juda mamnunmiz!",
    rating: 5,
  },
  {
    id: "t2",
    name: "Bobur Aliyev",
    role: "Tadbir tashkilotchisi",
    avatar: avatar(22),
    text: "Korporativ tadbir uchun bir nechta ijrochini bir joyda solishtirib tanladim. Vaqtni juda tejadi.",
    rating: 5,
  },
  {
    id: "t3",
    name: "Madina Rahimova",
    role: "Yubiley egasi",
    avatar: avatar(23),
    text: "Raqs jamoasi va ovoz texnikasini oson buyurtma qildim. Narxlar shaffof, ishonchli platforma.",
    rating: 4,
  },
  {
    id: "t4",
    name: "Jasur Tojiyev",
    role: "Xizmat ko'rsatuvchi",
    avatar: avatar(24),
    text: "Ijrochi sifatida yangi buyurtmalar oldim. Profil va portfolio yuklash juda qulay.",
    rating: 5,
  },
];

/* Yaqinlashayotgan tadbirlar */
export const upcomingEvents: UpcomingEvent[] = [
  {
    id: "e1",
    title: "Navro'z bayrami konserti",
    date: isoDate(12),
    region: "Toshkent shahri",
    image: photo("ev-1"),
    category: "Konsert",
  },
  {
    id: "e2",
    title: "Milliy madaniyat festivali",
    date: isoDate(20),
    region: "Samarqand",
    image: photo("ev-2"),
    category: "Festival",
  },
  {
    id: "e3",
    title: "San'at studiyasi ochilishi",
    date: isoDate(28),
    region: "Buxoro",
    image: photo("ev-3"),
    category: "Ochilish marosimi",
  },
  {
    id: "e4",
    title: "Yoshlar ijodiyot kechasi",
    date: isoDate(35),
    region: "Andijon",
    image: photo("ev-4"),
    category: "Tadbir",
  },
];

/* "Qanday ishlaydi" qadamlari */
export const howItWorks = [
  {
    icon: "Search",
    title: "Qidiring",
    text: "Kategoriya, viloyat va narx bo'yicha mos madaniy xizmatni toping.",
  },
  {
    icon: "CalendarCheck",
    title: "Tanlang",
    text: "Portfolio, narxlar va sharhlarni ko'rib, eng yaxshisini tanlang.",
  },
  {
    icon: "Send",
    title: "Buyurtma bering",
    text: "Sana va manzilni kiriting, buyurtmangizni bir necha daqiqada yuboring.",
  },
  {
    icon: "PartyPopper",
    title: "Tadbirdan rohatlaning",
    text: "Ijrochi buyurtmani tasdiqlaydi va tadbiringizni unutilmas qiladi.",
  },
];
