// src/app/fonts.ts
import { Figtree, PT_Sans } from "next/font/google";

const figtree = Figtree({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
});

const ptSans = PT_Sans({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-sans",
});

export const fontSans = figtree;
//export const fontSans = ptSans;

export const fonts = {
  figtree,
  ptSans,
};
