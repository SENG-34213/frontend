import React, { useCallback, useEffect, useState } from "react";
import {
  Archive,
  Check,
  Edit3,
  Grid2X2,
  ImagePlus,
  List,
  PackageOpen,
  Plus,
  RefreshCcw,
  Search,
  ShoppingBag,
  X,
} from "lucide-react";
import {
  createMarketplaceProduct,
  getMarketplaceMaterialDownloadUrl,
  getMarketplaceProducts,
  MARKETPLACE_CATEGORIES,
  updateMarketplaceProduct,
  updateMarketplaceStatus,
  uploadMarketplaceMaterial,
  type MarketplaceCategory,
  type MarketplaceProduct,
  type MarketplaceProductRequest,
  type MarketplaceStatus,
} from "../api/marketplaceApi";
import type { Course, Grade, TeacherProfile } from "../types";
import { fetchAdminUsers } from "../api/usersApi";
import { fetchCourses } from "../api/coursesApi";
import { fetchGrades } from "../api/gradesApi";

const emptyForm: MarketplaceProductRequest = {
  materialId: "",
  thumbnailMaterialId: "",
  title: "",
  shortDescription: "",
  description: "",
  category: "NOTES",
  subject: "",
  gradeId: "",
  price: 0,
  free: false,
  discountPercent: undefined,
  currency: "LKR",
  thumbnailUrl: "",
  status: "DRAFT",
};

const label = (value: string) =>
  value
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (character) => character.toUpperCase());

interface MarketplaceManagementProps {
  onToast?: (type: "success" | "error" | "info", title: string, description?: string) => void;
}

