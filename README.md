# Backend – Sistema de Reservas Express (NestJS)

Este repositorio contiene el backend del **Sistema de Reservas Express**, desarrollado con **NestJS** y una arquitectura modular orientada a dominio.

El sistema permite:
- Consultar disponibilidad de espacios por fecha
- Crear reservas evitando overbooking
- Simular un proceso de checkout (pago)
- Generar y descargar tickets digitales en PDF
- Enviar correos electrónicos con comprobantes

El objetivo principal del proyecto es demostrar una arquitectura backend clara, transaccional y fácil de escalar.

## 🔄 Flujo de Negocio (Resumen)

El sistema sigue un flujo de negocio claro y controlado para garantizar la correcta gestión de disponibilidad y evitar overbooking.

---

### 1️⃣ Consulta de Disponibilidad

- El cliente envía un rango de fechas.
- El sistema:
  - Obtiene todas las categorías.
  - Calcula las reservas que se solapan en ese rango.
  - Determina cuántos espacios están ocupados y disponibles.

No se modifica ningún dato en esta operación.

---

### 2️⃣ Creación de Reservas

- El cliente solicita una reserva indicando:
  - categoría
  - fechas
  - cantidad de espacios

El sistema:
- Valida las fechas y la categoría.
- Recalcula la disponibilidad en tiempo real.
- Ejecuta la operación dentro de una **transacción**.
- Persiste la reserva solo si hay disponibilidad suficiente.

---

### 3️⃣ Prevención de Overbooking

Para evitar overbooking:
- No se utilizan contadores persistidos.
- La disponibilidad se calcula dinámicamente.
- Las reservas se validan y crean dentro de una transacción.

Esto asegura consistencia incluso ante múltiples solicitudes concurrentes.

---

### 4️⃣ Checkout Simulado

- Se valida que la reserva exista.
- Se calcula el total desde la base de datos.
- Se valida la tarjeta con el algoritmo de Luhn.
- No se almacenan datos sensibles.
- El pago se simula como exitoso.

---

Este flujo garantiza un proceso seguro, predecible y fácil de mantener.


##  Estructura del Proyecto

El proyecto sigue una estructura **modular y organizada**, alineada con las buenas prácticas de NestJS.  
Cada carpeta tiene una responsabilidad clara, lo que facilita el mantenimiento, la escalabilidad y la comprensión por parte de otros desarrolladores.

A continuación se describe la estructura principal del backend:

## 📁 Estructura del Proyecto

```txt
reservas-express-backend/
├── prisma/
│   ├── schema.prisma      # Definición del modelo de datos
│   └── seed.ts            # Seed inicial de categorías
│
├── src/
│   ├── common/            # Código compartido y reutilizable
│   │   ├── dto/           # Data Transfer Objects
│   │   │   ├── checkout/
│   │   │   │   └── checkout.dto.ts
│   │   │   └── reservations/
│   │   │       └── create-reservation.dto.ts
│   │   ├── types/         # Tipos y contratos compartidos
│   │   │   └── availability.types.ts
│   │   ├── utils/         # Utilidades generales
│   │   ├── mail/          # Lógica de envío de correos
│   │   └── pdf/           # Generación de tickets PDF
│   │
│   ├── config/            # Configuración de la aplicación
│   │   ├── prisma/        # Configuración de Prisma
│   │   └── env.config.ts  # Variables de entorno
│   │
│   ├── modules/           # Módulos de dominio
│   │   ├── availability/
│   │   ├── reservations/
│   │   └── checkout/
│   │
│   ├── root/
│   │   └── root.controller.ts
│   │
│   ├── app.module.ts
│   └── main.ts
│
├── test/
├── .env
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```


---

### 📌 Detalles Clave de la Estructura

- **`modules/`**  
  Contiene los módulos principales del negocio.  
  Cada módulo encapsula su controlador, servicio y lógica específica.

- **`common/`**  
  Código reutilizable entre módulos:
  - DTOs para validación de requests
  - Tipos compartidos
  - Utilidades
  - Servicios de PDF y correo

