import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '@/lib/mongodb';
import Post from '@/lib/Models/Post';
import { authOptions } from '@/lib/auth';
import mongoose from 'mongoose';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function POST(req: NextRequest, { params }: RouteContext) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id;
    if (!session?.user || !userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectDB();
    const { id } = await params;
    const { text } = await req.json();
    if (!text?.trim()) return NextResponse.json({ error: 'Comment cannot be empty' }, { status: 400 });

    const post = await Post.findByIdAndUpdate(
      id,
      { $push: { comments: { user: new mongoose.Types.ObjectId(userId), text: text.trim() } } },
      { new: true }
    )
      .populate('user', 'name image _id')
      .populate('comments.user', 'name image _id');

    if (!post) return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    return NextResponse.json(post);
  } catch (error) {
    console.error('POST /api/posts/[id]/comments error:', error);
    return NextResponse.json({ error: 'Failed to add comment' }, { status: 500 });
  }
}