import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageSquare, Plus } from "lucide-react";
import { Link } from "wouter";
import { Announcement } from "@shared/schema";

export default function Announcements() {
  const { data: announcements = [], isLoading } = useQuery<Announcement[]>({
    queryKey: ["/api/announcements"],
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="fui-r-size-6 fui-r-weight-semi-bold" style={{ color: 'var(--gray-12)' }}>
            Announcements
          </h1>
          <p className="fui-r-size-2 mt-1" style={{ color: 'var(--gray-11)' }}>
            Send announcements to club members
          </p>
        </div>
        <Link href="/announcements/create">
          <a data-testid="button-create-announcement">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Announcement
            </Button>
          </a>
        </Link>
      </div>

      <Card className="p-6 elevated-card">
        <h2 className="fui-r-size-4 fui-r-weight-semi-bold mb-4" style={{ color: 'var(--gray-12)' }}>
          All Announcements
        </h2>

        {isLoading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-24 bg-muted rounded animate-pulse" />
            ))}
          </div>
        ) : announcements.length === 0 ? (
          <div className="text-center py-12">
            <MessageSquare className="h-12 w-12 mx-auto mb-4" style={{ color: 'var(--gray-11)' }} />
            <p className="fui-r-size-2" style={{ color: 'var(--gray-11)' }}>
              No announcements yet
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {announcements.map((announcement) => (
              <div
                key={announcement.id}
                className="p-4 rounded-xl border hover-elevate transition-all"
                style={{ borderColor: 'var(--stroke)' }}
                data-testid={`card-announcement-${announcement.id}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="fui-r-size-3 fui-r-weight-medium" style={{ color: 'var(--gray-12)' }}>
                      {announcement.title}
                    </h3>
                    <p className="fui-r-size-2 mt-2 line-clamp-2" style={{ color: 'var(--gray-11)' }}>
                      {announcement.content}
                    </p>
                    <div className="flex items-center gap-4 mt-3">
                      <span className="fui-r-size-1" style={{ color: 'var(--gray-11)' }}>
                        {new Date(announcement.createdAt).toLocaleDateString()}
                      </span>
                      <span className="fui-r-size-1 px-2 py-1 rounded" style={{ backgroundColor: 'var(--accent-a3)', color: 'var(--accent-9)' }}>
                        {announcement.targetGroup === "all" ? "All Members" : announcement.targetGroup}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
