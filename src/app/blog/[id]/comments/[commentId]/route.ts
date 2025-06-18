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

// 댓글 수정
export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string, commentId: string } }
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

        // 댓글이 존재하는지 확인
        const comment = await collection.findOne({ 
            _id: new ObjectId(params.commentId) 
        });

        if (!comment) {
            return NextResponse.json({ error: '댓글을 찾을 수 없습니다.' }, { status: 404 });
        }

        // 댓글 작성자만 수정 가능
        const userId = decoded.userId || decoded._id;
        if (comment.authorId !== userId) {
            return NextResponse.json({ error: '댓글을 수정할 권한이 없습니다.' }, { status: 403 });
        }

        // 댓글 수정
        const now = new Date();
        const result = await collection.updateOne(
            { _id: new ObjectId(params.commentId) },
            { 
                $set: { 
                    content,
                    updatedAt: now
                } 
            }
        );

        if (result.modifiedCount === 1) {
            const updatedComment = {
                _id: params.commentId,
                postId: params.id,
                content,
                author: comment.author,
                authorId: comment.authorId,
                createdAt: new Date(comment.createdAt).toLocaleString('ko-KR')
            };

            return NextResponse.json({ 
                success: true, 
                message: '댓글이 성공적으로 수정되었습니다.',
                comment: updatedComment
            });
        } else {
            return NextResponse.json({ error: '댓글 수정에 실패했습니다.' }, { status: 500 });
        }
    } catch (error) {
        console.error('Error updating comment:', error);
        return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
    } finally {
        await client.close();
    }
}

// 댓글 삭제
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string, commentId: string } }
) {
    try {
        const decoded = await verifyToken(request);
        
        if (!decoded) {
            return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
        }

        await client.connect();
        const database = client.db('TestWebsite');
        const collection = database.collection('comments');

        // 댓글이 존재하는지 확인
        const comment = await collection.findOne({ 
            _id: new ObjectId(params.commentId) 
        });

        if (!comment) {
            return NextResponse.json({ error: '댓글을 찾을 수 없습니다.' }, { status: 404 });
        }

        // 댓글 작성자만 삭제 가능
        const userId = decoded.userId || decoded._id;
        if (comment.authorId !== userId) {
            return NextResponse.json({ error: '댓글을 삭제할 권한이 없습니다.' }, { status: 403 });
        }

        // 댓글 삭제
        const result = await collection.deleteOne({ 
            _id: new ObjectId(params.commentId) 
        });

        if (result.deletedCount === 1) {
            return NextResponse.json({ 
                success: true, 
                message: '댓글이 성공적으로 삭제되었습니다.' 
            });
        } else {
            return NextResponse.json({ error: '댓글 삭제에 실패했습니다.' }, { status: 500 });
        }
    } catch (error) {
        console.error('Error deleting comment:', error);
        return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
    } finally {
        await client.close();
    }
}