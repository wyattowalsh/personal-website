import { NextResponse } from 'next/server';
import { BackendService } from '@/lib/server';

type Props = {
  params: Promise<{
    slug: string;
  }>;
};

export async function GET(
  request: Request,
  props: Props
) {
  const { slug } = await props.params;
  await BackendService.ensurePreprocessed();
  const result = await BackendService.getInstance().getAdjacentPosts(slug);
  
  return NextResponse.json({ data: result });
}