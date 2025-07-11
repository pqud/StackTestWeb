"use client"

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';



export default function Signin(){
    const [email, setEmail] = useState('');
    const [userName, setuserName] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const router = useRouter();
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        try {
            const res = await fetch('/signin/api', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, userName, password }),
            });
            if (!res.ok) {
                const data = await res.json();
                setError(data.message || '회원가입 실패');
            } else {
                alert('계정 생성!');
                router.push('/login'); // 성공 시 /login으로 이동
            }
        } catch (err) {
            setError('서버 오류!');
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
                    Create Account 
                </h2>
            </div>        


            <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
                <form className="space-y-6" onSubmit={handleSubmit}>
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
                                value={email}
                                onChange={e=>setEmail(e.target.value)}
                                autoComplete="email"
                                className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                            />
                        </div>
                    </div>

                    <div>
                    <div className="flex items-center justify-between">
                            <label htmlFor="ID" className="block text-sm/6 font-medium text-gray-900">
                                ID
                            </label>
                        </div>
                        <div className="mt-2">
                            <input
                                id="userName"
                                name="userName"
                                type="userName"
                                required
                                value={userName}
                                onChange={e=>setuserName(e.target.value)}
                                className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                            />
                        </div>
                    </div>

                    <div>
                        <div className="flex items-center justify-between">
                            <label htmlFor="password" className="block text-sm/6 font-medium text-gray-900">
                                Password
                            </label>
                        </div>
                        <div className="mt-2">
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                value={password}
                                onChange={e=>setPassword(e.target.value)}
                                autoComplete="current-password"
                                className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                            />
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm/6 font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                        >
                            Create Account
                        </button>
                    </div>
                    {error && <div className='text-red-500'>{error}</div>}
                </form>   

                
            </div>   
        </div>
        </>
    )
}