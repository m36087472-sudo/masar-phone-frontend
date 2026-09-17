/**
 * @jest-environment jsdom
 */
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";

// ── Mocks ──────────────────────────────────────────────────────────────────
const mockPush = jest.fn();
jest.mock("next/navigation", () => ({ useRouter: () => ({ push: mockPush }) }));

jest.mock("react-hot-toast", () => ({
  __esModule: true,
  default: { success: jest.fn(), error: jest.fn() },
}));

// Mock fetch: product-form-data returns categories/subCategories
global.fetch = jest.fn((url: string) => {
  if (url.includes("product-form-data")) {
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ categories: ["iPhone", "Samsung"], subCategories: ["هواتف", "أجهزة لوحية"] }),
    });
  }
  // POST /api/admin/products
  return Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ _id: "abc123" }),
  });
}) as jest.Mock;

import NewProductPage from "../app/admin/products/new/page";

// ── Helpers ────────────────────────────────────────────────────────────────
function renderPage() {
  return render(<NewProductPage />);
}

function fillRequired() {
  fireEvent.change(screen.getByPlaceholderText("مثال: iPhone 15 Pro Max"), { target: { value: "iPhone 16 Pro" } });
  fireEvent.change(screen.getByPlaceholderText("0"), { target: { value: "4999" } });
}

// ── Tests ──────────────────────────────────────────────────────────────────

