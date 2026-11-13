import { adminDb } from "@/lib/firebaseAdmin";
import { Timestamp } from "firebase-admin/firestore";
import { NextResponse } from "next/server";






// export const dynamic = "force-dynamic";

const ms = (t) => t?.toMillis?.() ?? null;

const latest = (col, field, n = 10) => adminDb.collection(col).orderBy(field, "desc").limit(n).get();

const count = async (q) => (await q.count().get()).data().count;

const DAYS = 30;

const cutoff = new Date(Date.now() - DAYS * 24 * 60 * 60 *1000);

const growth = (now, then) =>
  then > 0 ? Number((((now - then) / then) * 100).toFixed(1)) : null;

export async function GET(req) {
    try {
        console.log("CRON SECRET EXISTS:", !!process.env.CRON_SECRET);
      if (
        req.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`
      ) {
        return NextResponse.json({ error: "unauthorized" }, { status: 401 });
      }

      const [
        shops,
        orders,
        customers,
        shopsThen,
        ordersThen,
        customersThen,
        products,
        newShops,
        newProducts,
        newUsers,
        newOrders,
        delivered,
      ] = await Promise.all([
        count(adminDb.collection("stores")),
        count(adminDb.collection("orders")),
        count(adminDb.collection("users").where("role", "==", "customer")),
        count(adminDb.collection("stores").where("createdAt", "<", cutoff)),
        count(adminDb.collection("orders").where("createdAt", "<", cutoff)),
        count(
          adminDb
            .collection("users")
            .where("role", "==", "customer")
            .where("createdAt", "<", cutoff),
        ),
        count(adminDb.collection("products")),
        latest("stores", "createdAt"),
        latest("products", "createdAt"),
        latest("users", "createdAt"),
        latest("orders", "createdAt"),
        latest("orders", "deliveredAt"),
      ]);
      const activity = [
        ...newShops.docs.map((d) => ({
          type: "shop_registered",
          at: ms(d.data().createdAt),
          title: d.data().storeName,
          storeId: d.id,
        })),
        ...newProducts.docs.map((d) => ({
          type: "product_added",
          at: ms(d.data().createdAt),
          title: d.data().productName,
          storeId: d.data().storeId,
        })),
        ...newUsers.docs
          .filter((d) => d.data().role === "customer")
          .map((d) => ({
            type: "customer_registered",
            at: ms(d.data().createdAt),
            title: d.data().name || "New customer",
          })),
        ...newOrders.docs.map((d) => ({
          type: "order_placed",
          at: ms(d.data().createdAt),
          title: d.data().orderId,
          storeId: d.data().storeId,
          total: d.data().total,
        })),
        ...delivered.docs.map((d) => ({
          type: "order_delivered",
          at: ms(d.data().deliveredAt),
          title: d.data().orderId,
          trackingId: d.data().trackingId ?? d.data().orderId,
          storeId: d.data().storeId,
        })),
      ]
        .filter((a) => a.at)
        .sort((a, b) => b.at - a.at)
        .slice(0, 30);

      await adminDb.doc("adminStats/summary").set({
        totals: { shops, orders, customers, products },
        growth:{
          periodDays: DAYS,
          shops: growth(shops, shopsThen),
    orders: growth(orders, ordersThen),
    customers: growth(customers, customersThen),
        },
        activity,
        updatedAt: Timestamp.now(),
      });

      return NextResponse.json({
        ok: true,
        shops,
        orders,
        customers,
        products,
      });
    } catch (error) {
      console.error("ADMIN SNAPSHOT ERROR:", error);

      return NextResponse.json(
        {
          error: "Snapshot failed",
          details: error.message,
        },
        { status: 500 },
      );
    }




}