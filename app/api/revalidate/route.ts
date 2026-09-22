import { revalidateTag, revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get("secret");
  if (!secret || secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }
  const tag = req.nextUrl.searchParams.get("tag") || "products";
  const productId = req.nextUrl.searchParams.get("productId");

  revalidateTag(tag, "tag");

  // When a specific product is updated, revalidate its page path directly
  if (productId) {
    revalidatePath(`/product/${productId}`);
  }

  if (tag === "home-settings") {
    // لا نُبطل cache المنتجات هنا — إعدادات التصنيفات لا تغير بيانات المنتجات
    revalidatePath("/");
  }
  if (tag === "company") {
    revalidatePath("/");
  }
  if (tag === "category-banners") {
    revalidatePath("/");
  }
  if (tag === "banners") {
    revalidatePath("/");
  }
  return NextResponse.json({ revalidated: true, tag });
}
