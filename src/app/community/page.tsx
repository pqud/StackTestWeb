"use client"

import Link from "next/link";
import {
    Card,
    CardHeader,
    CardBody,
    CardFooter,
    Typography,
    Button,
} from "@material-tailwind/react";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode";
import { David_Libre } from "next/font/google";


interface Post {
  _id: string;
  title: string;
  content: string;
  summary: string;
  image: string;
  author: string;
  date: string;
}

function BlogCard({ post } : {post:Post}) {
  const router = useRouter();
  const handleReadMore=()=>{
    router.push(`/blog/${post._id}`);
  };


  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden h-full flex flex-col">
      {/* 이미지 헤더 - 고정 높이 */}
      <div className="relative h-48 w-full overflow-hidden">
        <img
          src={post.image}
          alt={post.title}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
        />
      </div>
      
      {/* 카드 바디 - 유동적 높이 */}
      <div className="p-6 flex-1 flex flex-col">
        <h3 className="text-xl font-semibold text-gray-900 mb-3 line-clamp-2">
          {post.title}
        </h3>
        <p className="text-gray-600 text-sm mb-4 line-clamp-3 flex-1">
          {post.content.replace(/<[^>]*>?/gm, '').replace(/[#*`~\-_>|]/g, '')}
        </p>
        
        {/* 작성자 정보 */}
        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
          <span className="font-medium">{post.author}</span>
          <span>{post.date}</span>
        </div>
        
        {/* 버튼 */}
        <button 
          onClick={handleReadMore}
          className="w-full bg-gray-900 text-white py-2 px-4 rounded-md hover:bg-gray-800 transition-colors duration-200">
          Read More
        </button>
      </div>
    </div>
  );
}

export default function Blog() {
  
  const [posts,setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const {isAuthenticated, token, logout}=useAuth();
  const router = useRouter();

  useEffect(()=>{
    const fetchPosts = async()=>{
    try {
        const response = await fetch('/community/api', {
            headers: {
            'Content-Type': 'application/json',
            // 필요시에만 Authorization 헤더 추가
            ...(token && { 'Authorization': `Bearer ${token}` }),
            },
        });
        
        if(response.ok){
          const data=await response.json();
          setPosts(data.posts);
        }else{
          console.error('Failed to fetch posts');
        }
      }catch(error){
        console.error('Error fetching posts:',error);
      }finally{
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);


  return (
  <div className="min-h-screen min-w-screen bg-gray-50 py-8">
    <div className="max-w-6xl mx-auto px-4">
      <div className="text-center mb-12">
          <br/>
          <br/>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
                지금 올라오는 글 
          </h1>
          <p className="text-gray-600">모든 사용자의 최신 글을 확인하세요</p>
      </div>

      {loading ? (
          <div className="text-center">
              <div className="text-xl">로딩 중...</div>
          </div>
      ) : posts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.map((post) => (
                  <BlogCard key={post._id} post={post} />
              ))}
          </div>
      ) : (
          <div className="text-center">
              <p className="text-gray-600">아직 작성된 글이 없습니다.</p>
          </div>
      )}
    </div>
  </div>
  );
}
