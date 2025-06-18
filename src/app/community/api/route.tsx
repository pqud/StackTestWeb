import { NextRequest, NextResponse } from "next/server";
import { MongoClient, ObjectId } from "mongodb";
import jwt from 'jsonwebtoken';

const uri = process.env.MONGODB_URI!;
const client = new MongoClient(uri);

export async function GET(request:NextRequest){
    try{

        await client.connect();
        const database = client.db('TestWebsite');
        const collection = database.collection('posts');

        //모든 사용자의 글을 최신순으로 가져오기
        const posts = await collection
            .find({})
            .sort({ createdAt: -1 })
            .limit(20)
            .toArray();

        // 데이터 가공
        const processedPosts = posts.map(post => ({
            _id: post._id.toString(),
            title: post.title || '제목 없음',
            content: post.content,
            summary: post.content.substring(0, 100) + (post.content.length > 100 ? '...' : ''),
            image: post.image || 'dog.png', // 기본 이미지
            author: post.userName || post.email,
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