import { NextRequest, NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';
import jwt from 'jsonwebtoken';

const uri = process.env.MONGODB_URI;
if (!uri) {
    throw new Error('MONGODB_URI 환경변수가 설정되어 있지 않습니다.');
}

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
    throw new Error('JWT_SECRET 환경변수가 설정되어 있지 않습니다.');
}

const client = new MongoClient(uri);

export async function POST(request: NextRequest) {
    try {
        // JWT 토큰에서 사용자 정보 확인
        if (!process.env.JWT_SECRET) {
            throw new Error('JWT_SECRET must be defined');
        }

        const token = request.headers.get('authorization')?.replace('Bearer ', '') || 
                      request.cookies.get('token')?.value;

        if (!token) {
            return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
        }


        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.userId;
        const userName = decoded.userName;

        const { title, content } = await request.json();

        if (!title) {
            return NextResponse.json({ error: '제목을 입력해주세요.' }, { status: 400 });
        }


        if (!content) {
            return NextResponse.json({ error: '내용을 입력해주세요.' }, { status: 400 });
        }

        // MongoDB에 연결
        await client.connect();
        const database = client.db('TestWebsite');
        const collection = database.collection('posts');

        // 글 저장
        const result = await collection.insertOne({
            title,
            content,
            userId: userId,
            userName, userName,
            createdAt: new Date(),
            updatedAt: new Date()
        });

        return NextResponse.json({ 
            message: '글이 성공적으로 저장되었습니다.',
            postId: result.insertedId 
        });

    } catch (error) {
        console.error('Error saving post:', error);
        return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
    } finally {
        await client.close();
    }
}