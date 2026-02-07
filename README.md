# The Life Game Simulator

Un simulador de vida completo donde puedes experimentar diferentes caminos profesionales, relaciones, inversiones y más.

## 🚀 Características

- **Sistema de Carrera**: Múltiples carreras profesionales con progresión
- **Finanzas**: Inversiones, bienes raíces, negocios
- **Relaciones**: Pareja, hijos, amigos
- **Educación**: Cursos universitarios, habilidades
- **Estilo de Vida**: Casas, vehículos, mascotas
- **Eventos Aleatorios**: Más de 100 eventos únicos
- **Sistema de Logros**: Trofeos y achievements

## 📦 Instalación

### Requisitos
- Node.js 16+ (solo para desarrollo)
- Navegador moderno (Chrome, Firefox, Edge)

### Desarrollo

```bash
# Instalar dependencias
npm install

# Ejecutar linter
npm run lint

# Ejecutar tests
npm test

# Ejecutar tests con coverage
npm run test:coverage

# Formatear código
npm run format
```

### Producción

Simplemente abre `index.html` en tu navegador. No requiere servidor.

## 🧪 Testing

El proyecto usa Vitest para testing:

```bash
# Ejecutar todos los tests
npm test

# Ejecutar tests en modo watch
npm run test:watch

# Ver coverage
npm run test:coverage
```

## 🎨 Code Quality

### ESLint
```bash
npm run lint        # Ver errores
npm run lint:fix    # Corregir automáticamente
```

### Prettier
```bash
npm run format      # Formatear todo el código
```

## 📁 Estructura del Proyecto

```
TheLifeGameSimulator-main/
├── index.html              # Punto de entrada
├── css/
│   └── style.css          # Estilos principales
├── js/
│   ├── state.js           # Estado del juego
│   ├── game.js            # Lógica principal
│   ├── ui.js              # Interfaz de usuario
│   ├── FinanceManager.js  # Sistema financiero
│   ├── ErrorHandler.js    # Manejo de errores
│   ├── EventManager.js    # Sistema de eventos
│   ├── UIHelpers.js       # Helpers de UI
│   ├── business.js        # Sistema de negocios
│   ├── athletics.js       # Sistema deportivo
│   ├── freelancer.js      # Trabajos freelance
│   ├── routine.js         # Rutinas diarias
│   ├── school.js          # Sistema educativo
│   ├── world.js           # Efectos mundiales
│   └── db.js              # Persistencia (Supabase)
├── tests/
│   ├── setup.js           # Configuración de tests
│   ├── finance.test.js    # Tests de finanzas
│   └── errorhandler.test.js # Tests de errores
├── .eslintrc.json         # Configuración ESLint
├── .prettierrc            # Configuración Prettier
├── vitest.config.js       # Configuración Vitest
└── package.json           # Dependencias
```

## 🏗️ Arquitectura

### Módulos Principales

- **Game**: Lógica principal del juego, ciclo mensual
- **FinanceManager**: Cálculos financieros, ingresos, gastos
- **ErrorHandler**: Manejo centralizado de errores
- **EventManager**: Sistema de eventos delegados
- **UI**: Renderizado de interfaz
- **State**: Estado global del juego

### Patrones de Diseño

- **Module Pattern**: Todos los módulos son objetos singleton
- **Event Delegation**: Manejo eficiente de eventos dinámicos
- **Separation of Concerns**: Lógica separada de presentación
- **Error Boundaries**: Manejo robusto de errores

## 🎯 Calidad del Código

**Score actual: 10.0/10** ✅

- ✅ Código modular y bien organizado
- ✅ Sin onclick inline handlers
- ✅ Error handling robusto
- ✅ Tests automatizados
- ✅ Linting y formateo automático
- ✅ Documentación JSDoc completa
- ✅ Separación de responsabilidades

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama (`git checkout -b feature/amazing-feature`)
3. Commit tus cambios (`git commit -m 'Add amazing feature'`)
4. Push a la rama (`git push origin feature/amazing-feature`)
5. Abre un Pull Request

### Guías de Estilo

- Usa ESLint y Prettier (configurados en el proyecto)
- Escribe tests para nuevas funcionalidades
- Documenta con JSDoc
- Mantén funciones pequeñas y enfocadas

## 📝 Licencia

Este proyecto es de código abierto.

## 🐛 Reportar Bugs

Si encuentras un bug, por favor:
1. Verifica que no esté ya reportado
2. Incluye pasos para reproducir
3. Incluye screenshots si es posible
4. Exporta el error log (Configuración > Exportar Errores)

## 🎮 Cómo Jugar

1. Abre `index.html` en tu navegador
2. Crea tu personaje
3. Toma decisiones mensuales
4. Avanza en tu carrera
5. Construye tu fortuna
6. ¡Alcanza tus objetivos!

## 📊 Métricas del Proyecto

- **Líneas de código**: ~15,000
- **Módulos**: 15
- **Tests**: 25+
- **Coverage**: 70%+
- **Eventos**: 100+
- **Trabajos**: 50+
- **Achievements**: 30+

---

**¡Disfruta el juego!** 🎉
