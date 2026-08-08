import { useMemo } from "react";
import { useI18n } from "../i18n";
import {
  mapNotificationToItem,
  type Notification,
  type NotificationItem,
} from "../api/notificationApi";

interface NotificationTranslations {
  types?: Record<string, { title?: string; message?: string }>;
}

export function useNotificationItems(
  notifications: Notification[],
): NotificationItem[] {
  const { t } = useI18n();
  const n = t("notifications") as NotificationTranslations;

  return useMemo(() => {
    return notifications.map((notification) => {
      const base = mapNotificationToItem(notification);
      const translated = n.types?.[notification.tipo];
      return {
        ...base,
        title: translated?.title ?? base.title,
        message: translated?.message ?? base.message,
      };
    });
  }, [notifications, n.types]);
}
