import enfjBanner from "@/assets/profile-banners/enfj.jpg";
import enfpBanner from "@/assets/profile-banners/enfp.jpg";
import entjBanner from "@/assets/profile-banners/entj.jpg";
import entpBanner from "@/assets/profile-banners/entp.jpg";
import esfjBanner from "@/assets/profile-banners/esfj.jpg";
import esfpBanner from "@/assets/profile-banners/esfp.jpg";
import estjBanner from "@/assets/profile-banners/estj.jpg";
import estpBanner from "@/assets/profile-banners/estp.jpg";
import infjBanner from "@/assets/profile-banners/infj.jpg";
import infpBanner from "@/assets/profile-banners/infp.jpg";
import intjBanner from "@/assets/profile-banners/intj.jpg";
import intpBanner from "@/assets/profile-banners/intp.jpg";
import isfjBanner from "@/assets/profile-banners/isfj.jpg";
import isfpBanner from "@/assets/profile-banners/isfp.jpg";
import istjBanner from "@/assets/profile-banners/istj.jpg";
import istpBanner from "@/assets/profile-banners/istp.jpg";
import type { PersonalityType } from "@/shared/schemas/enums";

interface PersonalityBannerVariant {
  imageSrc: string;
}

const PERSONALITY_BANNER_VARIANTS: Record<
  PersonalityType,
  PersonalityBannerVariant
> = {
  INTJ: {
    imageSrc: intjBanner,
  },
  INTP: {
    imageSrc: intpBanner,
  },
  ENTJ: {
    imageSrc: entjBanner,
  },
  ENTP: {
    imageSrc: entpBanner,
  },
  INFJ: {
    imageSrc: infjBanner,
  },
  INFP: {
    imageSrc: infpBanner,
  },
  ENFJ: {
    imageSrc: enfjBanner,
  },
  ENFP: {
    imageSrc: enfpBanner,
  },
  ISTJ: {
    imageSrc: istjBanner,
  },
  ISFJ: {
    imageSrc: isfjBanner,
  },
  ESTJ: {
    imageSrc: estjBanner,
  },
  ESFJ: {
    imageSrc: esfjBanner,
  },
  ISTP: {
    imageSrc: istpBanner,
  },
  ISFP: {
    imageSrc: isfpBanner,
  },
  ESTP: {
    imageSrc: estpBanner,
  },
  ESFP: {
    imageSrc: esfpBanner,
  },
};

export function getPersonalityBannerVariant(type: PersonalityType | null) {
  return type ? PERSONALITY_BANNER_VARIANTS[type] : null;
}
