import type { PersonalityType } from "@/shared/schemas/enums";

interface PersonalityBannerVariant {
  imageSrc: string;
}

const PERSONALITY_BANNER_VARIANTS: Record<
  PersonalityType,
  PersonalityBannerVariant
> = {
  INTJ: {
    imageSrc: "/profile-banners/intj.jpg",
  },
  INTP: {
    imageSrc: "/profile-banners/intp.jpg",
  },
  ENTJ: {
    imageSrc: "/profile-banners/entj.jpg",
  },
  ENTP: {
    imageSrc: "/profile-banners/entp.jpg",
  },
  INFJ: {
    imageSrc: "/profile-banners/infj.jpg",
  },
  INFP: {
    imageSrc: "/profile-banners/infp.jpg",
  },
  ENFJ: {
    imageSrc: "/profile-banners/enfj.jpg",
  },
  ENFP: {
    imageSrc: "/profile-banners/enfp.jpg",
  },
  ISTJ: {
    imageSrc: "/profile-banners/istj.jpg",
  },
  ISFJ: {
    imageSrc: "/profile-banners/isfj.jpg",
  },
  ESTJ: {
    imageSrc: "/profile-banners/estj.jpg",
  },
  ESFJ: {
    imageSrc: "/profile-banners/esfj.jpg",
  },
  ISTP: {
    imageSrc: "/profile-banners/istp.jpg",
  },
  ISFP: {
    imageSrc: "/profile-banners/isfp.jpg",
  },
  ESTP: {
    imageSrc: "/profile-banners/estp.jpg",
  },
  ESFP: {
    imageSrc: "/profile-banners/esfp.jpg",
  },
};

export function getPersonalityBannerVariant(type: PersonalityType | null) {
  return type ? PERSONALITY_BANNER_VARIANTS[type] : null;
}
