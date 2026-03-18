"use client";

import { useEffect } from "react";

export function PostContentHydration({ children }: { children: React.ReactNode }) {
	useEffect(() => {
		document.documentElement.setAttribute("data-math-hydrated", "true");
	}, []);

	return <>{children}</>;
}
