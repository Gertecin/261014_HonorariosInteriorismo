cat > README.md << 'EOF'
# 261014_HonorariosInteriorismo

Herramienta móvil de asignación de honorarios por tipo de espacio y % sobre el presupuesto total y etapas de entrega (React y TailwindCSS).

## Características

✅ Dashboard con listado de proyectos, barra de progreso financiero y acciones rápidas.
✅ Creación de proyectos con modo dual de cálculo: porcentajes sobre presupuesto o valor $/m².
✅ Gestión secuencial de etapas (Anteproyecto → Proyecto Ejecutivo → Dirección de Obra).
✅ Checklist de entregables por etapa con bloqueo hasta cobrar la etapa anterior.
✅ Cobros secuenciales: no se puede cobrar una etapa sin haber cobrado la anterior.
✅ Cambio de alcance con recálculo automático respetando lo ya cobrado.
✅ Historial de etapas con fechas de entrega y cobro.
✅ Reinicio de tareas y eliminación de proyectos.
✅ Persistencia en localStorage.
✅ Mobile-first, sin desbordes horizontales.
✅ Paleta de identidad Bianchi: Blanco, Gris Cemento y Terracota.
✅ Tipografías: Futura (títulos) e Inter (texto).

## Cómo arrancar en local

### Requisitos

