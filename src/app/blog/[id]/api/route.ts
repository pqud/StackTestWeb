import { MongoClient, ObjectId } from "mongodb";
import { NextRequest, NextResponse } from "next/server";
import jwt from 'jsonwebtoken'
import { Parkinsans } from "next/font/google";

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

export async function GET(
    request:NextRequest,
    {params}:{params:{id:string}}
){
    try{
        const decoded = await verifyToken(request);
        
        if (!decoded) {
            return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
        }

        const {id} = await params;

        await client.connect();
        const database = client.db('TestWebsite');
        const collection = database.collection('posts');


        const post = await collection.findOne({ 
            _id: new ObjectId(id)
        });

        if(!post){
            return NextResponse.json({error: '글을 찾을 수 없습니다.'}, { status:404 });
        }

        const processedPost = {
            _id: post._id.toString(),
            title: post.title || '제목 없음',
            content: post.content,
            image: post.image || 'dog.png',
            author: post.userName || post.email,
            authorId: post.userId || post._id.toString(), // 작성자 ID 추가
            date: new Date(post.createdAt).toLocaleDateString('ko-KR'),
            createdAt: post.createdAt
        };

        return NextResponse.json({post:processedPost});

    }catch(error){
        return NextResponse.json({error: '서버 오류가 발생했습니다.'},{status:500});
    }finally{
        await client.close();
    }
}

export async function DELETE(
    request:NextRequest,
    {params}:{params:{id:string}}
){
    try{
        const decoded = await verifyToken(request);
        
        if (!decoded) {
            return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
        }

        await client.connect();
        const database = client.db('TestWebsite');
        const collection = database.collection('posts');

        // 글이 존재하는지 확인
        const post = await collection.findOne({ 
            _id: new ObjectId(params.id)
        });

        if(!post){
            return NextResponse.json({error: '글을 찾을 수 없습니다.'}, { status:404 });
        }

        // 글 삭제
        const result = await collection.deleteOne({ 
            _id: new ObjectId(params.id)
        });

        if (result.deletedCount === 1) {
            return NextResponse.json({ success: true, message: '글이 성공적으로 삭제되었습니다.' });
        } else {
            return NextResponse.json({ error: '글 삭제에 실패했습니다.' }, { status: 500 });
        }

    }catch(error){
        console.error('Delete error:', error);
        return NextResponse.json({error: '서버 오류가 발생했습니다.'},{status:500});
    }finally{
        await client.close();
    }
}

export async function PUT(
    request:NextRequest,
    {params}:{params:{id:string}}
){
    try{
        const decoded = await verifyToken(request);
        
        if (!decoded) {
            return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
        }

        const body = await request.json();
        const { title, content } = body;

        if (!title || !content) {
            return NextResponse.json({ error: '제목과 내용은 필수입니다.' }, { status: 400 });
        }

        await client.connect();
        const database = client.db('TestWebsite');
        const collection = database.collection('posts');

        // 글이 존재하는지 확인
        const post = await collection.findOne({ 
            _id: new ObjectId(params.id)
        });

        if(!post){
            return NextResponse.json({error: '글을 찾을 수 없습니다.'}, { status:404 });
        }

        // 글 수정
        const result = await collection.updateOne(
            { _id: new ObjectId(params.id) },
            { 
                $set: { 
                    title, 
                    content,
                    updatedAt: new Date()
                } 
            }
        );

        if (result.modifiedCount === 1) {
            return NextResponse.json({ 
                success: true, 
                message: '글이 성공적으로 수정되었습니다.',
                post: {
                    _id: params.id,
                    title,
                    content
                }
            });
        } else {
            return NextResponse.json({ error: '글 수정에 실패했습니다.' }, { status: 500 });
        }

    }catch(error){
        console.error('Update error:', error);
        return NextResponse.json({error: '서버 오류가 발생했습니다.'},{status:500});
    }finally{
        await client.close();
    }
}