- **`prisma/`**  
  Centraliza el modelo de datos, migraciones y seed inicial.

- **`config/`**  
  Maneja la configuración del entorno y Prisma, evitando valores hardcodeados.

- **Separación clara entre dominio y utilidades**  
  La lógica de negocio no depende de detalles de infraestructura como correo o PDF.

Esta estructura permite:
- Escalar el sistema fácilmente
- Agregar nuevos módulos sin afectar los existentes
- Facilitar el onboarding de nuevos desarrolladores



## Requisitos del Entorno Local

Para ejecutar el backend del **Sistema de Reservas Express** en un entorno local, es necesario contar con las siguientes herramientas y dependencias previamente instaladas.

Este proyecto fue desarrollado y probado utilizando **PostgreSQL como base de datos local**.

---

### Requisitos de Software

- **Node.js**  
  Versión recomendada: **18.x o superior**

- **npm**  
  Incluido con Node.js

- **PostgreSQL**  
  - Base de datos relacional
  - Instalación local
  - Una base de datos creada para el proyecto

- **Git**  
  Para clonar el repositorio y manejar versiones

  #### Ramas
  `develop` para el ambiente de desarrollo y `main` para producción.

---

### Base de Datos

- **Motor:** PostgreSQL
- **Modo:** Local
- **Gestión:** Libre (psql, pgAdmin, DBeaver, etc.)

El backend se conecta a una base de datos PostgreSQL local mediante variables de entorno.  

---

## ⚙️ Configuración del Entorno Local

El proyecto utiliza variables de entorno para manejar la configuración sensible y dependiente del entorno (base de datos, correo, etc.).

Estas variables se definen en un archivo `.env`, el cual **no debe subirse al repositorio**.

---

### 📄 Archivo `.env.example`

A continuación se muestra un ejemplo del archivo de variables de entorno requerido para ejecutar el proyecto en local:

```env
# ==========================
# Base de datos (PostgreSQL)
# ==========================
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/reservas_express_db"

# ==========================
# PUERTO
# ==========================
PORT=3000

# ==========================
# Configuración para envío de correos
# ==========================

SENDGRID_API_KEY=tu-api-key-sendgrid
MAIL_FROM=example@tu.dominio.com
```
## 🚀 Inicialización del Proyecto

Una vez configurado el entorno local y definidas las variables de entorno, se pueden ejecutar los pasos necesarios para levantar el backend correctamente.

---

### Instalación de Dependencias

Desde la raíz del proyecto, ejecutar:

```bash
npm install
```

### Creación de la Base de Datos

Antes de ejecutar las migraciones, es necesario contar con una base de datos creada en PostgreSQL.

Ejemplo usando psql:
```bash
CREATE DATABASE reservas_express_db;
```

### Migraciones de Prisma

Las migraciones crean la estructura de tablas basada en el archivo schema.prisma.

Ejecutar:
```bash
npx prisma migrate dev
```



### Seed Inicial

El proyecto incluye un seed para cargar las categorías base del sistema.

Ejecutar:
```bash
npx prisma db seed
```

### Levantar el Servidor

Para iniciar el backend en modo desarrollo:
```bash
npm run start:dev
```

