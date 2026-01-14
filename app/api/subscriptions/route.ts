import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

// Crear instancia única en desarrollo
const prismaClientSingleton = () => {
  return new PrismaClient();
};

declare global {
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>;
}

const prisma = globalThis.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== 'production') globalThis.prisma = prisma;

// GET - Obtener todas las suscripciones
export async function GET() {
  try {
    const subscriptions = await prisma.subscription.findMany({
      include: {
        _count: {
          select: { subscriptionUsers: true }
        }
      }
    });

    const formatted = subscriptions.map(sub => ({
      id: Number(sub.id),
      name: sub.name,
      project: sub.project || 'Sin proyecto',
      renewal_cycle: sub.renewalCycle,
      renewal_date: sub.renewalDate.toISOString().split('T')[0],
      cost_amount: Number(sub.costAmount),
      cost_currency: sub.costCurrency,
      users_count: sub._count.subscriptionUsers
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    console.error('Error al obtener suscripciones:', error);
    return NextResponse.json(
      { error: 'Error al cargar las suscripciones' },
      { status: 500 }
    );
  }
}

// POST - Crear una nueva suscripción
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const newSubscription = await prisma.subscription.create({
      data: {
        slackWorkspaceId: 'T123456', // TODO: Obtener del usuario autenticado
        createdBySlackUser: 'U123456', // TODO: Obtener del usuario autenticado
        name: body.name,
        project: body.project,
        renewalCycle: body.renewal_cycle,
        renewalDate: new Date(body.renewal_date),
        costAmount: body.cost_amount,
        costCurrency: body.cost_currency || 'EUR',
      }
    });

    return NextResponse.json({ 
      success: true, 
      id: Number(newSubscription.id) 
    }, { status: 201 });
  } catch (error) {
    console.error('Error al crear suscripción:', error);
    return NextResponse.json(
      { error: 'Error al crear la suscripción' },
      { status: 500 }
    );
  }
}