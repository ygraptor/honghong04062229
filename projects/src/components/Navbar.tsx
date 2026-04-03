'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Heart, User, LogOut, LogIn, UserPlus, Menu, X, Trophy } from 'lucide-react';

interface UserInfo {
  id: number;
  username: string;
}

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // 检查登录状态
  const checkAuth = async () => {
    try {
      console.log('=== [导航栏] 开始检查登录状态 ===');
      console.log('[导航栏] 当前 pathname:', pathname);
      console.log('[导航栏] 当前 document.cookie:', document.cookie);
      
      const response = await fetch('/api/auth/user', {
        credentials: 'include',
      });
      
      console.log('[导航栏] API响应状态:', response.status);
      
      const data = await response.json();
      console.log('[导航栏] API返回数据:', JSON.stringify(data));
      
      if (data.isLoggedIn && data.user) {
        console.log('[导航栏] 设置用户状态:', data.user.username);
        setUser(data.user);
      } else {
        console.log('[导航栏] 用户未登录，设置 user 为 null');
        setUser(null);
      }
    } catch (error) {
      console.error('[导航栏] 检查登录状态失败:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // 路由变化时检查登录状态
  useEffect(() => {
    checkAuth();
  }, [pathname]);

  // 退出登录
  const handleLogout = async () => {
    try {
      await fetch('/api/auth/login', { 
        method: 'DELETE',
        credentials: 'include',
      });
      setUser(null);
      router.push('/');
      router.refresh();
    } catch (error) {
      console.error('退出登录失败:', error);
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
              <Heart className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
              AI伴侣哄哄乐
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-3">
            {loading ? (
              <div className="w-24 h-8 bg-gray-100 animate-pulse rounded-lg" />
            ) : user ? (
              <>
                {/* 用户信息 */}
                <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-full">
                  <Avatar className="w-6 h-6">
                    <AvatarFallback className="bg-gradient-to-br from-pink-400 to-purple-400 text-white text-xs">
                      {user.username.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium text-gray-700">{user.username}</span>
                </div>
                
                {/* 排行榜链接 */}
                <Link href="/leaderboard">
                  <Button variant="ghost" size="sm" className="text-gray-600 hover:text-pink-500">
                    <Trophy className="w-4 h-4 mr-1" />
                    排行榜
                  </Button>
                </Link>
                
                {/* 退出按钮 */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <LogOut className="w-4 h-4 mr-1" />
                  退出
                </Button>
              </>
            ) : (
              <>
                {/* 排行榜链接 */}
                <Link href="/leaderboard">
                  <Button variant="ghost" size="sm" className="text-gray-600 hover:text-pink-500">
                    <Trophy className="w-4 h-4 mr-1" />
                    排行榜
                  </Button>
                </Link>
                
                {/* 登录按钮 */}
                <Link href="/login">
                  <Button variant="ghost" size="sm" className="text-gray-600 hover:text-pink-500">
                    <LogIn className="w-4 h-4 mr-1" />
                    登录
                  </Button>
                </Link>
                
                {/* 注册按钮 */}
                <Link href="/login">
                  <Button
                    size="sm"
                    className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white"
                  >
                    <UserPlus className="w-4 h-4 mr-1" />
                    注册
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-gray-600 hover:text-gray-900"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-3 border-t border-gray-100">
            {loading ? (
              <div className="w-full h-8 bg-gray-100 animate-pulse rounded-lg" />
            ) : user ? (
              <div className="space-y-2">
                {/* 用户信息 */}
                <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="bg-gradient-to-br from-pink-400 to-purple-400 text-white">
                      {user.username.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-medium text-gray-700">{user.username}</span>
                </div>
                
                {/* 排行榜 */}
                <Link href="/leaderboard" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start text-gray-600">
                    <Trophy className="w-4 h-4 mr-2" />
                    排行榜
                  </Button>
                </Link>
                
                {/* 退出 */}
                <Button
                  variant="ghost"
                  className="w-full justify-start text-gray-500"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  退出登录
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                {/* 排行榜 */}
                <Link href="/leaderboard" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start text-gray-600">
                    <Trophy className="w-4 h-4 mr-2" />
                    排行榜
                  </Button>
                </Link>
                
                {/* 登录 */}
                <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start text-gray-600">
                    <LogIn className="w-4 h-4 mr-2" />
                    登录
                  </Button>
                </Link>
                
                {/* 注册 */}
                <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button className="w-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white">
                    <UserPlus className="w-4 h-4 mr-2" />
                    注册
                  </Button>
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
