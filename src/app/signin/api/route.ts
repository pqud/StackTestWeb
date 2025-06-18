import { NextRequest, NextResponse } from "next/server";
import { MongoClient } from 'mongodb';
import bcrypt from 'bcrypt';

const uri = process.env.MONGODB_URI!;
const client =new MongoClient(uri);

export async function POST(req:NextRequest){
    const {email, userName, password} = await req.json();

    if(!email|| !userName || !password){
        return NextResponse.json({message:'필수 입력값 누락'},{status:400});
    }

    try{
        await client.connect();
        const db=client.db('TestWebsite');
        const users=db.collection('users');

        const existEmail = await users.findOne({email});
        if(existEmail){
            return NextResponse.json({message : '이미 가입된 이메일입니다.'}, {
                status: 409
            });
        }
        const existuserName = await users.findOne({userName});
        if(existuserName){
            return NextResponse.json({message : '이미 사용중인 아이디입니다.'}, {
                status: 409
            });
        }
        const hashed = await bcrypt.hash(password, 10);
        await users.insertOne({ email, userName, password: hashed});

        return NextResponse.json({message:'회원가입 성공'}, {status :201});
    }catch(error){
        return NextResponse.json({message:'서버 오류'}, {status :500});
    }finally{
        await client.close();
    }


}