- Node.js 18+ (descargar en https://nodejs.org)
- npm (viene incluido con Node.js)

### Pasos

┌─────────────────────────────────────────────────────────────────┐
│ # 1. Clonar el repositorio                                      │
│ git clone https://github.com/Gertecin/261014_HonorariosInteriorismo.git │
│ cd 261014_HonorariosInteriorismo                                │
│                                                                 │
│ # 2. Instalar dependencias                                      │
│ npm install                                                     │
│                                                                 │
│ # 3. Iniciar servidor de desarrollo                             │
│ npm run dev                                                     │
└─────────────────────────────────────────────────────────────────┘

Nota: El servidor arrancará en http://localhost:5173/.

## Comandos Relevantes Bash

┌─────────────────────────────────────────────────────────────────┐
│ # Compilar para producción (genera carpeta dist/)               │
│ npm run build                                                   │
│                                                                 │
│ # Previsualizar la build de producción                          │
│ npm run preview                                                 │
│                                                                 │
│ # Verificar errores de TypeScript                               │
│ npx tsc --noEmit                                                │
└─────────────────────────────────────────────────────────────────┘

## Configuración importante para el despliegue

Importante: base: '/' en el archivo vite.config.ts es suficiente para un dominio propio. Si se despliega en GitHub Pages bajo una subruta, cambiar a base: '/261014_HonorariosInteriorismo/'.

## Gestión de claves usadas en LocalStorage

### Claves que se usan

La aplicación usa una clave en localStorage para la gestión de estado local:

┌─────────────────────┬──────────────────────────────────────────┬──────────────────────────────────────────────────────────────┐
│ Clave               │ Contenido                                │ Ejemplo                                                      │
├─────────────────────┼──────────────────────────────────────────┼──────────────────────────────────────────────────────────────┤
│ bianchi-proyectos   │ Array JSON de proyectos con sus etapas,  │ [{"id":"proj-1700000000000","nombre":"Reforma Casa a Hostal",│
│                     │ cobros e historial                       │ "cliente":"Inversiones del Sur S.A.","tipoEspacio":          │
│                     │                                          │ "Hospedaje","superficie":250,"presupuestoObra":80000000,     │
│                     │                                          │ "honorarioTotal":10000000,"anticipo":3000000,                │
│                     │                                          │ "anticipoCobrado":true,"etapas":[...],                       │
│                     │                                          │ "fechaCreacion":"2024-01-15T10:30:00.000Z",                  │
│                     │                                          │ "historialCambios":["Inicio de proyecto"]}]                  │
└─────────────────────┴──────────────────────────────────────────┴──────────────────────────────────────────────────────────────┘

### Cómo ver las claves

1. Abre el sitio en tu navegador.
2. Presiona F12 (o clic derecho → Inspeccionar).
3. Ve a la pestaña Application (Aplicación).
4. En el panel izquierdo, expande Local Storage y selecciona el dominio.
5. Verás la clave bianchi-proyectos con su valor actual.

### Cómo vaciar / reiniciar las claves

Abre la pestaña Console (dentro de las herramientas de desarrollador) y ejecuta:

┌─────────────────────────────────────────────────────────────────┐
│ // Vaciar todos los proyectos                                   │
│ localStorage.removeItem('bianchi-proyectos')                    │
│                                                                 │
│ // Recargar la página                                           │
│ location.reload()                                               │
└─────────────────────────────────────────────────────────────────┘

## Reglas de Negocio

### Cálculo de honorario por etapa

┌─────────────────────────────────────────────────────────────────┐
│ honorario_etapa = máx(                                          │
│   presupuesto_obra × porcentaje_etapa,                          │
│   superficie × mínimo_por_m²_total × peso_etapa                 │
│ )                                                               │
│                                                                 │
│ peso_etapa = porcentaje_etapa / suma_de_porcentajes             │
│ mínimo_por_m²_total = $12.000 ARS                               │
└─────────────────────────────────────────────────────────────────┘

### Plan de pagos

- Anticipo = honorario_total × (porcentaje_anticipo / 100). Por defecto 30%.
- Anticipo asociado a cada etapa = honorario_etapa × (anticipo / honorario_total).
- Pago pendiente por etapa = honorario_etapa − anticipo_asociado.
- Saldo del proyecto = anticipo_pendiente + suma(pagos_pendientes de etapas no cobradas).

### Catálogo de porcentajes por defecto

┌──────────────────┬──────────────┬────────────────────┬───────────────────┐
│ Tipo de espacio  │ Anteproyecto │ Proyecto Ejecutivo │ Dirección de Obra │
├──────────────────┼──────────────┼────────────────────┼───────────────────
│ Vivienda         │ 2%           │ 4%                 │ 4%                │
│ Gastronómico     │ 2,5%         │ 5%                 │ 4,5%              │
│ Hospedaje        │ 2,5%         │ 5%                 │ 5%                │
└──────────────────┴──────────────┴────────────────────┴───────────────────┘

### Entregables por etapa

- Anteproyecto: planta de distribución, moodboard, dos vistas 3D. Plazo: 3 semanas.
- Proyecto Ejecutivo: planos de detalle, planillas de terminaciones, mobiliario a medida. Plazo: 6 semanas.
- Dirección de Obra: visitas semanales, acta semanal. Plazo: según obra.

## Estructura del Proyecto

┌─────────────────────────────────────────────────────────────────┐
│ 261014_HonorariosInteriorismo/                                  │
│ ├── README.md                                                   │
│ ├── .gitignore                                                  │
│ ├── package.json                                                │
│ ├── vite.config.ts                                              │
│ ├── tailwind.config.js                                          │
│ ├── postcss.config.js                                           │
│ ├── index.html                                                  │
│ └── src/                                                        │
│     ├── main.tsx              # Punto de entrada                │
│     ├── App.tsx               # Router principal                │
│     ├── index.css             # Tailwind + estilos Bianchi      │
│     ├── constants.ts          # Catálogo de porcentajes         │
│     ├── components/                                             │
│     │   ├── layout/                                             │
│     │   │   └── Header.tsx    # Cabecera con branding           │
│     │   ├── ui/                                                 │
│     │   │   └── Button.tsx    # Botón reutilizable              │
│     │   └── ModalCambioAlcance.tsx  # Modal cambio alcance      │
│     ├── pages/                                                  │
│     │   ├── Dashboard.tsx     # Listado de proyectos            │
│     │   ├── NuevoProyecto.tsx # Formulario creación/edición     │
│     │   └── DetalleProyecto.tsx # Gestión etapas y cobros       │
│     ├── types/                                                  │
│     │   └── index.ts          # Tipos TypeScript                │
│     ├── utils/                                                  │
│     │   └── calculations.ts   # Motor de cálculos               │
│     ├── hooks/                                                  │
│     │   └── useLocalStorage.ts  # Hook de persistencia          │
│     └── data/                                                   │
│         └── seed.ts           # Datos de ejemplo (vacío)        │
─────────────────────────────────────────────────────────────────┘

## Notas para el Desarrollador de Backend

Esta aplicación fue construida sin backend. Toda la lógica de negocio y la persistencia corren en el cliente mediante localStorage.

### Qué está simulado

┌──────────────────────────────────┬──────────┬──────────────────────────────────────┐
│ Función                          │ Estado   │ Implementación                       │
├──────────────────────────────────┼──────────┼──────────────────────────────────────┤
│ Persistencia de proyectos        │ ✅ Local │ src/hooks/useLocalStorage.ts         │
│ Cálculo de honorarios            │ ✅ Local │ src/utils/calculations.ts            │
│ Cambio de alcance                │ ✅ Local │ aplicarCambioAlcance()               │
│ Envío de propuesta por email     │ ❌       │ Preparado para integrar              │
│ Envío de recordatorio de cobro   │ ❌       │ Preparado para integrar              │
│ Integración con facturación      │ ❌       │ Preparado para integrar              │
│ Autenticación de usuarios        │ ❌       │ Un solo usuario local                │
└──────────────────────────────────┴────────────────────────────────────────────────┘

### Endpoints sugeridos para futuro backend

┌─────────────────────────────────────────────────────────────────┐
│ GET    /api/proyectos                                           │
│ POST   /api/proyectos                                           │
│ GET    /api/proyectos/:id                                       │
│ PUT    /api/proyectos/:id                                       │
│ DELETE /api/proyectos/:id                                       │
│ POST   /api/proyectos/:id/cambio-alcance                        │
│ POST   /api/proyectos/:id/entregar/:etapaId                     │
│ POST   /api/proyectos/:id/cobrar/:etapaId                       │
└─────────────────────────────────────────────────────────────────┘

### Variables de entorno (para futuro backend)

┌─────────────────────────────────────────────────────────────────┐
│ VITE_API_BASE_URL=http://localhost:3000/api                     │
│ VITE_WHATSAPP_API_KEY=                                          │
│ VITE_EMAIL_API_KEY=                                             │
└─────────────────────────────────────────────────────────────────┘

## Licencia

Uso interno — Estudio Bianchi.
EOF
