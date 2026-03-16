import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Energy Saving Tips for Ghana",
  description:
    "Practical tips to reduce your electricity bill in Ghana. Learn how to save on prepaid meter costs, reduce energy waste, and lower your monthly utility spending.",
  openGraph: {
    title: "Energy Saving Tips - ChopMetr",
    description:
      "Practical energy saving tips for prepaid electricity users in Ghana. Cut your electricity costs with simple daily habits.",
  },
};

export default function TipsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
