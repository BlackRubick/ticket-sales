import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Alert } from '../../components/ui/Alert';
import { Card } from '../../components/ui/Card';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, isLoading } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      await login({ email, password });
    } catch (err: any) {
      setError(err.message || 'Error de autenticación');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Nebula</h1>
          <p className="text-gray-600">Sistema de gestión de boletos</p>
        </div>

        <Card>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-semibold text-gray-900">Iniciar Sesión</h2>
            </div>

            {error && <Alert type="error" message={error} />}

            <Input
              type="email"
              label="Correo electrónico"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              required
            />

            <Input
              type="password"
              label="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />

            <Button
              type="submit"
              className="w-full"
              loading={isLoading}
              disabled={!email || !password}
            >
              {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </Button>

            <div className="text-center text-sm text-gray-600">
              <p>Credenciales de prueba:</p>
              <p>admin@nebula.com / admin123</p>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};