import { ruRU } from "@clerk/localizations";

export const ruLocalization = {
  ...ruRU,
  organizationProfile: {
    ...ruRU.organizationProfile,
    membersPage: {
      ...ruRU.organizationProfile?.membersPage,
      invitationsTab: {
        ...ruRU.organizationProfile?.membersPage?.invitationsTab,
        manualInvitations: {
          ...ruRU.organizationProfile?.membersPage?.invitationsTab?.manualInvitations,
          headerTitle: "Личные приглашения",
          headerSubtitle: "Приглашайте участников вручную и управляйте существующими приглашениями"
        },
        table__emptyRow: "Нет приглашений для отображения"
      },
    }
  },
  userProfile: {
    ...ruRU.userProfile,
    start: {
      ...ruRU.userProfile?.start,
      dangerSection: {
        title: "Удаление учетной записи",
        deleteAccountTitle: "Удалить аккаунт",
        deleteAccountDescription:
          "Удалите свою учетную запись и все связанные с ней данные",
        deleteAccountButton: "Удалить",
      },
    },
  }
};