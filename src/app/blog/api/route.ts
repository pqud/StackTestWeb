import { NextRequest, NextResponse } from "next/server";
import { MongoClient, ObjectId } from "mongodb";
import jwt from 'jsonwebtoken';

const uri = process.env.MONGODB_URI!;
const client = new MongoClient(uri);

export async function GET(request:NextRequest){
    try{
        if(!process.env.JWT_SECRET){
            throw new Error('JWT_SECRET must be defined');
        }

        const token = request.headers.get('authorization')?.replace('Bearer ', '')||
            request.cookies.get('token')?.value;

        if(!token){
            return NextResponse.json({error: '인증이 필요합니다.'}, {status: 401});
        }

        const decoded=jwt.verify(token, process.env.JWT_SECRET) as any;
        const userId = decoded.userId;

        await client.connect();
        const database = client.db('TestWebsite');
        const collection = database.collection('posts');

        //해당 사용자의 글만 최신순으로 가져오기
        const posts = await collection
            .find({ userId: userId })
            .sort({ createdAt: -1 })
            .toArray();

        // 데이터 가공
        const processedPosts = posts.map(post => ({
            _id: post._id.toString(),
            title: post.title || '제목 없음',
            content: post.content,
            summary: post.content.substring(0, 100) + (post.content.length > 100 ? '...' : ''),
            image: post.image || 'dog.png', // 기본 이미지
            author: decoded.userName || decoded.email,
            date: new Date(post.createdAt).toLocaleDateString('ko-KR'),
            createdAt: post.createdAt
        }));

        return NextResponse.json({posts:processedPosts});

    }catch(error){
        console.error('Error fetching posts: ', error);
        return NextResponse.json({error:'서버 오류가 발생했습니다.'},{status:500});
    }finally{
        await client.close();
    }
}