"use client"

import { useState } from 'react'
import Link from "next/link"

const navigation = [
  { name: 'Blog', href: '#' },
  { name: 'Communi', href: '#' },
  { name: 'Marketplace', href: '#' },
  { name: 'Company', href: '#' },
]

export default function Example() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="min-w-screen bg-white">

      <div className="relative isolate px-6 pt-14 lg:px-8">
        <div
          aria-hidden="true"
          className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
        >
        <div
            style={{
              clipPath:
                'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
            }}
            className="relative left-[calc(50%-11rem)] aspect-1155/678 w-144.5 -translate-x-1/2 rotate-30 bg-linear-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%-30rem)] sm:w-288.75"
        /></div>

        {/* <div className="relative isolate px-6 pt-14 lg:px-8"> */}
          {/* 비디오 배경 */}
          <video 
              autoPlay 
              loop 
              muted 
              playsInline
              className="absolute top-0 left-0 w-full h-full object-cover -z-10"
          >
              <source src="https://videocdn.cdnpk.net/videos/410f69ff-16f0-4320-9c54-dbaa258c89e4/horizontal/previews/clear/large.mp4?token=exp=1750249868~hmac=10ac8e8dba3389673bfbbd84daa892991f69c5cf2ba168920b861a14d7ae12a8" type="video/webm" />
          </video>
          
          {/* 어두운 오버레이 추가 */}
          <div className="absolute inset-0 bg-black/30 -z-10"></div>
          
          {/* 기존 컨텐츠들... */}
        {/* </div> */}


        <div className='mx-auto max-w-2xl py-32 sm:py-48 lg:py-56'>
          <div className='hidden sm:mb-8 sm:flex sm:justify-center'>
          <div className="relative rounded-full px-3 py-1 text-sm/6 text-white-600 ring-1 ring-white-900/10 hover:ring-white-900/20">
              개인별 과제 보러가기.{' '}
              <a href="https://jungle-compass.krafton.com/mod/page/view.php?id=7698" className="main-font font-semibold text-indigo-600">
                <span aria-hidden="true" className="absolute inset-0" />
                Read more <span aria-hidden="true">&rarr;</span>
              </a>
            </div>
          </div>
          <div className='text-center'>
            <h1 className="main-font text-5xl font-semibold tracking-tight text-gray-900 sm:text-7xl">
                가장 간단한 사이트를 <br /> 만들어 봅시다.
              </h1>
            <p className="main-font mt-8 text-lg font-medium text-pretty text-gray-500 sm:text-xl/8">
              이 사이트에서는 회원가입/로그인, 게시물 작성, 게시물 목록 보기, 게시물 읽기, 댓글 작성과 같은 기능을 필수로 구현해야 합니다.
              프론트적으로는 게시판 UI를 구현하고, 백엔드에서는 게시판 Server API를 구현해야 합니다.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
            <a
                href="#"
                className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                Get started
              </a>
              <a href="#" className="text-sm/6 font-semibold text-gray-900">
                Learn more <span aria-hidden="true">→</span>
              </a>
            </div>
          </div>
        </div>
        <div
          aria-hidden="true"
          className="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]"
        >
          <div
            style={{
              clipPath:
                'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
            }}
            className="relative left-[calc(50%+3rem)] aspect-1155/678 w-144.5 -translate-x-1/2 bg-linear-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%+36rem)] sm:w-288.75"
          />
        </div>
      </div>
    </div>
  )
}