El servidor quedará disponible en: [http://localhost:3000](http://localhost:3000)

### Verificación de Funcionamiento

Para validar que la aplicación está corriendo correctamente, se puede acceder al url:
[http://localhost:3000](http://localhost:3000)

### Mensaje de confirmación
```json
{
  "status":"ok",
  "message":"API is running!",
  "timestamp":"2026-01-11T09:12:50.542Z"
}
```



## 🧩 Modelo de Datos

El sistema utiliza un modelo de datos **simple, transaccional y consistente**, diseñado para garantizar un cálculo correcto de la disponibilidad y evitar escenarios de **overbooking**.

El enfoque prioriza:
- Integridad de los datos
- Claridad del modelo
- Facilidad de mantenimiento

---

### Entidades Principales

---

#### Category 

Representa las categorías de espacios disponibles en el sistema.

Cada categoría define:
- Su inventario total
- El precio base por unidad
- Un identificador único

**Campos principales:**
- `id`
- `name` (único)
- `capacity`
- `price`

Ejemplos de categorías:
- BASIC
- PLUS
- VIP

---

#### Reservation

Representa una reserva realizada por un usuario invitado (**guest**).

La reserva almacena la información necesaria para:
- Calcular disponibilidad
- Generar comprobantes
- Simular el proceso de pago

**Campos principales:**
- `id`
- `email`
- `startDate`
- `endDate`
- `quantity`
- `total`
- `categoryId`

---

### Relaciones entre Entidades

- Una **Category** puede tener **muchas Reservation**
- Una **Reservation** pertenece a **una sola Category**

Esta relación permite agrupar y calcular reservas por categoría de forma eficiente.

---

### Regla de Solapamiento de Fechas

Una reserva afecta la disponibilidad de una categoría si cumple la siguiente condición:

```text
existing.startDate < requestedEndDate
AND
existing.endDate > requestedStartDate
```
- Esta regla permite:
- Detectar solapamientos reales
- Evitar falsos positivos
- Calcular ocupación correctamente
### Control de Overbooking
El sistema no mantiene contadores de disponibilidad persistidos.

En su lugar:

- Calcula la ocupación en tiempo real
- Suma las reservas que se solapan
- Compara contra la capacidad total
- Ejecuta todo dentro de una transacción

Esto garantiza consistencia incluso con múltiples solicitudes concurrentes.

### Diagrama Entidad–Relación
El siguiente diagrama muestra la relación entre las entidades principales:

[Ver Diagrama Entidad–Relación](https://drive.google.com/file/d/1fLgKBjLftIRGD9xL78BDEIx-3ZswxPCP/view)


## 📡 Endpoints de la API

El backend expone una API REST que permite interactuar con el sistema de reservas.  
Los endpoints están organizados de acuerdo al flujo natural del negocio.

---

## Disponibilidad de Espacios

Consulta la disponibilidad de espacios por categoría para un rango de fechas determinado.  
Es un endpoint de **solo lectura** y constituye la base del flujo de reservas.

### Endpoint `GET /availability`

---

### Query Parameters

| Parámetro | Tipo | Obligatorio | Descripción |
|--------|------|------------|------------|
| `startDate` | string | Sí | Fecha de inicio (`YYYY-MM-DD`) |
| `endDate` | string | Sí | Fecha de fin (`YYYY-MM-DD`) |

---

### Validaciones

- Ambos parámetros son obligatorios
- Las fechas deben ser válidas
- `startDate` debe ser menor que `endDate`

Si alguna validación falla, el endpoint responde con **400 Bad Request**.

---

### Regla de Solapamiento

Una reserva afecta la disponibilidad si:

```text
existing.startDate < requestedEndDate
AND
existing.endDate > requestedStartDate
```
#### Ejemplo de Respuesta
```json
[
  {
    "category": "BASIC",
    "capacity": 20,
    "reserved": 0,
    "available": 20,
    "price": 100
  },
  {
    "category": "PLUS",
    "capacity": 50,
    "reserved": 0,
    "available": 50,
    "price": 150
  },
  {
    "category": "VIP",
    "capacity": 8,
    "reserved": 0,
    "available": 8,
    "price": 300
  }
]

```


## Creación de Reservas

Permite crear una reserva siempre que exista disponibilidad real para el rango de fechas solicitado.

### Endpoint `POST /reservations`

Body Requerido
```json
{
  "email": "user@email.com",
  "category": "BASIC",
  "startDate": "2026-01-15",
  "endDate": "2026-01-17",
  "quantity": 2
}
```
Validaciones

quantity > 0

startDate < endDate

Categoría válida

Disponibilidad suficiente

Control de Overbooking

La creación de la reserva se ejecuta dentro de una transacción, recalculando la disponibilidad antes de persistir los datos.

#### Respuesta Exitosa
```json
{
  "success": true,
  "message": "Reserva creada exitosamente",
  "data": {}
}
```

#### Respuesta de Error


```json
{
  "success": false,
  "message": "No hay disponibilidad suficiente"
}
```


## Checkout Simulado

Simula el proceso de pago de una reserva existente.

### Endpoint `POST /checkout`

Body Requerido

```json
{
  "reservationId": "UUID_REAL",
  "cardNumber": "4242424242424242",
  "cardHolder": "John Doe",
  "expiration": "12/26",
  "cvv": "123"
}
```

Funcionalidad

- Valida que la reserva exista
- Calcula el total desde la base de datos
- Valida la tarjeta con el algoritmo de Luhn
- No almacena información sensible
- Simula un pago exitoso

Respuesta – Tarjeta Válida
```json
{
  "success": true,
  "message": "Payment processed successfully",
  "data": {
    "reservationId": "uuid",
    "totalPaid": 200,
    "paidAt": "2026-01-10T22:30:00.000Z"
  }
}
```

Respuesta – Tarjeta Inválida
```json
{
  "success": false,
  "message": "Invalid card number"
}
```

## Descarga de Ticket Digital (PDF)

Genera y descarga el ticket digital de una reserva en formato PDF.

### Endpoint `GET /reservations/:id/ticket`

- Parámetros de Ruta
- Parámetro	Tipo	Descripción
- id	string	ID único de la reserva

Respuesta Exitosa
```
Código: 200 OK

Content-Type: application/pdf

Content-Disposition: attachment

El navegador descargará automáticamente el archivo PDF.

Ejemplo de Uso
curl http://localhost:3000/reservations/{reservationId}/ticket \
  --output reservation-ticket.pdf

```
---
## 📚 Documentación de la API (Swagger)

El proyecto incluye documentación interactiva de la API utilizando **Swagger**, lo que permite explorar, probar y entender los endpoints disponibles sin necesidad de herramientas externas.

Swagger se configura directamente al iniciar la aplicación y se genera automáticamente a partir de los controladores y DTOs del proyecto.

---

### ¿Para qué sirve Swagger en este proyecto?

- Visualizar todos los endpoints disponibles
- Conocer los parámetros requeridos y opcionales
- Ver ejemplos de requests y responses
- Probar la API directamente desde el navegador
- Facilitar el entendimiento del backend a otros desarrolladores

---

### Acceso a la documentación

Una vez levantado el servidor en entorno local, la documentación estará disponible en:

```text
http://localhost:3000/api/docs


---
##  Servicios Auxiliares (Resumen)

Además de la lógica principal del negocio, el sistema utiliza servicios auxiliares para cubrir funcionalidades complementarias necesarias para la operación del sistema.

Estos servicios están desacoplados de la lógica de dominio y permiten mantener el código organizado y fácil de mantener.

---

### 🧾 Generación de Tickets en PDF

Se utiliza un servicio para generar **tickets digitales en formato PDF** como comprobante de una reserva.

Este servicio:
- Genera el PDF **en memoria**
- No guarda archivos en el servidor
- Construye el documento a partir de los datos de la reserva
- Permite regenerar el ticket en cualquier momento

La base de datos es la única fuente de verdad del sistema.

---

### 📧 Envío de Correos Electrónicos (Sendrigd)

El sistema cuenta con un servicio de envío de correos electrónicos para notificar al usuario una vez que su reserva ha sido confirmada y el pago simulado ha sido procesado correctamente.

Funcionamiento técnico

- El envío de correos se realiza mediante una API externa de correo transaccional
- El backend consume esta API utilizando peticiones HTTP seguras.
- La lógica de envío está desacoplada del flujo principal del negocio.
- Un fallo en el envío del correo no afecta la creación ni la validez de la reserva.

---

### 💳 Validación de Tarjetas (Checkout Simulado)

Durante el proceso de checkout se valida el número de tarjeta utilizando el **algoritmo de Luhn**.

Esta validación:
- Verifica la coherencia del número
- Detecta errores de escritura
- Simula un flujo de pago realista

No se almacenan datos sensibles ni se integran pasarelas de pago reales.

---

Estos servicios permiten complementar el flujo principal sin aumentar la complejidad del sistema.
