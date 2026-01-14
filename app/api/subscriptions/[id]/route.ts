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

// GET - Obtener una suscripción por ID
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idStr } = await params;
    const id = parseInt(idStr);

    const subscription = await prisma.subscription.findUnique({
      where: { id }
    });

    if (!subscription) {
      return NextResponse.json(
        { error: 'Suscripción no encontrada' },
        { status: 404 }
      );
    }

    // Transformar los nombres de campos de Prisma a lo que espera el frontend
    return NextResponse.json({
      id: subscription.id,
      name: subscription.name,
      project: subscription.project,
      renewal_cycle: subscription.renewalCycle,
      renewal_date: subscription.renewalDate.toISOString().split('T')[0],
      cost_amount: subscription.costAmount,
      cost_currency: subscription.costCurrency,
      users_count: subscription.usersCount || 0,
      // last_check_summary lo dejamos null por ahora ya que no tienes usage checks
      last_check_summary: null
    });
  } catch (error) {
    console.error('Error al obtener suscripción:', error);
    return NextResponse.json(
      { error: 'Error al obtener la suscripción' },
      { status: 500 }
    );
  }
}

// DELETE - Borrar una suscripción
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idStr } = await params;
    const id = parseInt(idStr);

    await prisma.subscription.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error al borrar suscripción:', error);
    return NextResponse.json(
      { error: 'Error al borrar la suscripción' },
      { status: 500 }
    );
  }
}

// PATCH - Actualizar una suscripción
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idStr } = await params;
    const id = parseInt(idStr);
    const body = await request.json();

    await prisma.subscription.update({
      where: { id },
      data: {
        name: body.name,
        project: body.project,
        renewalCycle: body.renewal_cycle,
        renewalDate: new Date(body.renewal_date),
        costAmount: body.cost_amount,
        costCurrency: body.cost_currency,
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error al actualizar suscripción:', error);
    return NextResponse.json(
      { error: 'Error al actualizar la suscripción' },
      { status: 500 }
    );
  }
}