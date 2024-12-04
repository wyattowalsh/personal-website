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
  const post = await BackendService.getInstance().getPost(slug);
  
  if (!post) {
    return NextResponse.json(null, { status: 404 });
  }

  return NextResponse.json({ data: post });
}
