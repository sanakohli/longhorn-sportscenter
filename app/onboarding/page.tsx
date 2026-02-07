import OnboardingWizard from "@/components/OnboardingWizard";

export default function OnboardingPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-orange-50/30 p-8">
      <div className="max-w-lg mx-auto mb-10 text-center">
        <div className="inline-flex items-center gap-2 bg-[#BF5700]/10 text-[#BF5700] rounded-full px-4 py-1.5 text-sm font-semibold mb-4">
          Getting Started
        </div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-[#BF5700] to-[#A04800] bg-clip-text text-transparent">
          Welcome to Longhorn SportsCenter
        </h1>
        <p className="text-gray-500 mt-3 leading-relaxed">
          Let&apos;s set up your preferences in a few quick steps.
        </p>
      </div>
      <OnboardingWizard />
    </main>
  );
}
