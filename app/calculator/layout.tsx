import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Appliance Calculator — ChopMetr",
  description: "Calculate electricity costs for your household appliances",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