export const MarketplaceManagement: React.FC<MarketplaceManagementProps> = ({ onToast }) => {
  const [products, setProducts] = useState<MarketplaceProduct[]>([]);
  const [form, setForm] = useState<MarketplaceProductRequest>(emptyForm);
  const [editing, setEditing] = useState<MarketplaceProduct | null>(null);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedThumbnail, setSelectedThumbnail] = useState<File | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [thumbnailUrls, setThumbnailUrls] = useState<Record<string, string>>({});
  const [grades, setGrades] = useState<Grade[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [teachers, setTeachers] = useState<TeacherProfile[]>([]);

  const notify = (type: "success" | "error" | "info", title: string, description: string) => {
    if (onToast) onToast(type, title, description);
    else if (type === "success") setNotice(description);
    else setError(description);
  };

  const load = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      const page = await getMarketplaceProducts(search);
      setProducts(page.content || []);
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "Marketplace products could not be loaded.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [search]);

  useEffect(() => {
    const loadTask = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(loadTask);
  }, [load]);

  useEffect(() => {
    const thumbnailIds = products
      .map((product) => product.thumbnailMaterialId)
      .filter((id): id is string => Boolean(id));
    const loadTask = window.setTimeout(() => {
      void Promise.all(
        thumbnailIds.map(async (id) => [id, await getMarketplaceMaterialDownloadUrl(id)] as const),
      )
        .then((entries) => setThumbnailUrls(Object.fromEntries(entries)))
        .catch(() => undefined);
    }, 0);
    return () => window.clearTimeout(loadTask);
  }, [products]);

  useEffect(() => {
    const loadTask = window.setTimeout(() => {
      void Promise.all([fetchGrades(), fetchCourses(), fetchAdminUsers()])
        .then(([loadedGrades, loadedCourses, users]) => {
          setGrades(loadedGrades);
          setCourses(loadedCourses);
          setTeachers(users.teachers);
        })
        .catch(() => setError("Grade, course, and teacher options could not be loaded."));
    }, 0);
    return () => window.clearTimeout(loadTask);
  }, []);

  const selectedGrade = grades.find((grade) => grade.id === form.gradeId);
  const courseDomains = Array.from(
    new Set(
      courses
        .filter((course) => course.gradeId === form.gradeId)
        .map((course) => course.subject || course.category)
        .concat(selectedGrade?.subjectDomains || [])
        .filter((domain): domain is string => Boolean(domain?.trim())),
    ),
  ).sort();
  const domainOptions = Array.from(
    new Set([...courseDomains, ...(form.courseDomain ? [form.courseDomain] : [])]),
  ).sort();

  const reset = () => {
    setEditing(null);
    setForm(emptyForm);
    setSelectedFile(null);
    setSelectedThumbnail(null);
    setIsFormOpen(false);
  };
  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSaving(true);
    setError("");
    setNotice("");
    try {
      let materialId = form.materialId;
      let thumbnailMaterialId = form.thumbnailMaterialId;
      if (!editing) {
        if (!selectedFile) throw new Error("Please select the marketplace file to upload.");
        const material = await uploadMarketplaceMaterial(
          selectedFile,
          form.title,
          form.description,
        );
        materialId = material.id;
      }
      if (selectedThumbnail) {
        const thumbnail = await uploadMarketplaceMaterial(
          selectedThumbnail,
          `${form.title} thumbnail`,
        );
        thumbnailMaterialId = thumbnail.id;
      }
      const request = { ...form, materialId, thumbnailMaterialId };
      if (editing) await updateMarketplaceProduct(editing.id, request);
      else await createMarketplaceProduct(request);
      notify(
        "success",
        editing ? "Marketplace material updated" : "Marketplace material created",
        editing
          ? `${form.title} was updated successfully.`
          : `${form.title} was uploaded and added to the marketplace.`,
      );
      reset();
      await load();
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : "The product could not be saved.";
      notify("error", "Marketplace material failed", message);
    } finally {
      setIsSaving(false);
    }
  };
  const changeStatus = async (product: MarketplaceProduct, status: MarketplaceStatus) => {
    try {
      await updateMarketplaceStatus(product.id, status);
      notify(
        "success",
        `Material ${status.toLowerCase()}`,
        `${product.title} is now ${status.toLowerCase()}.`,
      );
      await load();
    } catch (caught) {
      const message =
        caught instanceof Error ? caught.message : "Product status could not be updated.";
      notify("error", "Status update failed", message);
    }
  };

  return (
    <div className="space-y-6 pb-8">
      <section className="relative overflow-hidden rounded-[28px] bg-slate-950 px-6 py-7 text-white shadow-xl sm:px-8">
        <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-indigo-500/20 blur-3xl" />
        <div className="relative z-10 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <div className="mb-3 flex items-center gap-2 text-xs font-semibold text-indigo-200">
              <ShoppingBag className="h-4 w-4" /> Digital material marketplace
            </div>
            <h1 className="text-3xl font-semibold tracking-tight">Sell trusted study resources.</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
              Create and publish admin-controlled digital products. Files remain owned by Material
              Service; this workspace controls the catalog and price.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-white/10 bg-white/10 p-4">
              <p className="text-2xl font-semibold">{products.length}</p>
              <p className="text-[11px] text-slate-400">Loaded products</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/10 p-4">
              <p className="text-2xl font-semibold">
                {products.filter((product) => product.status === "PUBLISHED").length}
              </p>
              <p className="text-[11px] text-slate-400">Published</p>
            </div>
          </div>
        </div>
      </section>

      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-lg font-semibold text-slate-950 dark:text-white">Product catalog</h2>
          <p className="text-xs text-slate-500">
            Manage titles, prices, categories, and publishing state.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => void load()}
            className="rounded-xl border border-slate-200 p-2.5 text-slate-500 hover:text-indigo-600 dark:border-slate-800"
          >
            <RefreshCcw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          </button>
          <button
            onClick={() => {
              setEditing(null);
              setForm(emptyForm);
              setSelectedFile(null);
              setSelectedThumbnail(null);
              setIsFormOpen(true);
            }}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-3.5 py-2.5 text-xs font-bold text-white hover:bg-indigo-700"
          >
            <Plus className="h-4 w-4" /> New product
          </button>
          <div className="flex rounded-xl border border-slate-200 p-1 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setViewMode("list")}
              className={`rounded-lg p-2 ${viewMode === "list" ? "bg-slate-100 text-indigo-600 dark:bg-slate-800" : "text-slate-400"}`}
              aria-label="List view"
            >
              <List className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              className={`rounded-lg p-2 ${viewMode === "grid" ? "bg-slate-100 text-indigo-600 dark:bg-slate-800" : "text-slate-400"}`}
              aria-label="Grid view"
            >
              <Grid2X2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
          {error}
        </div>
      )}
      {notice && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
          {notice}
        </div>
      )}

      <div className="w-full">
        <section className="w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="border-b border-slate-100 p-4 dark:border-slate-800">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search products..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-950"
              />
            </div>
          </div>
          {isLoading ? (
            <div className="p-10 text-center text-sm text-slate-500">
              Loading marketplace products…
            </div>
          ) : products.length === 0 ? (
            <div className="p-12 text-center">
              <PackageOpen className="mx-auto h-10 w-10 text-slate-300" />
              <p className="mt-3 text-sm font-semibold text-slate-700 dark:text-slate-300">
                No products yet
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Upload a resource to create your first marketplace product.
              </p>
            </div>
          ) : (
            <div
              className={
                viewMode === "grid"
                  ? "grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 xl:grid-cols-3"
                  : "overflow-x-auto"
              }
            >
              {viewMode === "list" && (
                <div className="hidden min-w-[820px] grid-cols-[80px_minmax(260px,1fr)_160px_120px_120px] gap-4 border-b border-slate-100 bg-slate-50 px-5 py-3 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400 md:grid dark:border-slate-800 dark:bg-slate-950/50">
                  <span>Cover</span>
                  <span>Product details</span>
                  <span>Pricing</span>
                  <span>Status</span>
                  <span className="text-right">Actions</span>
                </div>
              )}
              {products.map((product) => (
                <div
                  key={product.id}
                  className={
                    viewMode === "grid"
                      ? "flex flex-col gap-4 rounded-2xl border border-slate-200 p-4 dark:border-slate-800"
                      : "grid min-w-[820px] grid-cols-[80px_minmax(260px,1fr)_160px_120px_120px] items-center gap-4 border-b border-slate-100 px-5 py-3.5 last:border-b-0 dark:border-slate-800"
                  }
                >
                  <div
                    className={`flex shrink-0 items-center justify-center overflow-hidden rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-300 ${viewMode === "grid" ? "h-28 w-full" : "h-16 w-20"}`}
                  >
                    {thumbnailUrls[product.thumbnailMaterialId || ""] || product.thumbnailUrl ? (
                      <img
                        src={
                          thumbnailUrls[product.thumbnailMaterialId || ""] ||
                          product.thumbnailUrl ||
                          ""
                        }
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <PackageOpen className="h-7 w-7" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">
                      {product.title}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                      <span>{label(product.category)}</span>
                      {product.gradeId && <span>Grade assigned</span>}
                      {product.courseDomain && <span>{product.courseDomain}</span>}
                      {product.materialOwnerName && <span>By {product.materialOwnerName}</span>}
                    </div>
                  </div>
                  <div className="shrink-0 text-left md:text-right">
                    {product.free ? (
                      <span className="rounded-full bg-emerald-100 px-3 py-1.5 text-xs font-extrabold text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
                        Free
                      </span>
                    ) : (
                      <div>
                        {product.discountPercent && product.discountPercent > 0 && (
                          <p className="text-[11px] font-medium text-slate-400 line-through">
                            {product.currency} {product.price.toFixed(2)}
                          </p>
                        )}
                        <p className="text-sm font-extrabold text-indigo-700 dark:text-indigo-300">
                          {product.currency} {(product.finalPrice ?? product.price).toFixed(2)}
                        </p>
                        {product.discountPercent && product.discountPercent > 0 && (
                          <p className="text-[10px] font-bold text-rose-600">
                            {product.discountPercent}% off
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${product.status === "PUBLISHED" ? "bg-emerald-50 text-emerald-700" : product.status === "ARCHIVED" ? "bg-slate-100 text-slate-500" : "bg-amber-50 text-amber-700"}`}
                  >
                    {label(product.status)}
                  </span>
                  <div className="flex items-center justify-start gap-1 md:justify-end">
                    <button
                      onClick={() => {
                        setEditing(product);
                        setSelectedFile(null);
                        setSelectedThumbnail(null);
                        setIsFormOpen(true);
                        setForm({
                          materialId: product.materialId,
                          thumbnailMaterialId: product.thumbnailMaterialId || "",
                          materialOwnerId: product.materialOwnerId || "",
                          materialOwnerName: product.materialOwnerName || "",
                          title: product.title,
                          shortDescription: product.shortDescription || "",
                          description: product.description || "",
                          category: product.category,
                          subject: product.subject || "",
                          courseDomain: product.courseDomain || product.subject || "",
                          gradeId: product.gradeId || "",
                          price: product.price,
                          free: product.free,
                          discountPercent: product.discountPercent,
                          currency: product.currency,
                          thumbnailUrl: product.thumbnailUrl || "",
                          status: product.status,
                        });
                      }}
                      className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-indigo-600"
                      aria-label={`Edit ${product.title}`}
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>
                    {product.status === "DRAFT" && (
                      <button
                        onClick={() => void changeStatus(product, "PUBLISHED")}
                        className="rounded-lg p-2 text-emerald-600 hover:bg-emerald-50"
                        aria-label={`Publish ${product.title}`}
                      >
                        <Check className="h-4 w-4" />
                      </button>
                    )}
                    {product.status === "PUBLISHED" && (
                      <button
                        onClick={() => void changeStatus(product, "ARCHIVED")}
                        className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
                        aria-label={`Archive ${product.title}`}
                      >
                        <Archive className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
        {isFormOpen && (
          <>
            <div
              className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm"
              onClick={reset}
              aria-hidden="true"
            />
            <form
              onSubmit={save}
              className="fixed inset-x-4 top-1/2 z-50 mx-auto max-h-[90vh] max-w-2xl -translate-y-1/2 space-y-4 overflow-y-auto rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl dark:border-slate-800 dark:bg-slate-900 sm:p-6"
            >
              <div>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                      {editing ? "Edit product" : "Upload material"}
                    </h2>
                    <p className="mt-1 text-xs text-slate-500">
                      {editing
                        ? "Update the marketplace listing details."
                        : "Upload a protected file to Material Service and create its listing."}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={reset}
                    className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-white"
                    aria-label="Close material form"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>
              {!editing && (
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300">
                  Marketplace file
                  <input
                    type="file"
                    required
                    accept="application/pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.zip,.png,.jpg,.jpeg"
                    onChange={(event) => setSelectedFile(event.target.files?.[0] ?? null)}
                    className="mt-1.5 block w-full rounded-xl border border-dashed border-slate-300 bg-slate-50 px-3 py-3 text-xs font-normal dark:border-slate-700 dark:bg-slate-950"
                  />
                  <span className="mt-1 block text-[11px] font-normal text-slate-400">
                    The file is uploaded securely when you create the product.
                  </span>
                </label>
              )}
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300">
                Thumbnail image <span className="font-normal text-slate-400">(optional)</span>
                <div className="mt-1.5 flex items-center gap-3 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-950">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-300">
                    <ImagePlus className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      onChange={(event) => setSelectedThumbnail(event.target.files?.[0] ?? null)}
                      className="block w-full text-xs font-normal text-slate-500 file:mr-3 file:rounded-lg file:border-0 file:bg-indigo-50 file:px-3 file:py-2 file:text-xs file:font-semibold file:text-indigo-700"
                    />
                    <p className="mt-1 truncate text-[11px] font-normal text-slate-400">
                      {selectedThumbnail
                        ? selectedThumbnail.name
                        : "PNG, JPG, or WEBP · uploaded through Material Service"}
                    </p>
                  </div>
                </div>
              </label>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                  Product title
                  <input
                    required
                    value={form.title}
                    onChange={(event) =>
                      setForm((previous) => ({ ...previous, title: event.target.value }))
                    }
                    className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-normal outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-950"
                  />
                </label>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                  Grade
                  <select
                    required
                    value={form.gradeId}
                    onChange={(event) =>
                      setForm((previous) => ({
                        ...previous,
                        gradeId: event.target.value,
                        courseDomain: "",
                        subject: "",
                      }))
                    }
                    className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-normal dark:border-slate-700 dark:bg-slate-950"
                  >
                    <option value="">Select grade</option>
                    {grades
                      .filter((grade) => grade.active)
                      .map((grade) => (
                        <option key={grade.id} value={grade.id}>
                          {grade.name}
                        </option>
                      ))}
                  </select>
                </label>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                  Category
                  <select
                    value={form.category}
                    onChange={(event) =>
                      setForm((previous) => ({
                        ...previous,
                        category: event.target.value as MarketplaceCategory,
                      }))
                    }
                    className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-2 py-2.5 text-xs font-normal dark:border-slate-700 dark:bg-slate-950"
                  >
                    {MARKETPLACE_CATEGORIES.map((category) => (
                      <option key={category}>{category}</option>
                    ))}
                  </select>
                </label>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                  Listing status
                  <select
                    value={form.status || "DRAFT"}
                    onChange={(event) =>
                      setForm((previous) => ({
                        ...previous,
                        status: event.target.value as MarketplaceStatus,
                      }))
                    }
                    className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-normal dark:border-slate-700 dark:bg-slate-950"
                  >
                    <option value="DRAFT">Draft · hidden from students</option>
                    <option value="PUBLISHED">Published · visible to students</option>
                    <option value="ARCHIVED">Archived · no longer available</option>
                  </select>
                </label>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                  Course domain
                  <select
                    required
                    disabled={!form.gradeId || domainOptions.length === 0}
                    value={form.courseDomain || ""}
                    onChange={(event) =>
                      setForm((previous) => ({
                        ...previous,
                        courseDomain: event.target.value,
                        subject: event.target.value,
                      }))
                    }
                    className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-normal disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-950"
                  >
                    <option value="">
                      {!form.gradeId ? "Select a grade first" : "Select course domain"}
                    </option>
                    {domainOptions.map((domain) => (
                      <option key={domain} value={domain}>
                        {domain}
                      </option>
                    ))}
                  </select>
                  <span className="mt-1 block text-[11px] font-normal text-slate-400">
                    Domains come from courses and the selected grade.
                  </span>
                </label>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                  Material owner <span className="font-normal text-slate-400">(optional)</span>
                  <select
                    value={form.materialOwnerId || ""}
                    onChange={(event) => {
                      const teacher = teachers.find(
                        (item) => (item.keycloakUserId || item.id) === event.target.value,
                      );
                      setForm((previous) => ({
                        ...previous,
                        materialOwnerId: teacher?.keycloakUserId || teacher?.id || "",
                        materialOwnerName: teacher
                          ? `${teacher.firstName} ${teacher.lastName}`
                          : "",
                      }));
                    }}
                    className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-normal dark:border-slate-700 dark:bg-slate-950"
                  >
                    <option value="">Select teacher owner</option>
                    {teachers.map((teacher) => (
                      <option key={teacher.id} value={teacher.keycloakUserId || teacher.id}>
                        {teacher.firstName} {teacher.lastName}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                  Price
                  <input
                    type="number"
                    min={form.free ? "0" : "0.01"}
                    step="0.01"
                    disabled={form.free}
                    value={form.price}
                    onChange={(event) =>
                      setForm((previous) => ({ ...previous, price: Number(event.target.value) }))
                    }
                    className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-normal disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-950"
                  />
                </label>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                  Discount <span className="font-normal text-slate-400">(optional)</span>
                  <div className="relative mt-1.5">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.01"
                      disabled={form.free}
                      value={form.discountPercent ?? ""}
                      onChange={(event) =>
                        setForm((previous) => ({
                          ...previous,
                          discountPercent:
                            event.target.value === "" ? undefined : Number(event.target.value),
                        }))
                      }
                      placeholder="0"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 pr-8 text-sm font-normal disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-950"
                    />
                    <span className="absolute right-3 top-2.5 text-xs text-slate-400">%</span>
                  </div>
                </label>
                <label className="col-span-full flex cursor-pointer items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 dark:border-emerald-900/50 dark:bg-emerald-950/20">
                  <span>
                    <span className="block text-xs font-bold text-emerald-800 dark:text-emerald-300">
                      Free download
                    </span>
                    <span className="mt-0.5 block text-[11px] font-normal text-emerald-700/70 dark:text-emerald-400/70">
                      Anyone can download this material without payment.
                    </span>
                  </span>
                  <input
                    type="checkbox"
                    checked={form.free}
                    onChange={(event) =>
                      setForm((previous) => ({
                        ...previous,
                        free: event.target.checked,
                        price: event.target.checked ? 0 : previous.price || 1,
                        discountPercent: event.target.checked
                          ? undefined
                          : previous.discountPercent,
                      }))
                    }
                    className="h-5 w-5 accent-emerald-600"
                  />
                </label>
              </div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300">
                Short description
                <input
                  value={form.shortDescription || ""}
                  onChange={(event) =>
                    setForm((previous) => ({ ...previous, shortDescription: event.target.value }))
                  }
                  className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-normal outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-950"
                />
              </label>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300">
                Description
                <textarea
                  value={form.description}
                  onChange={(event) =>
                    setForm((previous) => ({ ...previous, description: event.target.value }))
                  }
                  rows={4}
                  className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-normal outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-950"
                />
              </label>
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 rounded-xl bg-indigo-600 px-3 py-2.5 text-xs font-bold text-white disabled:opacity-60"
                >
                  {isSaving ? "Saving…" : editing ? "Save changes" : "Create product"}
                </button>
                {editing && (
                  <button
                    type="button"
                    onClick={reset}
                    className="rounded-xl border border-slate-200 px-3 py-2.5 text-xs font-bold text-slate-600 dark:border-slate-700 dark:text-slate-300"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};
