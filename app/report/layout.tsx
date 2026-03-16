import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Monthly Report — ChopMetr",
  description: "Generate and download your monthly energy usage PDF report",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
