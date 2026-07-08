"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Plus, Radio, Megaphone, GraduationCap, Bell, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { apiClient } from "@/lib/api/client";
import type { Announcement } from "@/types";
import { cn } from "@/lib/utils";

const typeIcons = { live: Radio, update: Megaphone, exam: GraduationCap, general: Bell };
const typeColors = { live: "destructive", update: "default", exam: "secondary", general: "outline" } as const;

export default function TutorAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [newMessage, setNewMessage] = useState("");

  const load = () => apiClient.getAnnouncements().then(setAnnouncements);

  useEffect(() => { load(); }, []);

  const addAnnouncement = async () => {
    if (!newMessage.trim()) return;
    await apiClient.createAnnouncement({ message: newMessage, type: "general" });
    setNewMessage("");
    load();
  };

  const removeAnnouncement = async (id: string) => {
    await apiClient.deleteAnnouncement(id);
    load();
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold lg:text-3xl">Announcements</h1>
        <p className="text-muted-foreground">Broadcast updates to all students via the live ticker.</p>
      </motion.div>

      <Card>
        <CardContent className="flex gap-2 pt-6">
          <Input
            placeholder="New announcement message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addAnnouncement()}
          />
          <Button onClick={addAnnouncement}><Plus className="mr-2 h-4 w-4" /> Post</Button>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {announcements.map((a) => {
          const Icon = typeIcons[a.type];
          return (
            <Card key={a.id}>
              <CardContent className="flex items-center gap-4 py-4">
                <Icon className={cn("h-5 w-5 shrink-0", a.type === "live" && "text-red-500")} />
                <div className="flex-1 min-w-0">
                  <p className="font-medium">{a.message}</p>
                  <Badge variant={typeColors[a.type]} className="mt-1 capitalize">{a.type}</Badge>
                </div>
                <Button variant="ghost" size="icon" onClick={() => removeAnnouncement(a.id)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
