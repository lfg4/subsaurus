This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Base de Datos

Este proyecto usa **PostgreSQL** con **Prisma** ORM.

### Desarrollo Local

```bash
# Genera el cliente de Prisma
npm install

# Sincroniza el schema con la base de datos
npx prisma db push

# Abre Prisma Studio (GUI para ver datos)
npx prisma studio
```

### Deploy en Vercel con Supabase

**Paso 1: Configurar la base de datos en Supabase**
1. Ve a [supabase.com](https://supabase.com) y crea un proyecto
2. En Settings → Database, copia la "Connection string" (modo **Transaction**)
3. Reemplaza `[YOUR-PASSWORD]` con tu contraseña
4. **Importante**: Codifica caracteres especiales en la URL:
   - `!` → `%21`
   - `/` → `%2F`
   - `%` → `%25`
   - `,` → `%2C`

**Paso 2: Configurar variable de entorno en Vercel**
1. Ve a tu proyecto en Vercel → Settings → Environment Variables
2. Añade `DATABASE_URL` con tu connection string de Supabase
3. Marca: Production, Preview y Development
4. Guarda

**Paso 3: Crear las tablas en Supabase**
```bash
# Usa la URL de producción temporalmente
DATABASE_URL="tu-url-de-supabase" npx prisma db push
```

**Paso 4: Despliega**
```bash
git push
```

Vercel automáticamente detectará el cambio y desplegará. El script `postinstall` generará automáticamente el cliente de Prisma.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
