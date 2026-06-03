export const metadata = {
  title: "Dashboard | PromptForge",
  description: "Configure and manage your personalized AI prompt-engineering workspaces.",
  alternates: {
    canonical: 'https://promptforge.ai/dashboard',
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function DashboardLayout({ children }) {
  return <>{children}</>;
}
