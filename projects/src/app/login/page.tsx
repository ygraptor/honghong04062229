'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Heart, User, Lock, Eye, EyeOff, ArrowLeft, CheckCircle } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    // 注册时校验密码一致性
    if (!isLogin && password !== confirmPassword) {
      setError('两次输入的密码不一致');
      return;
    }
    
    setLoading(true);

    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      
      console.log('=== [登录页面] 开始发送登录请求 ===');
      console.log('[登录页面] 请求端点:', endpoint);
      console.log('[登录页面] 用户名:', username);
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
        credentials: 'include',
      });

      const data = await response.json();
      
      console.log('[登录页面] 响应状态:', response.status);
      console.log('[登录页面] 响应数据:', JSON.stringify(data));
      console.log('[登录页面] 响应是否成功:', response.ok);

      if (!response.ok) {
        setError(data.error || '操作失败');
        return;
      }

      // 显示成功提示
      setSuccess(isLogin ? '登录成功！正在跳转...' : '注册成功！正在跳转...');
      
      console.log('=== [登录页面] 准备跳转到首页 ===');
      console.log('[登录页面] 跳转前检查 document.cookie:', document.cookie);
      
      // 延迟跳转，让用户看到成功提示，并强制刷新页面
      setTimeout(() => {
        console.log('[登录页面] 执行跳转 window.location.href = "/"');
        window.location.href = '/';
      }, 1000);
    } catch (err) {
      console.error('[登录页面] 请求错误:', err);
      setError('网络错误，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* 背景图片 */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: 'url(/background.png)' }}
      />
      {/* 轻透遮罩层 */}
      <div className="absolute inset-0 bg-white/40" />
      
      {/* 内容区域 */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-white/90 backdrop-blur-sm shadow-xl border-0">
          <CardHeader className="text-center pb-2">
            {/* 返回按钮 */}
            <Link href="/" className="absolute left-4 top-4">
              <Button variant="ghost" size="icon" className="text-gray-500">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            
            <div className="flex justify-center mb-3">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center shadow-lg">
                <Heart className="w-7 h-7 text-white" />
              </div>
            </div>
            <CardTitle className="text-2xl bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
              {isLogin ? '欢迎回来' : '注册账号'}
            </CardTitle>
            <p className="text-gray-500 text-sm mt-1">
              {isLogin ? '登录开始你的哄人之旅' : '创建账号，开启哄人之旅'}
            </p>
          </CardHeader>
          
          <CardContent className="pt-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* 用户名输入 */}
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="用户名"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="pl-10"
                  maxLength={20}
                  required
                />
              </div>

              {/* 密码输入 */}
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="密码"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10"
                  minLength={6}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* 确认密码输入 - 仅注册时显示 */}
              {!isLogin && (
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    type="password"
                    placeholder="确认密码"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-10"
                    minLength={6}
                    required
                  />
                </div>
              )}

              {/* 错误提示 */}
              {error && (
                <div className="text-red-500 text-sm text-center bg-red-50 py-2 rounded-lg">
                  {error}
                </div>
              )}

              {/* 成功提示 */}
              {success && (
                <div className="text-green-600 text-sm text-center bg-green-50 py-2 rounded-lg flex items-center justify-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  {success}
                </div>
              )}

              {/* 提交按钮 */}
              <Button
                type="submit"
                className="w-full h-11 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600"
                disabled={loading}
              >
                {loading ? '处理中...' : (isLogin ? '登录' : '注册')}
              </Button>
            </form>

            {/* 切换登录/注册 */}
            <div className="mt-4 text-center text-sm text-gray-500">
              {isLogin ? (
                <>
                  还没有账号？
                  <button
                    type="button"
                    onClick={() => {
                      setIsLogin(false);
                      setError('');
                      setSuccess('');
                      setConfirmPassword('');
                    }}
                    className="text-pink-500 hover:text-pink-600 ml-1 font-medium"
                  >
                    立即注册
                  </button>
                </>
              ) : (
                <>
                  已有账号？
                  <button
                    type="button"
                    onClick={() => {
                      setIsLogin(true);
                      setError('');
                      setSuccess('');
                      setConfirmPassword('');
                    }}
                    className="text-pink-500 hover:text-pink-600 ml-1 font-medium"
                  >
                    去登录
                  </button>
                </>
              )}
            </div>

            {/* 游客模式 */}
            <div className="mt-4 pt-4 border-t border-gray-100 text-center">
              <Link href="/">
                <Button variant="ghost" className="text-gray-500 text-sm">
                  暂不登录，先看看
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
