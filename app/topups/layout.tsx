import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Top-up History — ChopMeter",
  description: "Track your prepaid electricity recharges and spending",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
