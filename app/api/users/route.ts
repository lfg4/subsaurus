import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/src/lib/prisma';
import { handleApiError, createValidationError } from '@/app/lib/api-error-handler';

export async function GET() {
  try {
    const users = await prisma.user.findMany();
    return NextResponse.json(users);
  } catch (error) {
    return handleApiError(error, 'fetch users', 'Failed to fetch users');
  }
}

export async function POST(request: NextRequest) {
  try {
    const { email, name } = await request.json();

    if (!email) {
      return createValidationError('Email is required');
    }

    const user = await prisma.user.create({
      data: { email, name }
    });
    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    return handleApiError(error, 'create user', 'Failed to create user');
  }
}
