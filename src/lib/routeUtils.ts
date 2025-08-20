/**
 * Utility functions for React Router navigation
 */

/**
 * Safely navigate to a route with state, ensuring the state is preserved even through page reloads
 * @param navigate - The navigate function from useNavigate
 * @param route - The route to navigate to
 * @param state - The state to pass to the route
 */
export function safeNavigate(navigate: any, route: string, state: any) {
  try {
    // First, store the state in localStorage as a backup
    if (state) {
      localStorage.setItem(`route_state_${route}`, JSON.stringify(state));
    }
    
    // Then navigate with the state
    console.log(`Navigating to ${route} with state:`, state);
    navigate(route, { state, replace: true });
  } catch (error) {
    console.error("Navigation error:", error);
    
    // Fallback to basic navigation if complex state fails
    navigate(route);
  }
}

/**
 * Get state from either the location or localStorage
 * @param location - The location object from useLocation
 * @param route - The current route
 */
export function getRouteState(location: any, route: string) {
  try {
    // First try to get state from location
    if (location.state) {
      return location.state;
    }
    
    // If that fails, try localStorage
    const storedState = localStorage.getItem(`route_state_${route}`);
    if (storedState) {
      return JSON.parse(storedState);
    }
    
    return null;
  } catch (error) {
    console.error("Error retrieving route state:", error);
    return null;
  }
}

/**
 * Clear state for a route from localStorage
 * @param route - The route to clear state for
 */
export function clearRouteState(route: string) {
  try {
    localStorage.removeItem(`route_state_${route}`);
  } catch (error) {
    console.error("Error clearing route state:", error);
  }
}
