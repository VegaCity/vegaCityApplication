// import { prisma } from '@/lib/prisma'; // Giả sử bạn đang sử dụng Prisma ORM

// export async function updateOrderStatus(orderId: string, status: 'success' | 'failure') {
//   try {
//     await prisma.order.update({
//       where: { id: orderId },
//       data: { status: status === 'success' ? 'PAID' : 'FAILED' },
//     });
//     console.log(`Order ${orderId} status updated to ${status}`);
//   } catch (error) {
//     console.error(`Failed to update order ${orderId} status:`, error);
//     throw error;
//   }
// }