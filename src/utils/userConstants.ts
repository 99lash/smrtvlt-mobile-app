export const USER_CONSTANTS = {
  MESSAGES: {
    USER_MANAGEMENT_TITLE: 'User Management',
    ADD_USER: 'Add User',
    LAST_ACCESS: 'Last access',
    INACTIVE: 'Inactive',
    ADMIN: 'Admin',
    USER: 'User',
    ACTIVE: 'Active',
    ENABLED: 'Enabled',
    DISABLED: 'Disabled',
  },
  COLORS: {
    ICON_DEFAULT: '#cbd5e1',
    ICON_DELETE: '#fca5a5',
    ICON_SHIELD: '#cbd5e1',
    ICON_SETTINGS: '#cbd5e1',
  },
  UI: {
    ICON_SIZE: 18,
    AVATAR_SIZE: 40,
    BADGE_PADDING: 'px-2 py-0.5',
    BADGE_TEXT_SIZE: 'text-[10px]',
    BADGE_ROUNDED: 'rounded-full',
  },
  TIMING: {
    DEBOUNCE_DELAY: 300,
    ANIMATION_DURATION: 200,
  },
} as const;

export const BADGE_VARIANTS = {
  DEFAULT: 'default' as const,
  SECONDARY: 'secondary' as const,
} as const;

export const BADGE_STYLES = {
  [BADGE_VARIANTS.DEFAULT]: 'bg-neutral-700 text-white',
  [BADGE_VARIANTS.SECONDARY]: 'bg-neutral-800 text-neutral-200',
} as const;