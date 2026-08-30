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
    const post = await Post.findById(id);
    if (!post) return NextResponse.json({ error: 'Post not found' }, { status: 404 });

    const objectId = new mongoose.Types.ObjectId(userId);
    const hasLiked = post.likes.some((likeId: mongoose.Types.ObjectId) => likeId.toString() === objectId.toString());

    if (hasLiked) {
      post.likes = post.likes.filter((likeId: mongoose.Types.ObjectId) => likeId.toString() !== objectId.toString());
    } else {
      post.likes.push(objectId);
    }
    await post.save();

    return NextResponse.json({ liked: !hasLiked, likes: post.likes.length });
  } catch (error) {
    console.error('POST /api/posts/[id]/like error:', error);
    return NextResponse.json({ error: 'Failed to update like' }, { status: 500 });
  }
}