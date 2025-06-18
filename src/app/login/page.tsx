"use client"

import { extractEtag } from "next/dist/server/image-optimizer";
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from "next/link"

type Credentials={
    username:string;
    password:string;
}

  
export default function Login() {
    const [username, setUserName] = React.useState<string>('');
    const [password, setPassword] = React.useState<string>('');
    const [error, setError] = React.useState<string>(''); // useState import 명시
    const { setToken } = useAuth();
    const router = useRouter();

    async function loginUser(credentials: Credentials): Promise<string> {
        const response = await fetch('/login/api', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(credentials),
        });
        if (!response.ok) {
            // 서버가 에러 메시지를 반환하는 경우
            const data = await response.json();
            throw new Error(data.message || '로그인 실패');
        }
    const data = await response.json();
    return data.token; // 예: { token: "..." } 형태 응답 가정
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(''); // 제출 시 에러 초기화
        try {
            const token = await loginUser({ username, password });
            localStorage.setItem('token',token);
            setToken(token);
            router.push('/'); //로그인 성공 시 메인화면 이동
        } catch (err: any) {
            setError(err.message || '서버 오류');
        }
    };

    return (
        <>
        <div className="min-w-lvw h-dvh bg-white">

            <div className="sm:mx-auto sm:w-full sm:max-w-sm">
                <img
                    alt=""
                    src="./src/assets/dog.png"
                    className="mx-auto h-10 w-auto"
                    ></img>
                <h2 className="mt-10 text-center text-2xl/9 font-bold tracking-tight text-gray-900">
                    Sign in to your account
                </h2>
            </div>        


            <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
                <form onSubmit={handleSubmit} method="POST" className="space-y-6">
                    <div>
                        <label htmlFor="email" className="block text-sm/6 font-medium text-gray-900">
                            Email address
                        </label>
                        <div className="mt-2">
                            <input
                                id="email"
                                name="email"
                                type="email"
                                required
                                autoComplete="email"
                                value={username}
                                onChange={e => setUserName(e.target.value)}
                                className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                            />
                        </div>
                    </div>

                    <div>
                        <div className="flex items-center justify-between">
                            <label htmlFor="password" className="block text-sm/6 font-medium text-gray-900">
                                Password
                            </label>
                            <div className="text-sm">
                                <a href="#" className="font-semibold text-indigo-600 hover:text-indigo-500">
                                    Forgot password?
                                </a>
                            </div>
                        </div>
                        <div className="mt-2">
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                autoComplete="current-password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                            />
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm/6 font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                        >
                            Sign in
                        </button>
                    </div>
                    {error && <div className='text-red-500'>{error}</div>}
                </form>   

                <p className="mt-10 text-center text-sm/6 text-gray-500">
                    계정이 없습니까?{' '}
                    <Link href="/signin" className="font-semibold text-indigo-600 hover:text-indigo-500">
                    계정 생성하기
                    </Link>
                </p>
            </div>   
        </div>
        </>
    )
}
