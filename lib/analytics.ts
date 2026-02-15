/**
 * Custom analytics tracking functions for GTM/GA4
 * All functions are safe to call server-side (no-ops when window is undefined)
 */

declare global {
	interface Window {
		gtag?: (...args: any[]) => void;
	}
}

/**
 * Track search queries
 */
export function trackSearch(query: string): void {
	if (typeof window !== 'undefined' && window.gtag) {
		window.gtag('event', 'search', {
			search_term: query,
			event_category: 'engagement',
		});
	}
}

/**
 * Track tag filter clicks
 */
export function trackTagClick(tag: string): void {
	if (typeof window !== 'undefined' && window.gtag) {
		window.gtag('event', 'tag_click', {
			tag_name: tag,
			event_category: 'navigation',
		});
	}
}

/**
 * Track theme toggle
 */
export function trackThemeToggle(theme: string): void {
	if (typeof window !== 'undefined' && window.gtag) {
		window.gtag('event', 'theme_toggle', {
			theme_value: theme,
			event_category: 'user_preference',
		});
	}
}

/**
 * Track outbound link clicks
 */
export function trackOutboundClick(url: string): void {
	if (typeof window !== 'undefined' && window.gtag) {
		window.gtag('event', 'click', {
			event_category: 'outbound',
			event_label: url,
			transport_type: 'beacon',
		});
	}
}

/**
 * Track blog post views
 */
export function trackPostClick(slug: string): void {
	if (typeof window !== 'undefined' && window.gtag) {
		window.gtag('event', 'post_view', {
			post_slug: slug,
			event_category: 'engagement',
		});
	}
}
