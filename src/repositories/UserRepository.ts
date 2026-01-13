import { prisma } from '@/src/lib/prisma';

export class UserRepository {
  async getAllUsers() {
    return await prisma.user.findMany();
  }

  async createUser(email: string, name?: string) {
    return await prisma.user.create({
      data: {
        email,
        name,
      },
    });
  }
}

