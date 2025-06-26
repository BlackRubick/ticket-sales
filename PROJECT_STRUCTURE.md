# Estructura del Proyecto - Sistema de Venta de Boletos

## Descripción
Sistema de venta de boletos con generación de QR, administración y escaneo.

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
- Servicios para API, autenticación, tickets y QR

### `/src/hooks/`
- Custom hooks para lógica reutilizable

### `/src/utils/`
- Utilidades para formateo, validación y helpers

### `/src/context/`
- Context providers para estado global

### `/src/styles/`
- Estilos CSS organizados por componentes, páginas y utilidades

## Funcionalidades Principales
1. **Login** - Autenticación de usuarios
2. **Dashboard Admin** - Panel administrativo con estadísticas
3. **Venta de Boletos** - Generación de boletos con QR
4. **Gestión de Boletos** - Visualización y reenvío
5. **Escáner QR** - Validación de boletos

## Próximos Pasos
1. Instalar dependencias necesarias
2. Configurar React Router
3. Implementar autenticación
4. Desarrollar generación de QR
5. Implementar escáner de códigos
