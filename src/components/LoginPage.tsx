import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, School, Users, BookOpen } from 'lucide-react';

interface LoginPageProps {
  onLogin: (email: string, password: string) => Promise<boolean>;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: "Error",
        description: "Silakan isi email dan password",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const success = await onLogin(email, password);
      // Hapus duplikat toast error di sini!
      // if (!success) {
      //   toast({
      //     title: "Login Gagal",
      //     description: "Email atau password salah",
      //     variant: "destructive"
      //   });
      // }
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: "Error",
        description: "Terjadi kesalahan saat login",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = (role: 'admin' | 'guru') => {
    if (role === 'admin') {
      setEmail('ahmad.wijaya@smkalhuda.sch.id');
      setPassword('admin123');
    } else {
      setEmail('sri.mulyati@smkalhuda.sch.id');
      setPassword('guru123');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8 animate-fade-in">
        {/* Header Sekolah */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-3">
            <div className="bg-primary text-white p-3 rounded-full">
              <School className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                SMK AL-HUDA
              </h1>
              <p className="text-sm text-gray-600">KOTA KEDIRI</p>
            </div>
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-gray-800">
              Sistem Informasi Absensi & Nilai
            </h2>
            <p className="text-gray-600 text-sm">
              Silakan masuk dengan akun guru Anda
            </p>
          </div>
        </div>

        {/* Form Login */}
        <Card className="p-8 shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-700 font-medium">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="nama@smkalhuda.sch.id"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12 border-gray-200 focus:border-primary focus:ring-primary"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-700 font-medium">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Masukkan password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 pr-12 border-gray-200 focus:border-primary focus:ring-primary"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-12 bg-primary hover:bg-primary-600 text-white font-medium rounded-lg transition-all duration-200 hover:shadow-lg"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Masuk...</span>
                </div>
              ) : (
                'Masuk'
              )}
            </Button>
          </form>

          {/* Demo Accounts */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-600 text-center mb-4">
              Demo Akun untuk Testing:
            </p>
            <div className="grid grid-cols-2 gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleDemoLogin('admin')}
                className="h-10 text-xs border-primary text-primary hover:bg-primary hover:text-white"
              >
                <Users className="h-4 w-4 mr-2" />
                Admin
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleDemoLogin('guru')}
                className="h-10 text-xs border-primary text-primary hover:bg-primary hover:text-white"
              >
                <BookOpen className="h-4 w-4 mr-2" />
                Guru
              </Button>
            </div>
          </div>
        </Card>

        {/* Footer */}
        <div className="text-center text-sm text-gray-500">
          <p>&copy; 2024 SMK AL-HUDA Kota Kediri. Semua hak dilindungi.</p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
