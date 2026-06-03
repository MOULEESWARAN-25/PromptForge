import { BRAND } from "@/config/brand";

export const metadata = {
  title: `Dashboard | ${BRAND.name}`,
  description: "Configure and compile your personalized AI design and software compilation blueprints.",
  alternates: {
    canonical: `https://${BRAND.domain}/dashboard`,
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function DashboardLayout({ children }) {
  return <>{children}</>;
}
