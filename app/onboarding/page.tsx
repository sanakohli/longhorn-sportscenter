import OnboardingWizard from "@/components/OnboardingWizard";

export default function OnboardingPage() {
  return (
    <main className="min-h-screen bg-white p-8">
      <div className="max-w-lg mx-auto mb-8 text-center">
        <h1 className="text-3xl font-bold text-[#BF5700]">
          Welcome to Longhorn SportsCenter
        </h1>
        <p className="text-gray-600 mt-2">
          Let&apos;s set up your preferences in a few quick steps.
        </p>
      </div>
      <OnboardingWizard />
    </main>
  );
}
