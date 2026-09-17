"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

const inputCls = "w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";

export default function NewProductPage() {
  const router = useRouter();

  // Basic
  const [name, setName] = useState("");
  const [brief, setBrief] = useState("");
  const [originalPrice, setOriginalPrice] = useState("");
  const [salePrice, setSalePrice] = useState("");
  const [category, setCategory] = useState("");
  const [subCategory, setSubCategory] = useState("");
  const [brand, setBrand] = useState("");
  const [inStock, setInStock] = useState(true);
  const [description, setDescription] = useState("");

  // Physical
  const [color, setColor] = useState("");
  const [storage, setStorage] = useState("");
  const [network, setNetwork] = useState("");
  const [screenSize, setScreenSize] = useState("");

  // Delivery & warranty
  const [freeDelivery, setFreeDelivery] = useState(true);
  const [deliveryTime, setDeliveryTime] = useState("24 ساعة");
  const [warrantyYears, setWarrantyYears] = useState("2");
  const [taxIncluded, setTaxIncluded] = useState(true);

  // Installment
  const [installmentAvailable, setInstallmentAvailable] = useState(false);
  const [installmentDown, setInstallmentDown] = useState("");
  const [installmentMonths, setInstallmentMonths] = useState("");
  const [installmentNote, setInstallmentNote] = useState("");

  // Specs
  const [specs, setSpecs] = useState({
    screen: "", processor: "", ram: "", storage: "",
    rearCamera: "", frontCamera: "", battery: "", batteryLife: "",
    charging: "", os: "", extras: "",
  });

  // Images
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imageMode, setImageMode] = useState<"upload" | "url">("upload");
  const [gallery, setGallery] = useState<{ mode: "upload" | "url"; file?: File; preview?: string; url?: string }[]>([]);

  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);
  const [subCategories, setSubCategories] = useState<string[]>([]);

  const imageInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/admin/product-form-data", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => {
        setCategories(d.categories || []);
        setSubCategories(d.subCategories || []);
      })
      .catch(() => {});
  }, []);

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    e.target.value = "";
  }

  function clearMainImage() {
    setImageFile(null);
    setImagePreview("");
    setImageUrl("");
  }

  function addGalleryFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files) return;
    const newItems = Array.from(files).map((f) => ({
      mode: "upload" as const,
      file: f,
      preview: URL.createObjectURL(f),
    }));
    setGallery((prev) => [...prev, ...newItems]);
    e.target.value = "";
  }

  function addGalleryUrl() {
    setGallery((prev) => [...prev, { mode: "url", url: "" }]);
  }

  function updateGalleryUrl(index: number, url: string) {
    setGallery((prev) => prev.map((item, i) => (i === index ? { ...item, url } : item)));
  }

  function removeGalleryItem(index: number) {
    setGallery((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData();

      // Basic
      fd.append("name", name.trim());
      if (brief.trim()) fd.append("brief", brief.trim());
      fd.append("originalPrice", originalPrice);
      if (salePrice) fd.append("salePrice", salePrice);
      if (category) fd.append("category", category);
      if (subCategory) fd.append("subCategory", subCategory);
      if (brand.trim()) fd.append("brand", brand.trim());
      fd.append("inStock", String(inStock));
      if (description.trim()) fd.append("description", description.trim());

      // Physical
      if (color.trim()) fd.append("color", color.trim());
      if (storage.trim()) fd.append("storage", storage.trim());
      if (network.trim()) fd.append("network", network.trim());
      if (screenSize.trim()) fd.append("screenSize", screenSize.trim());

      // Delivery & warranty
      fd.append("freeDelivery", String(freeDelivery));
      fd.append("taxIncluded", String(taxIncluded));
      if (deliveryTime.trim()) fd.append("deliveryTime", deliveryTime.trim());
      if (warrantyYears) fd.append("warrantyYears", warrantyYears);

      // Installment
      fd.append("installment.available", String(installmentAvailable));
      if (installmentAvailable) {
        if (installmentDown) fd.append("installment.downPayment", installmentDown);
        if (installmentMonths) fd.append("installment.months", installmentMonths);
        if (installmentNote.trim()) fd.append("installment.note", installmentNote.trim());
      }

      // Specs
      (Object.keys(specs) as (keyof typeof specs)[]).forEach((k) => {
        if (specs[k].trim()) fd.append(`specs.${k}`, specs[k].trim());
      });

      // Image
      if (imageMode === "upload" && imageFile) {
        fd.append("image", imageFile);
      } else if (imageMode === "url" && imageUrl.trim()) {
        fd.append("imageUrl", imageUrl.trim());
      }

      // Gallery
      const galleryUrls: string[] = [];
      gallery.forEach((item) => {
        if (item.mode === "upload" && item.file) {
          fd.append("galleryFiles", item.file);
        } else if (item.mode === "url" && item.url?.trim()) {
          galleryUrls.push(item.url.trim());
        }
      });
      if (galleryUrls.length) fd.append("galleryUrls", JSON.stringify(galleryUrls));

      const res = await fetch("/api/admin/products", {
        method: "POST",
        credentials: "include",
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "فشل الإضافة");
      toast.success("تم إضافة المنتج بنجاح ✅");
      router.push("/admin/products");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "حدث خطأ");
    } finally {
      setSaving(false);
    }
  }

  const mainPreview = imageMode === "upload" ? imagePreview : imageUrl;

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto space-y-6 py-4">
      <h1 className="text-xl font-bold text-gray-800">إضافة منتج جديد</h1>

      {/* ── الصورة الرئيسية ── */}
      <Section title="الصورة الرئيسية">
        <div className="flex gap-2 mb-2">
          <ModeBtn active={imageMode === "upload"} onClick={() => setImageMode("upload")}>رفع صورة</ModeBtn>
          <ModeBtn active={imageMode === "url"} onClick={() => setImageMode("url")}>رابط صورة</ModeBtn>
        </div>
        {imageMode === "url" ? (
          <div className="space-y-2">
            <div className="flex gap-2">
              <input type="url" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://example.com/image.jpg" className={inputCls} dir="ltr" />
              {imageUrl && <DangerBtn onClick={clearMainImage}>حذف</DangerBtn>}
            </div>
            {imageUrl && <img src={imageUrl} alt="معاينة" className="w-full h-48 object-contain rounded-xl border border-gray-200 bg-gray-50" onError={(e) => (e.currentTarget.style.display = "none")} />}
          </div>
        ) : (
          <>
            <input ref={imageInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleImageChange} />
            {mainPreview ? (
              <div className="relative w-full h-48 rounded-xl border border-gray-200 bg-gray-50 overflow-hidden group">
                <img src={mainPreview} alt="صورة المنتج" className="w-full h-full object-contain cursor-pointer" onClick={() => imageInputRef.current?.click()} />
                <button type="button" onClick={clearMainImage} className="absolute top-2 left-2 w-7 h-7 bg-red-500 text-white rounded-full text-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 z-10">×</button>
              </div>
            ) : (
              <button type="button" onClick={() => imageInputRef.current?.click()} className="w-full border-2 border-dashed border-gray-300 rounded-xl py-10 flex flex-col items-center gap-2 hover:border-blue-400 hover:bg-blue-50 transition-colors">
                <p className="text-sm text-gray-500">اضغط لاختيار صورة</p>
                <p className="text-xs text-gray-400">JPG, PNG, WEBP</p>
              </button>
            )}
          </>
        )}
      </Section>

      {/* ── معرض الصور ── */}
      <Section title="معرض الصور (جاليري)">
        <div className="flex gap-2 mb-2">
          <input ref={galleryInputRef} type="file" accept="image/jpeg,image/png,image/webp" multiple className="hidden" onChange={addGalleryFiles} />
          <button type="button" onClick={() => galleryInputRef.current?.click()} className="px-3 py-1.5 text-xs rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50">+ رفع صور</button>
          <button type="button" onClick={addGalleryUrl} className="px-3 py-1.5 text-xs rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50">+ رابط صورة</button>
        </div>
        {gallery.length > 0 ? (
          <div className="grid grid-cols-3 gap-2">
            {gallery.map((item, i) => (
              <div key={i} className="relative group">
                {item.mode === "url" ? (
                  <div className="space-y-1">
                    <input type="url" value={item.url || ""} onChange={(e) => updateGalleryUrl(i, e.target.value)} placeholder="رابط الصورة" className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500" dir="ltr" />
                    {item.url && <img src={item.url} alt="" className="w-full h-20 object-cover rounded-lg border" onError={(e) => (e.currentTarget.style.display = "none")} />}
                  </div>
                ) : (
                  <img src={item.preview} alt="" className="w-full h-24 object-cover rounded-lg border border-gray-200" />
                )}
                <button type="button" onClick={() => removeGalleryItem(i)} className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">×</button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-gray-400">لم يتم إضافة صور للمعرض بعد</p>
        )}
      </Section>

      {/* ── المعلومات الأساسية ── */}
      <Section title="المعلومات الأساسية">
        <Field label="اسم المنتج" required>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="مثال: iPhone 15 Pro Max" className={inputCls} required />
        </Field>
        <Field label="وصف مختصر (brief)">
          <input type="text" value={brief} onChange={(e) => setBrief(e.target.value)} placeholder="جملة قصيرة تظهر تحت الاسم" className={inputCls} />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="السعر الأصلي (ر.س)" required hint="السعر المشطوب عليه">
            <input type="number" value={originalPrice} onChange={(e) => setOriginalPrice(e.target.value)} placeholder="0" min="0" step="0.01" className={inputCls} required />
          </Field>
          <Field label="سعر البيع (ر.س)" hint="اتركه فارغاً إن لم يكن هناك خصم">
            <input type="number" value={salePrice} onChange={(e) => setSalePrice(e.target.value)} placeholder="اختياري" min="0" step="0.01" className={inputCls} />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Field label="التصنيف الرئيسي">
            <select value={category} onChange={(e) => setCategory(e.target.value)} className={inputCls}>
              <option value="">-- اختر --</option>
              {categories.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </Field>
          <Field label="التصنيف الفرعي">
            <select value={subCategory} onChange={(e) => setSubCategory(e.target.value)} className={inputCls}>
              <option value="">-- اختر --</option>
              {subCategories.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Field label="الماركة (Brand)">
            <input type="text" value={brand} onChange={(e) => setBrand(e.target.value)} placeholder="مثال: Apple" className={inputCls} />
          </Field>
          <Field label="الحالة">
            <select value={inStock ? "true" : "false"} onChange={(e) => setInStock(e.target.value === "true")} className={inputCls}>
              <option value="true">متوفر</option>
              <option value="false">غير متوفر</option>
            </select>
          </Field>
        </div>
        <Field label="الوصف التفصيلي">
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="وصف المنتج..." rows={3} className={inputCls + " resize-none"} />
        </Field>
      </Section>

      {/* ── المواصفات الفيزيائية ── */}
      <Section title="المواصفات الفيزيائية">
        <div className="grid grid-cols-2 gap-4">
          <Field label="اللون">
            <input type="text" value={color} onChange={(e) => setColor(e.target.value)} placeholder="مثال: أسود" className={inputCls} />
          </Field>
          <Field label="التخزين">
            <input type="text" value={storage} onChange={(e) => setStorage(e.target.value)} placeholder="مثال: 256GB" className={inputCls} />
          </Field>
          <Field label="الشبكة">
            <input type="text" value={network} onChange={(e) => setNetwork(e.target.value)} placeholder="مثال: 5G" className={inputCls} />
          </Field>
          <Field label="حجم الشاشة">
            <input type="text" value={screenSize} onChange={(e) => setScreenSize(e.target.value)} placeholder='مثال: 6.7"' className={inputCls} />
          </Field>
        </div>
      </Section>

      {/* ── التوصيل والضمان ── */}
      <Section title="التوصيل والضمان">
        <div className="grid grid-cols-2 gap-4">
          <Field label="التوصيل المجاني">
            <select value={freeDelivery ? "true" : "false"} onChange={(e) => setFreeDelivery(e.target.value === "true")} className={inputCls}>
              <option value="true">مجاني</option>
              <option value="false">مدفوع</option>
            </select>
          </Field>
          <Field label="وقت التوصيل">
            <input type="text" value={deliveryTime} onChange={(e) => setDeliveryTime(e.target.value)} placeholder="24 ساعة" className={inputCls} />
          </Field>
          <Field label="سنوات الضمان">
            <input type="number" value={warrantyYears} onChange={(e) => setWarrantyYears(e.target.value)} placeholder="2" min="0" step="1" className={inputCls} />
          </Field>
          <Field label="الضريبة مشمولة">
            <select value={taxIncluded ? "true" : "false"} onChange={(e) => setTaxIncluded(e.target.value === "true")} className={inputCls}>
              <option value="true">نعم</option>
              <option value="false">لا</option>
            </select>
          </Field>
        </div>
      </Section>

      {/* ── التقسيط ── */}
      <Section title="التقسيط">
        <Field label="التقسيط متاح">
          <select value={installmentAvailable ? "true" : "false"} onChange={(e) => setInstallmentAvailable(e.target.value === "true")} className={inputCls}>
            <option value="false">غير متاح</option>
            <option value="true">متاح</option>
          </select>
        </Field>
        {installmentAvailable && (
          <div className="grid grid-cols-2 gap-4 mt-3">
            <Field label="الدفعة الأولى (ر.س)">
              <input type="number" value={installmentDown} onChange={(e) => setInstallmentDown(e.target.value)} placeholder="0" min="0" step="0.01" className={inputCls} />
            </Field>
            <Field label="عدد الأشهر">
              <input type="number" value={installmentMonths} onChange={(e) => setInstallmentMonths(e.target.value)} placeholder="12" min="1" step="1" className={inputCls} />
            </Field>
            <div className="col-span-2">
              <Field label="ملاحظة التقسيط">
                <input type="text" value={installmentNote} onChange={(e) => setInstallmentNote(e.target.value)} placeholder="مثال: بدون فوائد" className={inputCls} />
              </Field>
            </div>
          </div>
        )}
      </Section>

      {/* ── المواصفات التقنية ── */}
      <Section title="المواصفات التقنية (Specs)">
        <div className="grid grid-cols-2 gap-4">
          {(
            [
              ["screen", "الشاشة"],
              ["processor", "المعالج"],
              ["ram", "الرام"],
              ["storage", "التخزين"],
              ["rearCamera", "الكاميرا الخلفية"],
              ["frontCamera", "الكاميرا الأمامية"],
              ["battery", "البطارية"],
              ["batteryLife", "عمر البطارية"],
              ["charging", "الشحن"],
              ["os", "نظام التشغيل"],
            ] as [keyof typeof specs, string][]
          ).map(([key, label]) => (
            <Field key={key} label={label}>
              <input
                type="text"
                value={specs[key]}
                onChange={(e) => setSpecs((prev) => ({ ...prev, [key]: e.target.value }))}
                placeholder={label}
                className={inputCls}
              />
            </Field>
          ))}
          <div className="col-span-2">
            <Field label="ملاحظات إضافية">
              <input
                type="text"
                value={specs.extras}
                onChange={(e) => setSpecs((prev) => ({ ...prev, extras: e.target.value }))}
                placeholder="أي مواصفات إضافية"
                className={inputCls}
              />
            </Field>
          </div>
        </div>
      </Section>

      {/* ── الأزرار ── */}
      <div className="flex gap-3 pt-2">
        <button type="button" onClick={() => router.push("/admin/products")} className="flex-1 py-2.5 border border-gray-300 text-gray-700 rounded-xl text-sm hover:bg-gray-50">
          إلغاء
        </button>
        <button type="submit" disabled={saving} className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 disabled:opacity-60">
          {saving ? "جاري الحفظ..." : "حفظ المنتج"}
        </button>
      </div>
    </form>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-4">
      <h2 className="text-sm font-semibold text-gray-700 border-b border-gray-100 pb-2">{title}</h2>
      {children}
    </div>
  );
}

function Field({ label, required, hint, children }: { label: string; required?: boolean; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
    </div>
  );
}

function ModeBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" onClick={onClick} className={`px-3 py-1.5 text-xs rounded-lg border ${active ? "bg-blue-600 text-white border-blue-600" : "border-gray-300 text-gray-600"}`}>
      {children}
    </button>
  );
}

function DangerBtn({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" onClick={onClick} className="shrink-0 px-3 py-2 bg-red-50 text-red-600 border border-red-200 rounded-xl text-xs hover:bg-red-100 transition-colors">
      {children}
    </button>
  );
}
