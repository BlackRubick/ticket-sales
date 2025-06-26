# Estructura del Proyecto - Sistema de Venta de Boletos

## Descripción
Frontend en React + TypeScript para sistema de venta de boletos que consume API REST en Python.
Incluye generación de QR, administración y escaneo de boletos.

## Arquitectura
- **Frontend**: React + TypeScript + Vite + CSS puro
- **Backend**: API REST en Python (separado)
- **Comunicación**: HTTP/REST API con tipado fuerte

## Estructura de Carpetas

### `/src/components/`
- `common/` - Componentes reutilizables (Header, Footer, Modal, etc.)
- `forms/` - Formularios específicos (Login, Ticket, Search)
- `layout/` - Componentes de layout (MainLayout, AdminLayout)
- `ui/` - Componentes de interfaz básicos (Button, Input, Card)

### `/src/pages/`
- `login/` - Página de autenticación
- `admin/` - Dashboard administrativo y estadísticas
- `sales/` - Venta y generación de boletos
- `tickets/` - Gestión y reenvío de boletos
- `scanner/` - Escaneo de códigos QR

### `/src/services/`
- `apiClient.ts` - Cliente HTTP principal para la API Python
- `httpService.ts` - Servicio base HTTP con interceptors
- `authService.ts` - Autenticación y manejo de tokens
- `ticketService.ts` - Operaciones de boletos
- `adminService.ts` - Servicios administrativos y estadísticas
- `qrService.ts` - Generación y validación de códigos QR

### `/src/types/`
- `auth.ts` - Tipos para autenticación y usuarios
- `ticket.ts` - Tipos para boletos y eventos
- `api.ts` - Tipos para respuestas de API
- `user.ts` - Tipos de usuarios y perfiles
- `common.ts` - Tipos comunes y utilidades

### `/src/config/`
- `api.ts` - Configuración base de la API
- `endpoints.ts` - URLs de endpoints del backend Python
- `routes.ts` - Rutas del frontend
- `constants.ts` - Constantes globales

### `/src/hooks/`
- Custom hooks con tipado TypeScript para lógica reutilizable

### `/src/utils/`
- Utilidades con tipado para formateo, validación y helpers

### `/src/context/`
- Context providers tipados para estado global

### `/src/styles/`
- Estilos CSS organizados por componentes, páginas y utilidades

## Funcionalidades Principales
1. **Login** - Autenticación tipada con API Python
2. **Dashboard Admin** - Panel con estadísticas del backend
3. **Venta de Boletos** - Creación de boletos via API + generación QR
4. **Gestión de Boletos** - Consulta y reenvío de boletos
5. **Escáner QR** - Validación de boletos con el backend

## Ventajas de TypeScript
- **Tipado fuerte** para todas las interfaces con la API Python
- **Autocompletado** mejorado en el IDE
- **Detección temprana** de errores de tipos
- **Mejor refactoring** y mantenimiento del código
- **Documentación implícita** a través de los tipos

## Integración con API Python
- Todos los servicios están tipados para consumir endpoints REST
- Interfaces TypeScript para todas las respuestas de la API
- Manejo de autenticación basada en tokens con tipos
- Interceptors tipados para headers automáticos y manejo de errores
- Configuración centralizada de URLs del backend

## Próximos Pasos
1. Configurar URLs del backend Python en `/src/config/endpoints.ts`
2. Definir tipos en `/src/types/` basados en tu API Python
3. Implementar cliente HTTP tipado en `/src/services/apiClient.ts`
4. Desarrollar servicios tipados para cada módulo
5. Implementar autenticación con tipos seguros
