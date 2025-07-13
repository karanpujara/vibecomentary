function completeOnboarding() {
  chrome.storage.local.set({ onboardingComplete: true }, function () {
    window.close();
  });
}
