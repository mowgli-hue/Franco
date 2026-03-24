import type { UserSubscriptionProfile } from '../../navigation/routePersistence';

export function isProLessonId(lessonId: string): boolean {
  // Foundation + A1 lesson 1 are free. A1 lesson 2+ and above are Pro-gated.
  return (
    /^a1-lesson-(?:[2-9]|[1-3]\d|40)$/.test(lessonId) ||
    /^a2-lesson-/.test(lessonId) ||
    /^b1-lesson-/.test(lessonId) ||
    /^(clb5|clb7)-lesson-/.test(lessonId)
  );
}

export function shouldRouteToUpgrade(profile: UserSubscriptionProfile): boolean {
  return profile.subscriptionStatus !== 'active';
}

export function shouldAllowSinglePreview(profile: UserSubscriptionProfile): boolean {
  void profile;
  return false;
}
