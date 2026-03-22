'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { PostCard, type PostCardProps } from './PostCard';

interface SeriesViewProps {
  posts: PostCardProps[];
}

interface SeriesGroup {
  name: string;
  posts: PostCardProps[];
}

export function SeriesView({ posts }: SeriesViewProps) {
  // Group posts by series name
  const groupMap = new Map<string, PostCardProps[]>();

  for (const post of posts) {
    const key = post.series?.name ?? 'Standalone';
    const group = groupMap.get(key);
    if (group) {
      group.push(post);
    } else {
      groupMap.set(key, [post]);
    }
  }

  const groups: SeriesGroup[] = Array.from(groupMap.entries()).map(
    ([name, groupPosts]) => ({
      name,
      posts: groupPosts.sort((a, b) => {
        // Sort by series order when in a series, else by created desc
        if (a.series && b.series) {
          return a.series.order - b.series.order;
        }
        return new Date(b.created).getTime() - new Date(a.created).getTime();
      }),
    }),
  );

  // Put named series first, standalone last
  groups.sort((a, b) => {
    if (a.name === 'Standalone') return 1;
    if (b.name === 'Standalone') return -1;
    return a.name.localeCompare(b.name);
  });

  const allKeys = groups.map((g) => g.name);

  return (
    <Accordion type="multiple" defaultValue={allKeys} className="space-y-2">
      {groups.map((group) => (
        <AccordionItem key={group.name} value={group.name}>
          <AccordionTrigger className="text-sm font-medium">
            <span className="flex items-center gap-2">
              {group.name}
              <Badge variant="secondary" className="text-xs">
                {group.posts.length}
              </Badge>
            </span>
          </AccordionTrigger>
          <AccordionContent>
            <div className="grid grid-cols-1 gap-3 pt-2">
              {group.posts.map((post) => (
                <PostCard key={post.slug} {...post} />
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
