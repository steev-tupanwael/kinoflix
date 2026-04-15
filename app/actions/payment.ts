"use server";

export async function createTransaction(userId: string, plan: "monthly" | "yearly") {
  const price = plan === "monthly" ? 50000 : 500000; // Contoh harga

  const authString = Buffer.from(`${process.env.MIDTRANS_SERVER_KEY}:`).toString("base64");

  const payload = {
    transaction_details: {
      order_id: `order-${userId}-${Date.now()}`,
      gross_amount: price,
    },
    customer_details: {
      notes: userId, // Kita simpan userId di sini untuk referensi
    },
    item_details: [{
      id: plan,
      price: price,
      quantity: 1,
      name: `Kinoflix Pro - ${plan}`,
    }]
  };

  const response = await fetch(`${process.env.MIDTRANS_BASE_URL}/snap/v1/transactions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Basic ${authString}`,
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();
  return data.token; // Ini adalah Snap Token
}
