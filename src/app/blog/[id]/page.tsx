"use client";

import {useState, useEffect} from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import type { Components } from 'react-markdown';
import { jwtDecode } from 'jwt-decode';

interface Post{
    _id:string;
    title:string;
    content: string;
    image: string;
    author: string;
    authorId: string; // 작성자 ID 추가
    date: string;
}

interface Comment {
    _id: string;
    postId: string;
    content: string;
    author: string;
    authorId: string;
    createdAt: string;
}

export default function PostDetail(){
    const [post, setPost] = useState<Post | null>(null);
    const [loading, setLoading] = useState(true);
    const [isDeleting, setIsDeleting] = useState(false);
    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState('');
    const [submittingComment, setSubmittingComment] = useState(false);
    const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
    const [editCommentContent, setEditCommentContent] = useState('');
    const { token } = useAuth();
    const params = useParams();
    const router = useRouter();
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);
    
    const markdownComponents: Components = {
        code: ({node, className, children, ...props}) => {
            const match = /language-(\w+)/.exec(className || '');
            const isInline = !match;

            return isInline ? (
                <pre className="bg-gray-800 text-gray-100 p-4 rounded-lg overflow-x-auto">
                    <code className={className} {...props}>
                        {children}
                    </code>
                </pre>
            ) : (
                <code className="bg-gray-200 px-1 py-0.5 rounded text-sm" {...props}>
                    {children}
                </code>
            );
        },
        blockquote: ({children}) => (
            <blockquote className="border-l-4 border-indigo-500 pl-4 italic text-gray-600 my-4">
                {children}
            </blockquote>
        ),
        h1: ({children}) => (
            <h1 className="text-3xl font-bold mb-4 text-gray-900">{children}</h1>
        ),
        h2: ({children}) => (
            <h2 className="text-2xl font-bold mb-3 text-gray-900">{children}</h2>
        ),
        h3: ({children}) => (
            <h3 className="text-xl font-bold mb-2 text-gray-900">{children}</h3>
        ),
        p: ({children}) => (
            <p className="mb-4 text-gray-700 leading-relaxed">{children}</p>
        ),
        ul: ({children}) => (
            <ul className="list-disc list-inside mb-4 space-y-1">{children}</ul>
        ),
        ol: ({children}) => (
            <ol className="list-decimal list-inside mb-4 space-y-1">{children}</ol>
        ),
        li: ({children}) => (
            <li className="text-gray-700">{children}</li>
        ),
        a: ({href, children}) => (
            <a href={href} className="text-indigo-600 hover:text-indigo-800 underline">
                {children}
            </a>
        ),
        strong: ({children}) => (
            <strong className="font-bold text-gray-900">{children}</strong>
        ),
        em: ({children}) => (
            <em className="italic">{children}</em>
        ),
    };

    // 현재 사용자 ID 가져오기
    useEffect(() => {
        if (token) {
            try {
                const decoded = jwtDecode(token) as any;
                setCurrentUserId(decoded.userId || decoded._id);
            } catch (error) {
                console.error('JWT 디코딩 오류:', error);
            }
        }
    }, [token]);

    // 글 정보 가져오기
    useEffect(()=>{
        const fetchPost = async ()=>{
            if(!token){
                router.push('/login');
                return ;
            }
            try{
                const response = await fetch(`/blog/${params.id}/api`, {
                    headers:{
                        'Authorization': `Bearer ${token}`,
                    },
                });

                if(response.ok){
                    const data=await response.json();
                    setPost(data.post);
                }else{
                    console.error('Failed to fetch post');
                }
            }catch(error){
                console.error('Error fetching post: ',error);
            }finally{
                setLoading(false);
            }
        };

        fetchPost();
    }, [params.id, token, router]);
    
    // 댓글 가져오기
    useEffect(() => {
        const fetchComments = async () => {
            if (!token) return;
            
            try {
                const response = await fetch(`/blog/${params.id}/comments`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });
                
                if (response.ok) {
                    const data = await response.json();
                    setComments(data.comments);
                }
            } catch (error) {
                console.error('Error fetching comments:', error);
            }
        };
        
        fetchComments();
    }, [params.id, token]);
    
    
    if(loading){
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-xl">로딩 중...</div>
            </div>
        );
    }

    if(!post){
        return(
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-xl">글을 찾을 수 없습니다.</div>
            </div>
        )
    }
    
    const handleEdit = () => {
        // 수정 페이지로 이동하면서 현재 글 데이터를 state로 전달
        router.push(`/edit?id=${post._id}&title=${encodeURIComponent(post.title)}&content=${encodeURIComponent(post.content)}`);
    };
    
    const handleDelete = async () => {
        if (!confirm('정말로 이 글을 삭제하시겠습니까?')) return;
        
        setIsDeleting(true);
        try {
            const response = await fetch(`/blog/${params.id}/api`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            
            if (response.ok) {
                alert('글이 성공적으로 삭제되었습니다.');
                router.push('/blog');
            } else {
                const errorData = await response.json();
                alert(`글 삭제에 실패했습니다: ${errorData.error}`);
            }
        } catch (error) {
            console.error('Error deleting post:', error);
            alert('오류가 발생했습니다.');
        } finally {
            setIsDeleting(false);
        }
    };
    
    // 댓글 추가
    const handleAddComment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim()) return;
        
        setSubmittingComment(true);
        try {
            const response = await fetch(`/blog/${params.id}/comments`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ content: newComment }),
            });
            
            if (response.ok) {
                const data = await response.json();
                setComments(prev => [...prev, data.comment]);
                setNewComment('');
            } else {
                const errorData = await response.json();
                alert(`댓글 작성에 실패했습니다: ${errorData.error}`);
            }
        } catch (error) {
            console.error('Error adding comment:', error);
            alert('오류가 발생했습니다.');
        } finally {
            setSubmittingComment(false);
        }
    };
    
    // 댓글 수정 시작
    const handleEditCommentStart = (comment: Comment) => {
        setEditingCommentId(comment._id);
        setEditCommentContent(comment.content);
    };
    
    // 댓글 수정 취소
    const handleEditCommentCancel = () => {
        setEditingCommentId(null);
        setEditCommentContent('');
    };
    
    // 댓글 수정 저장
    const handleEditCommentSave = async (commentId: string) => {
        if (!editCommentContent.trim()) return;
        
        try {
            const response = await fetch(`/blog/${params.id}/comments/${commentId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ content: editCommentContent }),
            });
            
            if (response.ok) {
                const data = await response.json();
                setComments(prev => 
                    prev.map(c => c._id === commentId ? data.comment : c)
                );
                setEditingCommentId(null);
                setEditCommentContent('');
            } else {
                const errorData = await response.json();
                alert(`댓글 수정에 실패했습니다: ${errorData.error}`);
            }
        } catch (error) {
            console.error('Error updating comment:', error);
            alert('오류가 발생했습니다.');
        }
    };
    
    // 댓글 삭제
    const handleDeleteComment = async (commentId: string) => {
        if (!confirm('정말로 이 댓글을 삭제하시겠습니까?')) return;
        
        try {
            const response = await fetch(`/blog/${params.id}/comments/${commentId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            
            if (response.ok) {
                setComments(prev => prev.filter(c => c._id !== commentId));
            } else {
                const errorData = await response.json();
                alert(`댓글 삭제에 실패했습니다: ${errorData.error}`);
            }
        } catch (error) {
            console.error('Error deleting comment:', error);
            alert('오류가 발생했습니다.');
        }
    };

    return (
        <div className="min-h-screen min-w-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4">

                <br/><br/><br/>
                <div className='flex justify-between items-center mb-6'>
                    <button
                        onClick={() => router.back()}
                        className="mini-button mb-6 bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
                    >
                        ← 돌아가기
                    </button>

                    {/* 작성자만 수정/삭제 버튼 표시 */}
                    {post && currentUserId && post.authorId === currentUserId && (
                        <div className='flex gap-2'>
                            <button
                                onClick={handleEdit}
                                className="mini-button mb-6 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                            >
                                수정 
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={isDeleting}
                                className="mini-button mb-6 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isDeleting ? "삭제 중..." : "삭제"}
                            </button>
                        </div>
                    )}
                </div>

                <article className="bg-white rounded-lg shadow-lg overflow-hidden">
                    
                    <div className="p-8">
                        <h1 className="text-3xl font-bold text-gray-900 mb-4">
                            {post.title}
                        </h1>
                        
                        <div className="flex items-center text-gray-600 mb-6">
                            <span className="mr-4">작성자: {post.author}</span>
                            <span>작성일: {post.date}</span>
                        </div>

                        <div className="prose max-w-none">
                            <ReactMarkdown 
                                remarkPlugins={[remarkGfm]}
                                rehypePlugins={[rehypeRaw]}
                                components={markdownComponents}
                            >
                                {post.content}
                            </ReactMarkdown>
                        </div>
                    </div>
                </article>
                
                {/* 댓글 섹션 */}
                <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
                    <h2 className="text-xl font-bold mb-4">댓글</h2>
                    
                    {/* 댓글 작성 폼 */}
                    <form onSubmit={handleAddComment} className="mb-6">
                        <div className="flex flex-col space-y-2">
                            <textarea
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                placeholder="댓글을 작성하세요..."
                                className="w-full border border-gray-300 rounded-lg p-2 min-h-[100px] focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
                                required
                            />
                            <div className="flex justify-end">
                                <button
                                    type="submit"
                                    disabled={submittingComment}
                                    className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {submittingComment ? "등록 중..." : "댓글 등록"}
                                </button>
                            </div>
                        </div>
                    </form>
                    
                    {/* 댓글 목록 */}
                    <div className="space-y-4">
                        {comments.length === 0 ? (
                            <p className="text-gray-500 text-center py-4">아직 댓글이 없습니다.</p>
                        ) : (
                            comments.map(comment => (
                                <div key={comment._id} className="border-b border-gray-200 pb-4">
                                    {editingCommentId === comment._id ? (
                                        // 댓글 수정 폼
                                        <div className="flex flex-col space-y-2">
                                            <textarea
                                                value={editCommentContent}
                                                onChange={(e) => setEditCommentContent(e.target.value)}
                                                className="w-full border border-gray-300 rounded-lg p-2 min-h-[80px] focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                            />
                                            <div className="flex justify-end space-x-2">
                                                <button
                                                    onClick={() => handleEditCommentCancel()}
                                                    className="bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600"
                                                >
                                                    취소
                                                </button>
                                                <button
                                                    onClick={() => handleEditCommentSave(comment._id)}
                                                    className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                                                >
                                                    저장
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        // 댓글 표시
                                        <>
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <p className="font-medium text-gray-800">{comment.author}</p>
                                                    <p className="text-sm text-gray-500">{comment.createdAt}</p>
                                                </div>
                                                {/* 댓글 작성자만 수정/삭제 버튼 표시 */}
                                                {currentUserId === comment.authorId && (
                                                    <div className="flex space-x-2">
                                                        <button
                                                            onClick={() => handleEditCommentStart(comment)}
                                                            className="mini-button text-white-600 hover:text-blue-100 text-sm"
                                                        >
                                                            수정
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteComment(comment._id)}
                                                            className="mini-button text-white-600 hover:text-red-400 text-sm"
                                                        >
                                                            삭제
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                            <p className="mt-2 text-gray-700">{comment.content}</p>
                                        </>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );


}