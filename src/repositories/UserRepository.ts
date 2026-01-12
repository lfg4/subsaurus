import { prisma } from '@/src/lib/prisma';

export class UserRepository {
  async getAllUsers() {
    return await prisma.user.findMany();
  }

  async getUserById(id: number) {
    return await prisma.user.findUnique({
      where: { id },
    });
  }

  async createUser(email: string, name?: string) {
    return await prisma.user.create({
      data: {
        email,
        name,
      },
    });
  }

  async deleteUser(id: number) {
    return await prisma.user.delete({
      where: { id },
    });
  }
}

