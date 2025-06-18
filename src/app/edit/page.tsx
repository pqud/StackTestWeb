"use client"

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import type { Components } from 'react-markdown';

export default function Edit(){
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [isSubmitting, setIsSubmitting]= useState(false);
  const [postId, setPostId] = useState<string | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  // 통합 에디터로 변경하여 탭이 필요 없어짐
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // URL 파라미터에서 글 정보 가져오기
  useEffect(() => {
    const id = searchParams.get('id');
    const titleParam = searchParams.get('title');
    const contentParam = searchParams.get('content');
    
    if (id && titleParam && contentParam) {
      setPostId(id);
      setTitle(decodeURIComponent(titleParam));
      setContent(decodeURIComponent(contentParam));
      setIsEditMode(true);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // 쿠키에서 토큰 가져오기 또는 localStorage에서 가져오기
      const token = localStorage.getItem('token') || 
                    document.cookie.split('; ')
                        .find(row => row.startsWith('token='))
                        ?.split('=')[1];

    if (!token) {
      alert('로그인이 필요합니다.');
      return;
    }

    // 수정 모드인지 새 글 작성 모드인지에 따라 API 엔드포인트와 메서드 결정
    const apiUrl = isEditMode ? `/blog/${postId}/api` : '/edit/api';
    const method = isEditMode ? 'PUT' : 'POST';
    
    const response = await fetch(apiUrl, {
        method: method,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
        body: JSON.stringify({
            title: title,
            content: content,
        }),
    });

    if (response.ok) {
        setTitle("");
        setContent("");
        alert(isEditMode ? "글이 성공적으로 수정되었습니다!" : "글이 성공적으로 저장되었습니다!");
        router.push(isEditMode ? `/blog/${postId}` : '/blog');
    } else {
        const errorData = await response.json();
        alert(`글 ${isEditMode ? '수정' : '저장'}에 실패했습니다: ${errorData.error}`);
    }
    } catch (error) {
        console.error('Error:', error);
        alert("오류가 발생했습니다.");
    } finally {
        setIsSubmitting(false);
    }
  };


  const markdownComponents:Components={
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

  return (
    <>
      <div className=" min-h-screen min-w-screen bg-white">
        <div className="container mx-auto max-w-7xl px-4 py-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-sm">
          <img
            alt=""
            src="./src/assets/dog.png"
            className="mx-auto h-10 w-auto"
          />
          <h2 className="mt-4 text-center text-2xl font-bold tracking-tight text-gray-900">
            {isEditMode ? '글 수정하기' : '글쓰기'}
          </h2>
        </div>    
        <form onSubmit={handleSubmit} className="space-y-6">

          {/* 저장 버튼 */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="mini-button px-8 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isSubmitting ? "저장 중..." : isEditMode ? "글 수정" : "글 발행"}
            </button>
          </div>

          {/* 제목 입력 */}
          <div>
            <label className="block text-lg font-medium text-gray-700 mb-3">
              제목
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="block w-full rounded-lg border border-gray-300 px-4 py-3 text-lg text-gray-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all bg-white"
              placeholder="제목을 입력하세요..."
            />
          </div>
          
          {/* 데스크톱: 좌우 분할, 모바일: 탭 방식 */}
          <div className="flex flex-col lg:flex-row gap-6 h-96 lg:h-[600px]">
            {/* 통합 에디터로 변경하여 탭 버튼 제거 */}

            {/* 통합 에디터 영역 */}
            <div className="flex-1">
              <div className="mb-3">
                <h3 className="text-lg font-medium text-gray-700">마크다운 에디터</h3>
                <p className="text-sm text-gray-500">마크다운 문법을 사용하여 글을 작성하세요</p>
              </div>
              
              {/* 마크다운 단축키 버튼 */}
              <div className="flex flex-wrap gap-2 mb-2">
                {/* 글자 크기 변경 - 드롭다운 */}
                <div className="dropdown">
                  <button
                    type="button"
                    className="markdown-button px-2 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                    title="제목"
                  >
                    제목 ▼
                  </button>
                  <div className="dropdown-content">
                    <button
                      type="button"
                      onClick={() => setContent(prev => prev + '# ')}
                      className="markdown-button px-2 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 w-full text-left"
                    >
                      H1
                    </button>
                    <button
                      type="button"
                      onClick={() => setContent(prev => prev + '## ')}
                      className="markdown-button px-2 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 w-full text-left"
                    >
                      H2
                    </button>
                    <button
                      type="button"
                      onClick={() => setContent(prev => prev + '### ')}
                      className="markdown-button px-2 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 w-full text-left"
                    >
                      H3
                    </button>
                    <button
                      type="button"
                      onClick={() => setContent(prev => prev + '\n')}
                      className="markdown-button px-2 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 w-full text-left"
                    >
                      본문
                    </button>
                  </div>
                </div>
                
                {/* 텍스트 스타일 */}
                <button
                  type="button"
                  onClick={() => setContent(prev => prev + '**굵은 글씨**')}
                  className="markdown-button px-2 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 font-bold"
                  title="굵은 글씨"
                >
                  B
                </button>
                <button
                  type="button"
                  onClick={() => setContent(prev => prev + '*기울임*')}
                  className="markdown-button px-2 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 italic"
                  title="기울임"
                >
                  I
                </button>
                <button
                  type="button"
                  onClick={() => setContent(prev => prev + '<span style="text-decoration: underline; color: #374151;">밑줄</span>')}
                  className="markdown-button px-2 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 underline"
                  title="밑줄"
                >
                  U
                </button>
                <button
                  type="button"
                  onClick={() => setContent(prev => prev + '~~취소선~~')}
                  className="markdown-button px-2 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 line-through"
                  title="취소선"
                >
                  S
                </button>
                
                {/* 글자색 및 배경색 - 드롭다운 */}
                <div className="dropdown">
                  <button
                    type="button"
                    className="markdown-button px-2 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                    title="글자색"
                  >
                    A ▼
                  </button>
                  <div className="dropdown-content">
                    <button
                      type="button"
                      onClick={() => setContent(prev => prev + '<span style="color: red;">글자색</span>')}
                      className="color-option"
                      style={{ backgroundColor: 'red' }}
                      title="빨간색"
                    />
                    <button
                      type="button"
                      onClick={() => setContent(prev => prev + '<span style="color: blue;">글자색</span>')}
                      className="color-option"
                      style={{ backgroundColor: 'blue' }}
                      title="파란색"
                    />
                    <button
                      type="button"
                      onClick={() => setContent(prev => prev + '<span style="color: green;">글자색</span>')}
                      className="color-option"
                      style={{ backgroundColor: 'green' }}
                      title="초록색"
                    />
                    <button
                      type="button"
                      onClick={() => setContent(prev => prev + '<span style="color: purple;">글자색</span>')}
                      className="color-option"
                      style={{ backgroundColor: 'purple' }}
                      title="보라색"
                    />
                    <button
                      type="button"
                      onClick={() => setContent(prev => prev + '<span style="color: orange;">글자색</span>')}
                      className="color-option"
                      style={{ backgroundColor: 'orange' }}
                      title="주황색"
                    />
                    <button
                      type="button"
                      onClick={() => setContent(prev => prev + '<span style="color: black;">글자색</span>')}
                      className="color-option"
                      style={{ backgroundColor: 'black' }}
                      title="검정색"
                    />
                  </div>
                </div>
                
                <div className="dropdown">
                  <button
                    type="button"
                    className="markdown-button px-2 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                    title="글자배경색"
                  >
                    BG ▼
                  </button>
                  <div className="dropdown-content">
                    <button
                      type="button"
                      onClick={() => setContent(prev => prev + '<span style="background-color: yellow; color: #374151;">배경색</span>')}
                      className="color-option"
                      style={{ backgroundColor: 'yellow' }}
                      title="노란색"
                    />
                    <button
                      type="button"
                      onClick={() => setContent(prev => prev + '<span style="background-color: lightblue; color: #374151;">배경색</span>')}
                      className="color-option"
                      style={{ backgroundColor: 'lightblue' }}
                      title="하늘색"
                    />
                    <button
                      type="button"
                      onClick={() => setContent(prev => prev + '<span style="background-color: lightgreen; color: #374151;">배경색</span>')}
                      className="color-option"
                      style={{ backgroundColor: 'lightgreen' }}
                      title="연두색"
                    />
                    <button
                      type="button"
                      onClick={() => setContent(prev => prev + '<span style="background-color: pink; color: #374151;">배경색</span>')}
                      className="color-option"
                      style={{ backgroundColor: 'pink' }}
                      title="분홍색"
                    />
                    <button
                      type="button"
                      onClick={() => setContent(prev => prev + '<span style="background-color: lavender; color: #374151;">배경색</span>')}
                      className="color-option"
                      style={{ backgroundColor: 'lavender' }}
                      title="연보라색"
                    />
                    <button
                      type="button"
                      onClick={() => setContent(prev => prev + '<span style="background-color: lightgray; color: #374151;">배경색</span>')}
                      className="color-option"
                      style={{ backgroundColor: 'lightgray' }}
                      title="회색"
                    />
                  </div>
                </div>
                
                {/* 정렬 */}
                <button
                  type="button"
                  onClick={() => setContent(prev => prev + '<p style="text-align: left; color: #374151;">왼쪽 정렬</p>')}
                  className="markdown-button px-2 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                  title="왼쪽 정렬"
                >
                  ←
                </button>
                <button
                  type="button"
                  onClick={() => setContent(prev => prev + '<p style="text-align: center; color: #374151;">가운데 정렬</p>')}
                  className="markdown-button px-2 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                  title="가운데 정렬"
                >
                  ↔
                </button>
                <button
                  type="button"
                  onClick={() => setContent(prev => prev + '<p style="text-align: right; color: #374151;">오른쪽 정렬</p>')}
                  className="markdown-button px-2 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                  title="오른쪽 정렬"
                >
                  →
                </button>
                <button
                  type="button"
                  onClick={() => setContent(prev => prev + '<p style="text-align: justify; color: #374151;">양쪽 정렬</p>')}
                  className="markdown-button px-2 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                  title="양쪽 정렬"
                >
                  ⇔
                </button>
                
                {/* 기타 요소 */}
                <button
                  type="button"
                  onClick={() => setContent(prev => prev + '> 인용문')}
                  className="markdown-button px-2 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                  title="인용"
                >
                  "
                </button>
                <button
                  type="button"
                  onClick={() => setContent(prev => prev + '\n<table style="border-collapse: collapse; width: 100%; color: #374151;">\n  <thead>\n    <tr>\n      <th style="border: 1px solid #d1d5db; padding: 8px; text-align: left;">제목1</th>\n      <th style="border: 1px solid #d1d5db; padding: 8px; text-align: left;">제목2</th>\n    </tr>\n  </thead>\n  <tbody>\n    <tr>\n      <td style="border: 1px solid #d1d5db; padding: 8px;">내용1</td>\n      <td style="border: 1px solid #d1d5db; padding: 8px;">내용2</td>\n    </tr>\n  </tbody>\n</table>\n')}
                  className="markdown-button px-2 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                  title="테이블"
                >
                  □
                </button>
                <button
                  type="button"
                  onClick={() => setContent(prev => prev + '[링크 텍스트](URL)')}
                  className="markdown-button px-2 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                  title="링크"
                >
                  🔗
                </button>
                <button
                  type="button"
                  onClick={() => setContent(prev => prev + '- ')}
                  className="markdown-button px-2 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                  title="리스트"
                >
                  •
                </button>
                <button
                  type="button"
                  onClick={() => setContent(prev => prev + '\n<hr style="border-top: 1px solid #d1d5db; margin: 1rem 0;" />\n')}
                  className="markdown-button px-2 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                  title="구분선"
                >
                  —
                </button>
              </div>
              
              {/* 통합 에디터/미리보기 영역 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full">
                {/* 에디터 부분 */}
                <div className="h-full">
                  <textarea
                    id="content"
                    name="content"
                    required
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder={`# 제목
## 소제목

**굵은 글씨**와 *기울임*을 사용할 수 있습니다.

- 목록 항목 1
- 목록 항목 2

\`\`\`javascript
console.log('코드 블록도 지원합니다');
\`\`\`

[링크](https://example.com)와 이미지도 가능합니다.`}
                    className="w-full h-full resize-none rounded-lg border border-gray-300 px-4 py-3 text-base text-gray-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all font-mono bg-white"
                  />
                </div>
                
                {/* 미리보기 부분 */}
                <div className="h-full border border-gray-200 rounded-lg p-4 bg-gray-50 overflow-y-auto">
                  {content ? (
                    <div className="prose prose-slate max-w-none">
                      <ReactMarkdown 
                        remarkPlugins={[remarkGfm]}
                        rehypePlugins={[rehypeRaw]}
                        components={markdownComponents}
                      >
                        {content}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    <div className="text-gray-400 text-center py-8">
                      내용을 입력하면 미리보기가 여기에 표시됩니다
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

        </form>
        </div>
      </div>
    </>
  );
}
