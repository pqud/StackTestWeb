import { NextRequest, NextResponse } from "next/server";
import { MongoClient } from 'mongodb';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const uri = process.env.MONGODB_URI!;
const client = new MongoClient(uri);
const JWT_SECRET= process.env.JWT_SECRET || "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6"

export async function POST(req: NextRequest) {
    try{
        const { username, password } = await req.json();

        await client.connect();
        const db = client.db('TestWebsite');
        const user = await db.collection('users').findOne({ email: username });

        if (!user) {
            return NextResponse.json({ message: '사용자를 찾을 수 없습니다.' }, { status: 401 });
        }
        const match = await bcrypt.compare(password, user.password);
        if(!match){
            return NextResponse.json({ message: '비밀번호가 일치하지 않습니다.' }, { status: 401 });
        }
        const token = jwt.sign(
            { 
                userId: user._id, 
                email: user.email,
                userName: user.userName, 
            },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        // 디버그: 토큰 생성 전 데이터 확인
        return NextResponse.json({ token });

    }catch(error){
        return NextResponse.json({ message: '서버 오류가 발생했습니다..' }, { status: 500 });
    }finally{
        await client.close();
    }
    
}