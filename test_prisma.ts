import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    const customer = await prisma.customer.create({
      data: {
        name: "AKILESH",
        type: "Dealer",
        gst_number: "",
        industry_type: "Power",
        user_id: "test_uid",
        branches: {
          create: [
            { name: "Head Office", location: "", manager: "" }
          ]
        },
        contacts: {
          create: [
            { name: "AKILESH", email: "akilesh.b46@gmail.com", phone1: "", phone2: "" }
          ]
        },
        addresses: {
          create: [
            { address_type: "billing", line1: "", line2: "", state: "", country: "India", pincode: "" },
            { address_type: "shipping", line1: "", line2: "", state: "", country: "India", pincode: "" }
          ]
        }
      }
    });
    console.log("Success", customer);
  } catch (err) {
    console.error("Prisma Error:", err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
