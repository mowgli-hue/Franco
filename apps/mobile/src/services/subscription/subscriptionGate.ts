import type { UserSubscriptionProfile } from '../../navigation/routePersistence';

export function isProLessonId(lessonId: string): boolean {
  return /^a2-lesson-/.test(lessonId) || /^b1-lesson-/.test(lessonId) || /^(clb5|clb7)-lesson-/.test(lessonId);
}

export function shouldRouteToUpgrade(profile: UserSubscriptionProfile): boolean {
  return profile.subscriptionStatus !== 'active';
}

export function shouldAllowSinglePreview(profile: UserSubscriptionProfile): boolean {
  void profile;
  return false;
}
