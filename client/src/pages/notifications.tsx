import { useQuery, useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bell, Calendar, MessageSquare, DollarSign } from "lucide-react";
import { Notification } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";

export default function Notifications() {
  const { data: notifications = [], isLoading } = useQuery<Notification[]>({
    queryKey: ["/api/notifications"],
  });

  const markAsReadMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest("PATCH", `/api/notifications/${id}`, { isRead: true });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
    },
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "event": return Calendar;
      case "announcement": return MessageSquare;
      case "campaign": return DollarSign;
      default: return Bell;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "event": return "var(--success-9)";
      case "announcement": return "var(--accent-9)";
      case "campaign": return "var(--warning-a11)";
      default: return "var(--gray-11)";
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="fui-r-size-6 fui-r-weight-semi-bold" style={{ color: 'var(--gray-12)' }}>
          Notifications
        </h1>
        <p className="fui-r-size-2 mt-1" style={{ color: 'var(--gray-11)' }}>
          Stay updated with club activities
        </p>
      </div>

      <Card className="p-6 elevated-card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="fui-r-size-4 fui-r-weight-semi-bold" style={{ color: 'var(--gray-12)' }}>
            All Notifications
          </h2>
          {unreadCount > 0 && (
            <Badge className="bg-[var(--accent-9)] text-white">
              {unreadCount} new
            </Badge>
          )}
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-20 bg-muted rounded animate-pulse" />
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-12">
            <Bell className="h-12 w-12 mx-auto mb-4" style={{ color: 'var(--gray-11)' }} />
            <p className="fui-r-size-2" style={{ color: 'var(--gray-11)' }}>
              No notifications yet
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {notifications.map((notification) => {
              const Icon = getTypeIcon(notification.type);
              const color = getTypeColor(notification.type);

              return (
                <div
                  key={notification.id}
                  className={`p-4 rounded-xl border transition-all cursor-pointer hover-elevate ${!notification.isRead ? 'bg-[var(--accent-a3)]' : ''}`}
                  style={{ borderColor: 'var(--stroke)' }}
                  onClick={() => !notification.isRead && markAsReadMutation.mutate(notification.id)}
                  data-testid={`notification-${notification.id}`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className="h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: color + '20' }}
                    >
                      <Icon className="h-5 w-5" style={{ color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className="fui-r-size-2 fui-r-weight-medium" style={{ color: 'var(--gray-12)' }}>
                          {notification.title}
                        </p>
                        {!notification.isRead && (
                          <div className="h-2 w-2 rounded-full bg-[var(--accent-9)] flex-shrink-0 mt-2" />
                        )}
                      </div>
                      <p className="fui-r-size-2 mt-1" style={{ color: 'var(--gray-11)' }}>
                        {notification.message}
                      </p>
                      <p className="fui-r-size-1 mt-2" style={{ color: 'var(--gray-11)' }}>
                        {new Date(notification.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
