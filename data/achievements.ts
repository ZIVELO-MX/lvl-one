import type { BadgeType } from "@/types/gamification";

export const ACHIEVEMENT_DEFS: Record<BadgeType, { label: string; description: string; icon: string; xpReward: number }> = {
  first_character: {
    label: "Primer Aventurero",
    description: "Creaste tu primer personaje",
    icon: "scroll",
    xpReward: 50,
  },
  first_campaign: {
    label: "Narrador Novato",
    description: "Creaste tu primera campaña",
    icon: "book",
    xpReward: 100,
  },
  first_level_up: {
    label: "¡A seguir creciendo!",
    description: "Subiste de nivel por primera vez",
    icon: "sparkles",
    xpReward: 75,
  },
  ten_sessions: {
    label: "Veterano de Mesa",
    description: "Completaste 10 sesiones",
    icon: "trophy",
    xpReward: 200,
  },
  five_characters: {
    label: "Creador Serial",
    description: "Tienes 5 personajes creados",
    icon: "users",
    xpReward: 150,
  },
  group_leader: {
    label: "Reclutador",
    description: "Tu grupo tiene más de 3 miembros",
    icon: "crown",
    xpReward: 100,
  },
  explorer: {
    label: "Explorador",
    description: "Usaste 3 generadores diferentes en DM Tools",
    icon: "compass",
    xpReward: 125,
  },
  completionist: {
    label: "Completista",
    description: "Completaste todos los módulos de aprendizaje",
    icon: "star",
    xpReward: 300,
  },
};
