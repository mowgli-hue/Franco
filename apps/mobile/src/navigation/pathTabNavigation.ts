type GenericNavigation = {
  navigate?: (...args: unknown[]) => void;
  getParent?: () => GenericNavigation | undefined;
  getState?: () => { routeNames?: string[] } | undefined;
};

function findPathTabNavigator(navigation: GenericNavigation | undefined): GenericNavigation | null {
  let current: GenericNavigation | undefined = navigation;
  for (let i = 0; i < 6; i += 1) {
    if (!current) return null;
    const routeNames = current.getState?.()?.routeNames;
    if (Array.isArray(routeNames) && routeNames.includes('PathTab')) {
      return current;
    }
    current = current.getParent?.();
  }
  return null;
}

export function navigateToPathTab(
  navigation: GenericNavigation | undefined,
  screen: string,
  params?: Record<string, unknown>
): boolean {
  const tabsNavigation = findPathTabNavigator(navigation);
  if (!tabsNavigation?.navigate) {
    return false;
  }

  try {
    tabsNavigation.navigate('PathTab', { screen, params });
    return true;
  } catch {
    return false;
  }
}
