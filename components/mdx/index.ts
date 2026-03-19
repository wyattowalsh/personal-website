// Barrel export for all MDX components
import dynamic from 'next/dynamic';

// Phase 1: Interactive/Visual Components
export const Chart = dynamic(() => import("./Chart"), { ssr: false });
export { default as Timeline } from "./Timeline";
export { default as Comparison, ComparisonCard } from "./Comparison";
export { default as ImageGallery } from "./ImageGallery";
export { default as VideoEmbed } from "./VideoEmbed";
export { default as Terminal } from "./Terminal";
export { default as Diff } from "./Diff";

// Phase 2: Data/Code Components
export { default as APIReference } from "./APIReference";
export { default as PropTable } from "./PropTable";
export { default as FileTree } from "./FileTree";
export { default as PackageInstall } from "./PackageInstall";

// Phase 3: Engagement Components
export { default as Quiz } from "./Quiz";
export { default as Spoiler, InlineSpoiler } from "./Spoiler";
export { default as Bookmark, BookmarkGrid } from "./Bookmark";
// Phase 4: Layout Components
export { default as Columns, Column, Split } from "./Columns";
export { default as Aside, InlineAside } from "./Aside";
export { default as Figure, FigureGroup } from "./Figure";
export { default as Steps, Step } from "./Steps";
