import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard - Your Electricity Usage Overview",
  description:
    "Monitor your daily prepaid electricity consumption, track spending, and see usage trends. Real-time energy dashboard for Ghana prepaid meters.",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
