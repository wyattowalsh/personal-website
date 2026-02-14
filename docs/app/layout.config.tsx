import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';
import Image from 'next/image';
/**
 * Shared layout configurations
 *
 * you can customise layouts individually from:
 * Home Layout: app/(home)/layout.tsx
 * Docs Layout: app/docs/layout.tsx
 */
export const baseOptions: BaseLayoutProps = {
	nav: {
		title: (
			<>
				<Image src="/img/logo.png" alt="Logo" width={35} height={35} />
				<code>personal-website</code> Dev Docs
			</>
		),
	},
	// see https://fumadocs.dev/docs/ui/navigation/links
	links: [],
	githubUrl: "https://github.com/wyattowalsh/personal-website",
};