describe("صفحة إضافة منتج جديد — الفيلدات", () => {

  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockImplementation((url: string) => {
      if (url.includes("product-form-data")) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve({ categories: ["iPhone", "Samsung"], subCategories: ["هواتف", "أجهزة لوحية"] }) });
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve({ _id: "abc123" }) });
    });
  });

  test("يعرض عنوان الصفحة", () => {
    renderPage();
    expect(screen.getByText("إضافة منتج جديد")).toBeInTheDocument();
  });

  // ── الفيلدات الأساسية ──
  test("يوجد حقل اسم المنتج (مطلوب)", () => {
    renderPage();
    expect(screen.getByPlaceholderText("مثال: iPhone 15 Pro Max")).toBeInTheDocument();
  });

  test("يوجد حقل الوصف المختصر (brief)", () => {
    renderPage();
    expect(screen.getByPlaceholderText("جملة قصيرة تظهر تحت الاسم")).toBeInTheDocument();
  });

  test("يوجد حقل السعر الأصلي (مطلوب)", () => {
    renderPage();
    expect(screen.getByPlaceholderText("0")).toBeInTheDocument();
  });

  test("يوجد حقل سعر البيع (اختياري)", () => {
    renderPage();
    expect(screen.getByPlaceholderText("اختياري")).toBeInTheDocument();
  });

  test("يوجد حقل الماركة (brand)", () => {
    renderPage();
    expect(screen.getByPlaceholderText("مثال: Apple")).toBeInTheDocument();
  });

  test("يوجد حقل الوصف التفصيلي", () => {
    renderPage();
    expect(screen.getByPlaceholderText("وصف المنتج...")).toBeInTheDocument();
  });

  // ── المواصفات الفيزيائية ──
  test("يوجد حقل اللون", () => {
    renderPage();
    expect(screen.getByPlaceholderText("مثال: أسود")).toBeInTheDocument();
  });

  test("يوجد حقل التخزين", () => {
    renderPage();
    expect(screen.getByPlaceholderText("مثال: 256GB")).toBeInTheDocument();
  });

  test("يوجد حقل الشبكة", () => {
    renderPage();
    expect(screen.getByPlaceholderText("مثال: 5G")).toBeInTheDocument();
  });

  test("يوجد حقل حجم الشاشة", () => {
    renderPage();
    expect(screen.getByPlaceholderText('مثال: 6.7"')).toBeInTheDocument();
  });

  // ── التوصيل والضمان ──
  test("يوجد حقل وقت التوصيل بقيمة افتراضية", () => {
    renderPage();
    const input = screen.getByPlaceholderText("24 ساعة") as HTMLInputElement;
    expect(input).toBeInTheDocument();
    expect(input.value).toBe("24 ساعة");
  });

  test("يوجد حقل سنوات الضمان بقيمة افتراضية 2", () => {
    renderPage();
    const input = screen.getByPlaceholderText("2") as HTMLInputElement;
    expect(input).toBeInTheDocument();
    expect(input.value).toBe("2");
  });

  // ── التقسيط ──
  test("حقول التقسيط مخفية افتراضياً", () => {
    renderPage();
    expect(screen.queryByPlaceholderText("12")).not.toBeInTheDocument();
  });

  test("حقول التقسيط تظهر عند تفعيله", () => {
    renderPage();
    const installmentSelect = screen.getAllByRole("combobox").find(
      (el) => (el as HTMLSelectElement).value === "false" &&
        el.closest("div")?.previousElementSibling?.textContent?.includes("التقسيط")
    );
    // نغير select التقسيط لـ "true"
    const selects = screen.getAllByRole("combobox") as HTMLSelectElement[];
    const installmentSel = selects.find((s) => s.value === "false" && Array.from(s.options).some((o) => o.text === "متاح"));
    expect(installmentSel).toBeTruthy();
    fireEvent.change(installmentSel!, { target: { value: "true" } });
    expect(screen.getByPlaceholderText("12")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("مثال: بدون فوائد")).toBeInTheDocument();
  });

  // ── المواصفات التقنية ──
  test("يوجد حقل المعالج (processor)", () => {
    renderPage();
    expect(screen.getByPlaceholderText("المعالج")).toBeInTheDocument();
  });

  test("يوجد حقل الرام (ram)", () => {
    renderPage();
    expect(screen.getByPlaceholderText("الرام")).toBeInTheDocument();
  });

  test("يوجد حقل الكاميرا الخلفية", () => {
    renderPage();
    expect(screen.getByPlaceholderText("الكاميرا الخلفية")).toBeInTheDocument();
  });

  test("يوجد حقل الكاميرا الأمامية", () => {
    renderPage();
    expect(screen.getByPlaceholderText("الكاميرا الأمامية")).toBeInTheDocument();
  });

  test("يوجد حقل البطارية", () => {
    renderPage();
    expect(screen.getByPlaceholderText("البطارية")).toBeInTheDocument();
  });

  test("يوجد حقل نظام التشغيل", () => {
    renderPage();
    expect(screen.getByPlaceholderText("نظام التشغيل")).toBeInTheDocument();
  });

  // ── التصنيفات ──
  test("يحمّل التصنيفات من API ويعرضها في الـ select", async () => {
    renderPage();
    await waitFor(() => {
      const options = screen.getAllByRole("option", { name: "iPhone" });
      expect(options.length).toBeGreaterThan(0);
    });
  });

  test("يحمّل التصنيفات الفرعية من API", async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getAllByRole("option", { name: "هواتف" }).length).toBeGreaterThan(0);
    });
  });

  // ── الصور ──
  test("يوجد زر رفع صورة وزر رابط صورة", () => {
    renderPage();
    expect(screen.getByText("رفع صورة")).toBeInTheDocument();
    expect(screen.getByText("رابط صورة")).toBeInTheDocument();
  });

  test("يظهر input رابط الصورة عند الضغط على رابط صورة", () => {
    renderPage();
    fireEvent.click(screen.getByText("رابط صورة"));
    expect(screen.getByPlaceholderText("https://example.com/image.jpg")).toBeInTheDocument();
  });

  test("يوجد أزرار إضافة صور الجاليري", () => {
    renderPage();
    expect(screen.getByText("+ رفع صور")).toBeInTheDocument();
    expect(screen.getByText("+ رابط صورة")).toBeInTheDocument();
  });

  // ── الإرسال ──
  test("يمنع الإرسال إذا كان اسم المنتج فارغاً", () => {
    renderPage();
    const form = screen.getByRole("button", { name: "حفظ المنتج" }).closest("form")!;
    fireEvent.submit(form);
    expect(global.fetch).not.toHaveBeenCalledWith("/api/admin/products", expect.anything());
  });

  test("يرسل الفورم بنجاح مع الفيلدات المطلوبة", async () => {
    const toast = require("react-hot-toast").default;
    renderPage();
    fillRequired();
    fireEvent.submit(screen.getByRole("button", { name: "حفظ المنتج" }).closest("form")!);
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith("/api/admin/products", expect.objectContaining({ method: "POST" }));
      expect(toast.success).toHaveBeenCalledWith("تم إضافة المنتج بنجاح ✅");
    });
  });

  test("يعرض رسالة خطأ إذا فشل الـ API", async () => {
    const toast = require("react-hot-toast").default;
    (global.fetch as jest.Mock).mockImplementation((url: string) => {
      if (url.includes("product-form-data")) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve({ categories: [], subCategories: [] }) });
      }
      return Promise.resolve({ ok: false, json: () => Promise.resolve({ error: "خطأ في الخادم" }) });
    });
    renderPage();
    fillRequired();
    fireEvent.submit(screen.getByRole("button", { name: "حفظ المنتج" }).closest("form")!);
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("خطأ في الخادم");
    });
  });

  test("يضيف specs.processor في الـ FormData عند الكتابة", async () => {
    const toast = require("react-hot-toast").default;
    let capturedFd: FormData | null = null;
    (global.fetch as jest.Mock).mockImplementation((url: string, opts: RequestInit) => {
      if (url.includes("product-form-data")) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve({ categories: [], subCategories: [] }) });
      }
      capturedFd = opts.body as FormData;
      return Promise.resolve({ ok: true, json: () => Promise.resolve({ _id: "x" }) });
    });

    renderPage();
    fillRequired();
    fireEvent.change(screen.getByPlaceholderText("المعالج"), { target: { value: "A18 Pro" } });
    fireEvent.submit(screen.getByRole("button", { name: "حفظ المنتج" }).closest("form")!);

    await waitFor(() => expect(toast.success).toHaveBeenCalled());
    expect(capturedFd!.get("specs.processor")).toBe("A18 Pro");
  });

  test("يضيف installment fields في الـ FormData عند التفعيل", async () => {
    const toast = require("react-hot-toast").default;
    let capturedFd: FormData | null = null;
    (global.fetch as jest.Mock).mockImplementation((url: string, opts: RequestInit) => {
      if (url.includes("product-form-data")) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve({ categories: [], subCategories: [] }) });
      }
      capturedFd = opts.body as FormData;
      return Promise.resolve({ ok: true, json: () => Promise.resolve({ _id: "x" }) });
    });

    renderPage();
    fillRequired();

    const selects = screen.getAllByRole("combobox") as HTMLSelectElement[];
    const installmentSel = selects.find((s) => s.value === "false" && Array.from(s.options).some((o) => o.text === "متاح"));
    fireEvent.change(installmentSel!, { target: { value: "true" } });
    fireEvent.change(screen.getByPlaceholderText("12"), { target: { value: "6" } });
    fireEvent.change(screen.getByPlaceholderText("مثال: بدون فوائد"), { target: { value: "بدون فوائد" } });

    fireEvent.submit(screen.getByRole("button", { name: "حفظ المنتج" }).closest("form")!);
    await waitFor(() => expect(toast.success).toHaveBeenCalled());

    expect(capturedFd!.get("installment.available")).toBe("true");
    expect(capturedFd!.get("installment.months")).toBe("6");
    expect(capturedFd!.get("installment.note")).toBe("بدون فوائد");
  });

  test("يضيف imageUrl في الـ FormData عند اختيار رابط صورة", async () => {
    const toast = require("react-hot-toast").default;
    let capturedFd: FormData | null = null;
    (global.fetch as jest.Mock).mockImplementation((url: string, opts: RequestInit) => {
      if (url.includes("product-form-data")) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve({ categories: [], subCategories: [] }) });
      }
      capturedFd = opts.body as FormData;
      return Promise.resolve({ ok: true, json: () => Promise.resolve({ _id: "x" }) });
    });

    renderPage();
    fillRequired();
    fireEvent.click(screen.getByText("رابط صورة"));
    fireEvent.change(screen.getByPlaceholderText("https://example.com/image.jpg"), {
      target: { value: "https://cdn.example.com/img.jpg" },
    });

    fireEvent.submit(screen.getByRole("button", { name: "حفظ المنتج" }).closest("form")!);
    await waitFor(() => expect(toast.success).toHaveBeenCalled());

    expect(capturedFd!.get("imageUrl")).toBe("https://cdn.example.com/img.jpg");
  });
});
