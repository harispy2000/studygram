import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Post from '@/lib/Models/Post';
import User from '@/lib/Models/User';

export async function GET() {
  try {
    await connectDB();
    const [posts, users] = await Promise.all([
      Post.estimatedDocumentCount(),
      User.estimatedDocumentCount(),
    ]);
    const comments = await Post.aggregate([
      { $project: { count: { $size: { $ifNull: ['$comments', []] } } } },
      { $group: { _id: null, total: { $sum: '$count' } } },
    ]);
    return NextResponse.json({
      posts,
      users,
      comments: comments[0]?.total ?? 0,
    });
  } catch (error) {
    console.error('GET /api/stats error:', error);
    return NextResponse.json({ posts: 0, users: 0, comments: 0 });
  }
}