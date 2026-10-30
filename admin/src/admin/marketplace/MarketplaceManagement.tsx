import React, { useCallback, useEffect, useState } from "react";
import {
  Archive,
  ArrowLeft,
  Check,
  Download,
  Edit3,
  FileText,
  Grid2X2,
  ImagePlus,
  List,
  PackageOpen,
  Plus,
  RefreshCcw,
  Search,
  ShieldCheck,
  Trash2,
  User,
  X,
} from "lucide-react";
import { PageHeader } from "../components/PageHeader";
import { EmptyState } from "../../../../shared/ui/EmptyState";
import {
  createMarketplaceProduct,
  deleteMarketplaceProduct,
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
  const [viewMode, setViewMode] = useState<"list" | "grid">("grid");
  const [thumbnailUrls, setThumbnailUrls] = useState<Record<string, string>>({});
  const [selectedProduct, setSelectedProduct] = useState<MarketplaceProduct | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
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

  const downloadProduct = async () => {
    if (!selectedProduct || isDownloading) return;
    setIsDownloading(true);
    try {
      const url = await getMarketplaceMaterialDownloadUrl(selectedProduct.materialId);
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (caught) {
      notify(
        "error",
        "Download unavailable",
        caught instanceof Error ? caught.message : "The material could not be downloaded.",
      );
    } finally {
      setIsDownloading(false);
    }
  };

  const deleteProduct = async (product = selectedProduct) => {
    if (!product || isDeleting) return;
    const confirmed = window.confirm(
      `Delete "${product.title}" from the marketplace? This removes the listing but keeps the uploaded material.`,
    );
    if (!confirmed) return;

    setIsDeleting(true);
    try {
      await deleteMarketplaceProduct(product.id);
      notify("success", "Marketplace material deleted", `${product.title} was removed.`);
      if (selectedProduct?.id === product.id) setSelectedProduct(null);
      await load();
    } catch (caught) {
      notify(
        "error",
        "Delete failed",
        caught instanceof Error ? caught.message : "The marketplace material could not be deleted.",
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const openEdit = (product: MarketplaceProduct) => {
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
  };

  const detailModal = selectedProduct
    ? (() => {
        const previewUrl =
          thumbnailUrls[selectedProduct.thumbnailMaterialId || ""] || selectedProduct.thumbnailUrl;
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 text-slate-900 backdrop-blur-sm dark:text-white">
            <div className="max-h-[92vh] w-full max-w-6xl overflow-y-auto rounded-2xl bg-white shadow-2xl dark:bg-slate-950">
              <div className="border-b border-slate-200 bg-white px-5 py-4 dark:border-white/10 dark:bg-slate-900/95 sm:px-8">
                <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
                  <div className="flex min-w-0 items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                    <button
                      type="button"
                      onClick={() => setSelectedProduct(null)}
                      className="hover:text-indigo-600 dark:hover:text-white"
                    >
                      Marketplace
                    </button>
                    <span>/</span>
                    <span className="truncate font-semibold text-slate-900 dark:text-white">
                      {selectedProduct.title}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedProduct(null)}
                    className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" /> Back
                  </button>
                </div>
              </div>

              <div className="mx-auto max-w-7xl bg-white px-5 py-8 dark:bg-slate-950 sm:px-8 lg:py-12">
                <div className="mb-8 flex flex-wrap items-center gap-2 text-[10px] font-bold uppercase tracking-wider">
                  <span className="rounded-full bg-indigo-100 px-3 py-1.5 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300">
                    {label(selectedProduct.category)}
                  </span>
                  {selectedProduct.courseDomain && (
                    <span className="rounded-full bg-violet-100 px-3 py-1.5 text-violet-700 dark:bg-violet-500/20 dark:text-violet-300">
                      {selectedProduct.courseDomain}
                    </span>
                  )}
                  <span className="rounded-full bg-emerald-100 px-3 py-1.5 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300">
                    {selectedProduct.free ? "Free resource" : label(selectedProduct.status)}
                  </span>
                </div>

                <h1 className="max-w-4xl text-3xl font-bold leading-tight tracking-tight sm:text-5xl">
                  {selectedProduct.title}
                </h1>

                <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1fr)_330px]">
                  <div>
                    <div className="relative flex aspect-[16/9] items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 shadow-xl dark:border-white/10 dark:bg-slate-900">
                      {previewUrl ? (
                        <img src={previewUrl} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <FileText className="h-16 w-16 text-indigo-300" />
                      )}
                    </div>

                    <section className="mt-8 max-w-3xl">
                      <h2 className="text-xl font-bold">Resource Overview</h2>
                      <p className="mt-3 whitespace-pre-line text-sm leading-7 text-slate-600 dark:text-slate-400">
                        {selectedProduct.description ||
                          selectedProduct.shortDescription ||
                          "This learning resource is ready to support your course preparation."}
                      </p>
                    </section>

                    <section className="mt-8 border-t border-slate-200 pt-6 dark:border-white/10">
                      <h2 className="text-lg font-bold">Resource Information</h2>
                      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                        {[
                          ["Category", label(selectedProduct.category)],
                          [
                            "Subject",
                            selectedProduct.subject || selectedProduct.courseDomain || "General",
                          ],
                          ["Grade", selectedProduct.gradeId ? "Assigned grade" : "All grades"],
                          ["Status", label(selectedProduct.status)],
                        ].map(([heading, value]) => (
                          <div
                            key={heading}
                            className="rounded-xl bg-slate-100 p-4 dark:bg-slate-800"
                          >
                            <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">
                              {heading}
                            </span>
                            <span className="mt-1 block text-sm font-semibold text-slate-900 dark:text-white">
                              {value}
                            </span>
                          </div>
                        ))}
                      </div>
                    </section>
                  </div>

                  <aside className="h-fit rounded-2xl border border-slate-200 bg-slate-50 p-5 shadow-xl dark:border-white/10 dark:bg-slate-900">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      Resource Access
                    </span>
                    <div className="mt-2 text-2xl font-bold text-emerald-400">
                      {selectedProduct.free
                        ? "Free Download"
                        : `${selectedProduct.currency} ${(selectedProduct.finalPrice ?? selectedProduct.price).toFixed(2)}`}
                    </div>

                    <div className="mt-5 flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-100 p-3 dark:border-white/10 dark:bg-slate-800">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-500/20 text-indigo-300">
                        <User className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <span className="block text-[10px] uppercase tracking-wider text-slate-500">
                          Added by
                        </span>
                        <span className="block truncate text-xs font-semibold text-slate-900 dark:text-white">
                          {selectedProduct.materialOwnerName || "Course team"}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => void downloadProduct()}
                      className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-bold text-white hover:bg-indigo-500 disabled:opacity-60"
                      disabled={isDownloading}
                    >
                      <Download className="h-4 w-4" />
                      {isDownloading ? "Preparing download…" : "Download Material"}
                    </button>

                    <div className="mt-3 grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedProduct(null);
                          openEdit(selectedProduct);
                        }}
                        className="inline-flex w-full items-center justify-center rounded-xl border border-slate-200 px-4 py-3 text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white"
                        aria-label="Edit material"
                        title="Edit material"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => void deleteProduct()}
                        disabled={isDeleting}
                        className="inline-flex w-full items-center justify-center rounded-xl border border-rose-200 px-4 py-3 text-rose-600 hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-rose-500/30 dark:text-rose-300 dark:hover:bg-rose-500/10"
                        aria-label="Delete material"
                        title="Delete material"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="mt-5 flex gap-2 border-t border-slate-200 pt-4 text-[11px] leading-5 text-slate-500 dark:border-white/10">
                      <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                      <span>Managed learning material for your tuition platform.</span>
                    </div>
                  </aside>
                </div>
              </div>
            </div>
          </div>
        );
      })()
    : null;

  return (
    <div className="space-y-6 pb-8">
      <PageHeader
        title="Marketplace Management"
        description="Create, classify, price, and publish trusted digital learning resources for students."
        breadcrumbs={[
          { label: "Admin" },
          { label: "Platform Operations" },
          { label: "Marketplace" },
        ]}
        actions={
          <button
            type="button"
            onClick={() => {
              setEditing(null);
              setForm(emptyForm);
              setSelectedFile(null);
              setSelectedThumbnail(null);
              setIsFormOpen(true);
            }}
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white shadow-xs transition-colors hover:bg-indigo-700"
          >
            <Plus className="h-4 w-4" /> New product
          </button>
        }
      />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {[
          {
            label: "Total products",
            value: products.length,
            tone: "text-slate-900 dark:text-white",
            icon: PackageOpen,
          },
          {
            label: "Published",
            value: products.filter((product) => product.status === "PUBLISHED").length,
            tone: "text-emerald-600",
            icon: Check,
          },
          {
            label: "Drafts",
            value: products.filter((product) => product.status === "DRAFT").length,
            tone: "text-amber-600",
            icon: Edit3,
          },
        ].map((metric) => (
          <div
            key={metric.label}
            className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-xs dark:border-slate-800 dark:bg-slate-900"
          >
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              {metric.label}
            </p>
            <p className={`mt-1 text-2xl font-bold ${metric.tone}`}>{metric.value}</p>
            <div className={`rounded-xl bg-slate-100 p-2.5 dark:bg-slate-800 ${metric.tone}`}>
              <metric.icon className="h-4 w-4" />
            </div>
          </div>
        ))}
      </div>

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
            <EmptyState
              compact
              icon={PackageOpen}
              title="No marketplace products"
              description="Upload a learning resource to create the first product in your catalog."
              className="rounded-none border-0"
            />
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
                      ? "group flex flex-col gap-4 rounded-2xl border border-slate-200 p-4 transition-shadow hover:shadow-md dark:border-slate-800"
                      : "grid min-w-[820px] grid-cols-[80px_minmax(260px,1fr)_160px_120px_120px] items-center gap-4 border-b border-slate-100 px-5 py-3.5 last:border-b-0 dark:border-slate-800"
                  }
                >
                  <div
                    className={`relative flex shrink-0 items-center justify-center overflow-hidden rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-300 ${viewMode === "grid" ? "aspect-[16/9] w-full" : "h-16 w-20"}`}
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
                    {viewMode === "grid" && (
                      <>
                        <span className="absolute left-3 top-3 rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-bold text-slate-700 shadow-sm dark:bg-slate-900/90 dark:text-slate-200">
                          {label(product.category)}
                        </span>
                        <span
                          className={`absolute right-3 top-3 rounded-full px-2.5 py-1 text-[10px] font-extrabold shadow-sm ${product.free ? "bg-emerald-500 text-white" : product.discountPercent ? "bg-rose-500 text-white" : "bg-slate-900/80 text-white"}`}
                        >
                          {product.free
                            ? "FREE"
                            : product.discountPercent && product.discountPercent > 0
                              ? `-${product.discountPercent}%`
                              : label(product.status)}
                        </span>
                        <span className="absolute bottom-3 left-3 rounded-md bg-slate-950/75 px-2.5 py-1 text-[10px] font-semibold text-white">
                          {product.courseDomain || product.subject || "Course material"}
                        </span>
                      </>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p
                      className={`${viewMode === "grid" ? "line-clamp-2 text-base leading-snug" : "truncate text-sm"} font-semibold text-slate-900 dark:text-white`}
                    >
                      {product.title}
                    </p>
                    {product.shortDescription && (
                      <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-slate-500">
                        {product.shortDescription}
                      </p>
                    )}
                    <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                      {product.gradeId && <span>Grade material</span>}
                      {product.materialOwnerName && (
                        <span className="inline-flex items-center gap-1.5">
                          <User className="h-3.5 w-3.5 text-slate-400" />
                          <span>By {product.materialOwnerName}</span>
                        </span>
                      )}
                    </div>
                  </div>
                  <div
                    className={`shrink-0 text-left md:text-right ${viewMode === "grid" ? "hidden" : ""}`}
                  >
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
                    className={`${viewMode === "grid" ? "hidden" : "w-fit rounded-full px-2.5 py-1 text-[10px] font-bold"} ${product.status === "PUBLISHED" ? "bg-emerald-50 text-emerald-700" : product.status === "ARCHIVED" ? "bg-slate-100 text-slate-500" : "bg-amber-50 text-amber-700"}`}
                  >
                    {label(product.status)}
                  </span>
                  <div
                    className={`flex items-center gap-2 ${viewMode === "grid" ? "justify-between border-t border-slate-100 pt-3 dark:border-slate-800" : "justify-start md:justify-end"}`}
                  >
                    {viewMode === "grid" && (
                      <div className="text-left">
                        {product.free ? (
                          <span className="text-base font-extrabold text-emerald-600">
                            Free access
                          </span>
                        ) : (
                          <>
                            {product.discountPercent && product.discountPercent > 0 && (
                              <span className="mr-2 text-[11px] text-slate-400 line-through">
                                {product.currency} {product.price.toFixed(2)}
                              </span>
                            )}
                            <span className="text-base font-extrabold text-slate-900 dark:text-white">
                              {product.currency} {(product.finalPrice ?? product.price).toFixed(2)}
                            </span>
                          </>
                        )}
                      </div>
                    )}
                    <button
                      onClick={() =>
                        viewMode === "grid" ? setSelectedProduct(product) : openEdit(product)
                      }
                      className={
                        viewMode === "grid"
                          ? "rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:border-indigo-300 hover:text-indigo-600 dark:border-slate-700 dark:text-slate-300"
                          : "rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-indigo-600"
                      }
                      aria-label={`View details for ${product.title}`}
                    >
                      {viewMode === "grid" ? "Details" : <Edit3 className="h-4 w-4" />}
                    </button>
                    {viewMode === "grid" && (
                      <button
                        type="button"
                        onClick={() => openEdit(product)}
                        className="rounded-xl border border-slate-200 p-2.5 text-slate-600 hover:border-indigo-300 hover:text-indigo-600 dark:border-slate-700 dark:text-slate-300"
                        aria-label={`Edit ${product.title}`}
                        title="Edit material"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => void deleteProduct(product)}
                      disabled={isDeleting}
                      className={
                        viewMode === "grid"
                          ? "rounded-xl border border-rose-200 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-rose-500/30 dark:text-rose-300 dark:hover:bg-rose-500/10"
                          : "rounded-lg p-2 text-rose-400 hover:bg-rose-50 hover:text-rose-600 disabled:opacity-60"
                      }
                      aria-label={`Delete ${product.title}`}
                      title="Delete material"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                    {product.status === "DRAFT" && (
                      <button
                        onClick={() => void changeStatus(product, "PUBLISHED")}
                        className={
                          viewMode === "grid"
                            ? "rounded-xl bg-indigo-600 px-3 py-2 text-xs font-semibold text-white hover:bg-indigo-700"
                            : "rounded-lg p-2 text-emerald-600 hover:bg-emerald-50"
                        }
                        aria-label={`Publish ${product.title}`}
                      >
                        {viewMode === "grid" ? "Publish" : <Check className="h-4 w-4" />}
                      </button>
                    )}
                    {product.status === "PUBLISHED" && (
                      <button
                        onClick={() => void changeStatus(product, "ARCHIVED")}
                        className={
                          viewMode === "grid"
                            ? "rounded-xl bg-indigo-600 px-3 py-2 text-xs font-semibold text-white hover:bg-indigo-700"
                            : "rounded-lg p-2 text-slate-400 hover:bg-slate-100"
                        }
                        aria-label={`Archive ${product.title}`}
                      >
                        {viewMode === "grid" ? "Archive" : <Archive className="h-4 w-4" />}
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
              className="fixed inset-x-4 top-1/2 z-50 mx-auto max-h-[88vh] max-w-2xl -translate-y-1/2 space-y-3 overflow-y-auto rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl animate-in fade-in zoom-in-95 duration-150 dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="flex items-start justify-between gap-4 border-b border-slate-200 pb-3 dark:border-slate-800">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {editing ? "Edit Marketplace Product" : "Create Marketplace Product"}
                  </h3>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    Configure the resource, academic classification, pricing, and publication
                    settings.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={reset}
                  className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-white"
                  aria-label="Close marketplace product form"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              {error && (
                <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700 dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-300">
                  {error}
                </div>
              )}
              <div className="space-y-3 text-xs [&_input]:text-xs [&_input]:py-2 [&_select]:!text-[10px] [&_select]:py-2 [&_option]:!text-[10px] [&_textarea]:text-xs [&_textarea]:py-2">
                <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3 dark:border-slate-800 dark:bg-slate-950/40">
                  <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Resource files
                  </p>
                  <div className="space-y-3">
                    {!editing && (
                      <label className="block font-semibold text-slate-700 dark:text-slate-300">
                        Marketplace file
                        <input
                          type="file"
                          required
                          accept="application/pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.zip,.png,.jpg,.jpeg"
                          onChange={(event) => setSelectedFile(event.target.files?.[0] ?? null)}
                          className="mt-1.5 block w-full rounded-lg border border-dashed border-slate-300 bg-white px-3 py-3 text-xs font-normal dark:border-slate-700 dark:bg-slate-900"
                        />
                        <span className="mt-1 block text-[11px] font-normal text-slate-400">
                          The file is uploaded securely when you create the product.
                        </span>
                      </label>
                    )}
                    <label className="block font-semibold text-slate-700 dark:text-slate-300">
                      Thumbnail image <span className="font-normal text-slate-400">(optional)</span>
                      <div className="mt-1.5 flex items-center gap-3 rounded-lg border border-dashed border-slate-300 bg-white p-3 dark:border-slate-700 dark:bg-slate-900">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-300">
                          <ImagePlus className="h-5 w-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <input
                            type="file"
                            accept="image/png,image/jpeg,image/webp"
                            onChange={(event) =>
                              setSelectedThumbnail(event.target.files?.[0] ?? null)
                            }
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
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
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
              <div className="flex items-center justify-end gap-3 border-t border-slate-200 pt-3 dark:border-slate-800">
                <button
                  type="button"
                  onClick={reset}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700 disabled:opacity-60"
                >
                  {isSaving ? "Saving…" : editing ? "Save changes" : "Create product"}
                </button>
              </div>
            </form>
          </>
        )}
        {detailModal}
      </div>
    </div>
  );
};
