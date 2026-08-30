import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '@/lib/mongodb';
import Post from '@/lib/Models/Post';
import { authOptions } from '@/lib/auth';
import mongoose from 'mongoose';

const SUBJECTS = ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'Computer Science', 'Other'];

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = req.nextUrl;
    const subject = searchParams.get('subject');
    const q = searchParams.get('q');
    const sort = searchParams.get('sort') || 'latest';

    const filter: Record<string, unknown> = {};
    if (subject && SUBJECTS.includes(subject)) filter.subject = subject;
    if (q?.trim()) filter.content = { $regex: q.trim(), $options: 'i' };

    let query = Post.find(filter)
      .populate('user', 'name image _id')
      .populate('comments.user', 'name image _id');

    if (sort === 'popular') query = query.sort({ 'likes.length': -1, createdAt: -1 });
    else if (sort === 'discussed') query = query.sort({ 'comments.length': -1, createdAt: -1 });
    else query = query.sort({ createdAt: -1 });

    const posts = await query.limit(150);
    return NextResponse.json(posts);
  } catch (error) {
    console.error('GET /api/posts error:', error);
    return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id;
    if (!session?.user || !userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectDB();
    const body = await req.json();
    const { subject, content } = body;
    if (!subject || !content?.trim()) {
      return NextResponse.json({ error: 'Subject and content are required' }, { status: 400 });
    }

    const post = await Post.create({
      user: new mongoose.Types.ObjectId(userId),
      subject,
      content: content.trim(),
      likes: [],
      comments: [],
    });
    return NextResponse.json(post);
  } catch (error) {
    console.error('POST /api/posts error:', error);
    return NextResponse.json({ error: 'Failed to create post' }, { status: 500 });
  }
}