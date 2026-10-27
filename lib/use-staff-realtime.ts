"use client";

import { useEffect } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

/** Re-fetch staff lists when reservations change; re-subscribes after reconnect. */
export function useStaffReservationsRealtime(onRefresh: () => void) {
  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    const channel = supabase
      .channel("staff-reservations-feed")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "reservations" },
        () => {
          onRefresh();
        },
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED" || status === "CHANNEL_ERROR") {
          onRefresh();
        }
      });

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [onRefresh]);
}
