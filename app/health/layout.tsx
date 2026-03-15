import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Meter Health Check — ChopMeter",
  description: "Compare expected vs actual electricity usage to verify your meter",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
