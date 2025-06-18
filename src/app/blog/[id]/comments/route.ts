import { MongoClient, ObjectId } from "mongodb";
import { NextRequest, NextResponse } from "next/server";
import jwt from 'jsonwebtoken';

const uri = process.env.MONGODB_URI!;
const client = new MongoClient(uri);

// 토큰 검증 함수
async function verifyToken(request: NextRequest) {
    if (!process.env.JWT_SECRET) {
        throw new Error('JWT_SECRET must be defined');
    }

    const token = request.headers.get('authorization')?.replace('Bearer ', '') || 
                  request.cookies.get('token')?.value;

    if (!token) {
        return null;
    }

    try {
        return jwt.verify(token, process.env.JWT_SECRET) as any;
    } catch (error) {
        return null;
    }
}

// 댓글 목록 가져오기
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const decoded = await verifyToken(request);
        
        if (!decoded) {
            return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
        }

        const {id} = await params;

        await client.connect();
        const database = client.db('TestWebsite');
        const collection = database.collection('comments');

        const comments = await collection
            .find({ postId: id })
            .sort({ createdAt: -1 })
            .toArray();

        const processedComments = comments.map(comment => ({
            _id: comment._id.toString(),
            postId: comment.postId,
            content: comment.content,
            author: comment.author,
            authorId: comment.authorId,
            createdAt: new Date(comment.createdAt).toLocaleString('ko-KR')
        }));

        return NextResponse.json({ comments: processedComments });
    } catch (error) {
        console.error('Error fetching comments:', error);
        return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
    } finally {
        await client.close();
    }
}

// 댓글 작성
export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const decoded = await verifyToken(request);
        
        if (!decoded) {
            return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
        }

        const body = await request.json();
        const { content } = body;

        if (!content) {
            return NextResponse.json({ error: '댓글 내용은 필수입니다.' }, { status: 400 });
        }

        await client.connect();
        const database = client.db('TestWebsite');
        const collection = database.collection('comments');

        const now = new Date();
        const comment = {
            postId: params.id,
            content,
            author: decoded.userName || decoded.email,
            authorId: decoded.userId || decoded._id,
            createdAt: now,
            updatedAt: now
        };

        const result = await collection.insertOne(comment);

        const newComment = {
            _id: result.insertedId.toString(),
            postId: params.id,
            content,
            author: decoded.userName || decoded.email,
            authorId: decoded.userId || decoded._id,
            createdAt: now.toLocaleString('ko-KR')
        };

        return NextResponse.json({ 
            success: true, 
            message: '댓글이 성공적으로 작성되었습니다.',
            comment: newComment
        });
    } catch (error) {
        console.error('Error creating comment:', error);
        return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
    } finally {
        await client.close();
    }
}