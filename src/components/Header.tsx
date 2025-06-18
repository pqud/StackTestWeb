"use client"

import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode";

const navigation = [
    { name: 'Main', href: '/' },
    { name: 'Blog', href: '#' , requiresAuth:true},
    { name: 'Communinty', href: '/community' },
    { name: 'Company', href: '#' },
]


export default function Header(){
    const {isAuthenticated, token, logout}=useAuth();
    const router = useRouter();

    //jwt 토큰에서 Id 추출
    const getUserId = () => {
      if (!token) return null;
      try {
          const decoded = jwtDecode(token);
          console.log(decoded);
          return decoded.userName;  // id 또는 _id 필드 반환
      } catch (error) {
          console.error('JWT 디코딩 오류:', error);
          return null;
      }
    };
    const handleNavClick=(item:typeof navigation[0])=>{
        if(item.name==="Blog"){
            if(isAuthenticated){
                router.push('/blog');
            }else{
                router.push('/login');
            }
        }else if(item.href!=='#'){
            router.push(item.href);
        }
    };

    const handleLogout=()=>{
        logout();
        router.push('/');
    };

    return (
        <header className="absolute inset-x-0 top-0 z-50">
        <nav aria-label="Global" className="flex items-center justify-between p-6 lg:px-8">
          <div className='flex flex-1'>
            <a href='#' className='-m-1.5 p-1.5'>
              <span className='sr-only'>니회사</span>
              <img
                alt=""
                src="/dog.png"
                className='h-8 w-auto'
              />
            </a>
          </div>
          <div className='flex gap-x-12'>
            {navigation.map((item) => (
              <span
                key={item.name}
                onClick={() => handleNavClick(item)}
                className='header text-sm/6 font-semibold text-gray-900 hover:text-gray-700 cursor-pointer'
              >
                {item.name}
            </span>
           
            ))}
          </div>

          <div className='flex flex-1 justify-end'>
            {isAuthenticated?(
                <>
                    <span 
                      onClick={handleLogout}
                      className="text-sm font-medium text-gray-700 cursor-pointer">
                        {getUserId()}
                    </span>
                    {/* <button 
                        onClick={handleLogout}
                        className="text-sm font-semibold text-gray-900 hover:text-gray-700"
                    >
                    Log out <span aria-hidden="true">&larr;</span>
                    </button> */}
                </>
                ):(
                    <Link href="/login" className="text-sm font-semibold text-gray-900 hover:text-gray-700">
                    Log in <span aria-hidden="true">&rarr;</span> 
                    </Link>
                )}
          </div>
        </nav>
      </header>
    );

}
  

