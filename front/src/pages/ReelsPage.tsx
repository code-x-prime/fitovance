import { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { reels as reelsApi } from "@/api/adminService";
import AsyncProductSearch from "@/components/AsyncProductSearch";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Loader2,
  Plus,
  ArrowLeft,
  Trash2,
  Edit,
  Video,
  Upload,
  X,
  Play,
  Search,
  ChevronLeft,
  ChevronRight,
  GripVertical,
  MoreVertical,
  Eye,
  Copy,
} from "lucide-react";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";

// ===================== TYPES =====================

interface Reel {
  id: string;
  videoUrl: string;
  thumbnailUrl?: string;
  productId: string;
  variantId?: string;
  displayOrder: number;
  status: "ACTIVE" | "INACTIVE";
  createdAt: string;
  product?: {
    id: string;
    name: string;
    slug: string;
    images?: { url: string }[];
    variants?: {
      id: string;
      price: number;
      salePrice?: number;
      sku?: string;
    }[];
  };
  variant?: {
    id: string;
    sku?: string;
    attributes?: { attributeValue?: { value: string } }[];
  };
  currentPrice?: number;
  originalPrice?: number;
}

// ===================== SORTABLE ROW =====================

function SortableRow({
  reel,
  isSelected,
  onToggleSelect,
  onToggleStatus,
  onDelete,
  onEdit,
  onPreview,
  onDuplicate,
}: {
  reel: Reel;
  isSelected: boolean;
  onToggleSelect: () => void;
  onToggleStatus: (id: string, current: string) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string) => void;
  onPreview: (reel: Reel) => void;
  onDuplicate: (reel: Reel) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: reel.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : 0,
  };

  return (
    <TableRow
      ref={setNodeRef}
      style={style}
      className={`border-[var(--border-color)] hover:bg-[var(--bg-secondary)]/50 ${isDragging ? "bg-[var(--bg-secondary)] shadow-lg" : ""}`}
    >
      <TableCell>
        <div className="flex items-center gap-2">
          <button
            className="cursor-grab active:cursor-grabbing text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            {...attributes}
            {...listeners}
          >
            <GripVertical className="h-4 w-4" />
          </button>
          <input
            type="checkbox"
            checked={isSelected}
            onChange={onToggleSelect}
            className="h-4 w-4 rounded border-[var(--border-color)] accent-[var(--accent)]"
          />
        </div>
      </TableCell>
      <TableCell>
        <span className="font-mono text-xs text-[var(--text-secondary)]">
          #{reel.displayOrder}
        </span>
      </TableCell>
      <TableCell>
        <div className="relative w-12 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
          {reel.thumbnailUrl ? (
            <img
              src={reel.thumbnailUrl}
              alt=""
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : reel.videoUrl ? (
            <video
              src={reel.videoUrl}
              className="w-full h-full object-cover"
              muted
              preload="metadata"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Video className="h-4 w-4 text-gray-400" />
            </div>
          )}
          <div className="absolute inset-0 flex items-center justify-center">
            <Play className="h-3 w-3 text-white drop-shadow" />
          </div>
        </div>
      </TableCell>
      <TableCell>
        <div>
          <p className="font-medium text-sm truncate max-w-[200px]">
            {reel.product?.name || "No product"}
          </p>
          {reel.variant && (
            <p className="text-xs text-[var(--text-secondary)]">
              {reel.variant.attributes
                ?.map((a) => a.attributeValue?.value)
                .filter(Boolean)
                .join(" / ") || reel.variant.sku}
            </p>
          )}
        </div>
      </TableCell>
      <TableCell>
        <span className="text-xs">
          {reel.product?.variants?.length ? "Variable" : "Simple"}
        </span>
      </TableCell>
      <TableCell>
        <Switch
          checked={reel.status === "ACTIVE"}
          onCheckedChange={() => onToggleStatus(reel.id, reel.status)}
        />
      </TableCell>
      <TableCell>
        <span className="text-xs text-[var(--text-secondary)]">
          {new Date(reel.createdAt).toLocaleDateString()}
        </span>
      </TableCell>
      <TableCell>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="bg-[var(--bg-card)] border-[var(--border-color)]"
          >
            <DropdownMenuItem onClick={() => onEdit(reel.id)}>
              <Edit className="mr-2 h-4 w-4" /> Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onPreview(reel)}>
              <Eye className="mr-2 h-4 w-4" /> Preview
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDuplicate(reel)}>
              <Copy className="mr-2 h-4 w-4" /> Duplicate
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-[var(--destructive)]"
              onClick={() => onDelete(reel.id)}
            >
              <Trash2 className="mr-2 h-4 w-4" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
}

// ===================== MAIN PAGE =====================

export default function ReelsPage() {
  const { id } = useParams();
  const location = useLocation();
  const isNew = location.pathname.includes("/new");
  const isEdit = !!id;

  if (isNew) return <ReelForm mode="create" />;
  if (isEdit) return <ReelForm mode="edit" reelId={id} />;
  return <ReelsList />;
}

// ===================== REELS LIST =====================

function ReelsList() {
  const navigate = useNavigate();

  const [reels, setReels] = useState<Reel[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 10;

  // Selection
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Delete confirmation
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Preview
  const [previewReel, setPreviewReel] = useState<Reel | null>(null);

  // Fetch reels
  const fetchReels = async () => {
    try {
        setIsLoading(true);
        const res = await reelsApi.getReels();
        if (res.data.success) {
          setReels(res.data.data?.reels || []);
        }
      } catch {
        toast.error("Failed to load reels");
      } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReels();
  }, []);

  // Filtered reels
  const filteredReels = reels.filter((reel) => {
    if (statusFilter !== "all" && reel.status !== statusFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const name = reel.product?.name?.toLowerCase() || "";
      const sku = reel.variant?.sku?.toLowerCase() || "";
      if (!name.includes(q) && !sku.includes(q)) return false;
    }
    return true;
  });

  // Pagination
  const totalPages = Math.ceil(filteredReels.length / PAGE_SIZE);
  const paginatedReels = filteredReels.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  // Selection
  const allVisibleSelected =
    paginatedReels.length > 0 &&
    paginatedReels.every((r) => selectedIds.has(r.id));
  const someSelected = selectedIds.size > 0;

  const toggleAll = () => {
    if (allVisibleSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(paginatedReels.map((r) => r.id)));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Toggle status
  const handleToggleStatus = async (reelId: string, currentStatus: string) => {
    const newStatus = currentStatus === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    try {
      const formData = new FormData();
      formData.append("status", newStatus);
      await reelsApi.updateReel(reelId, formData);
      setReels((prev) =>
        prev.map((r) =>
          r.id === reelId ? { ...r, status: newStatus as "ACTIVE" | "INACTIVE" } : r
        )
      );
      toast.success(`Reel ${newStatus === "ACTIVE" ? "activated" : "deactivated"}`);
    } catch {
      toast.error("Failed to update status");
    }
  };

  // Delete
  const handleDelete = async (reelId: string) => {
    setIsDeleting(true);
    try {
      await reelsApi.deleteReel(reelId);
      toast.success("Reel deleted");
      setReels((prev) => prev.filter((r) => r.id !== reelId));
      setDeleteTarget(null);
    } catch {
      toast.error("Failed to delete");
    } finally {
      setIsDeleting(false);
    }
  };

  // Bulk delete
  const handleBulkDelete = async () => {
    const ids = Array.from(selectedIds);
    setIsDeleting(true);
    try {
      await reelsApi.bulkDelete(ids);
      toast.success(`${ids.length} reel(s) deleted`);
      setReels((prev) => prev.filter((r) => !selectedIds.has(r.id)));
      setSelectedIds(new Set());
      setBulkDeleteOpen(false);
    } catch {
      toast.error("Failed to delete");
    } finally {
      setIsDeleting(false);
    }
  };

  // Bulk status
  const handleBulkStatus = async (status: "ACTIVE" | "INACTIVE") => {
    const ids = Array.from(selectedIds);
    try {
      await reelsApi.bulkUpdateStatus(ids, status);
      setReels((prev) =>
        prev.map((r) =>
          ids.includes(r.id) ? { ...r, status } : r
        )
      );
      setSelectedIds(new Set());
      toast.success(`${ids.length} reel(s) ${status === "ACTIVE" ? "activated" : "deactivated"}`);
    } catch {
      toast.error("Failed to update");
    }
  };

  // Drag & Drop reorder
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = async (event: any) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = filteredReels.findIndex((r) => r.id === active.id);
    const newIndex = filteredReels.findIndex((r) => r.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = arrayMove(filteredReels, oldIndex, newIndex);
    setReels(reordered);

    try {
      await reelsApi.reorderReels(reordered.map((r) => r.id));
      toast.success("Order updated");
    } catch {
      toast.error("Failed to save order");
      fetchReels();
    }
  };

  // Duplicate
  const handleDuplicate = async (reel: Reel) => {
    try {
      const res = await reelsApi.getReelById(reel.id);
      const data = res.data.data?.reel;
      if (!data) return;

      const formData = new FormData();
      formData.append("productId", data.productId);
      if (data.variantId) formData.append("variantId", data.variantId);
      formData.append("displayOrder", "0");
      formData.append("status", data.status);

      // Fetch the video blob and append
      if (data.videoUrl) {
        const videoRes = await fetch(data.videoUrl);
        const blob = await videoRes.blob();
        formData.append("video", blob, "reel.mp4");
      }
      if (data.thumbnailUrl) {
        const thumbRes = await fetch(data.thumbnailUrl);
        const blob = await thumbRes.blob();
        formData.append("thumbnail", blob, "thumb.jpg");
      }

      await reelsApi.createReel(formData);
      toast.success("Reel duplicated");
      fetchReels();
    } catch {
      toast.error("Failed to duplicate");
    }
  };

  // DnD IDs
  const dndIds = filteredReels.map((r) => r.id);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Watch & Buy Reels</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            Manage video reels on the homepage
          </p>
        </div>
        <Button onClick={() => navigate("/reels/new")} className="gap-2">
          <Plus className="h-4 w-4" /> Create Reel
        </Button>
      </div>

      <div className="h-px bg-[var(--border-color)]" />

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-secondary)]" />
            <Input
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by product name or SKU..."
              className="pl-9"
            />
          </div>
          <Select
            value={statusFilter}
            onValueChange={(v) => {
              setStatusFilter(v);
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="ACTIVE">Active</SelectItem>
              <SelectItem value="INACTIVE">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Bulk actions */}
      {someSelected && (
        <Card className="p-3 flex items-center gap-3 bg-[var(--bg-secondary)]">
          <span className="text-sm font-medium">
            {selectedIds.size} selected
          </span>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleBulkStatus("ACTIVE")}
          >
            Enable
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleBulkStatus("INACTIVE")}
          >
            Disable
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={() => setBulkDeleteOpen(true)}
          >
            Delete
          </Button>
        </Card>
      )}

      {/* Table */}
      <Card>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-[var(--border-color)] hover:bg-transparent bg-[var(--bg-secondary)]/60">
                <TableHead className="w-[100px]">
                  <input
                    type="checkbox"
                    checked={allVisibleSelected}
                    onChange={toggleAll}
                    className="h-4 w-4 rounded border-[var(--border-color)] accent-[var(--accent)]"
                  />
                </TableHead>
                <TableHead className="text-xs font-semibold uppercase">
                  Order
                </TableHead>
                <TableHead className="text-xs font-semibold uppercase">
                  Thumbnail
                </TableHead>
                <TableHead className="text-xs font-semibold uppercase">
                  Product
                </TableHead>
                <TableHead className="text-xs font-semibold uppercase">
                  Type
                </TableHead>
                <TableHead className="text-xs font-semibold uppercase">
                  Status
                </TableHead>
                <TableHead className="text-xs font-semibold uppercase">
                  Created
                </TableHead>
                <TableHead className="text-xs font-semibold uppercase w-[50px]">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                [...Array(5)].map((_, i) => (
                  <TableRow key={i} className="border-[var(--border-color)]">
                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-8" /></TableCell>
                    <TableCell><Skeleton className="h-16 w-12 rounded-lg" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-12 rounded-full" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-8 rounded" /></TableCell>
                  </TableRow>
                ))
              ) : filteredReels.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-12">
                    <Video className="h-12 w-12 mx-auto text-[var(--text-secondary)] mb-4" />
                    <p className="font-semibold text-lg mb-2">No reels found</p>
                    <p className="text-sm text-[var(--text-secondary)] mb-4">
                      {searchQuery || statusFilter !== "all"
                        ? "Try adjusting your filters"
                        : "Create your first reel to show on the homepage"}
                    </p>
                    {!searchQuery && statusFilter === "all" && (
                      <Button onClick={() => navigate("/reels/new")} className="gap-2">
                        <Plus className="h-4 w-4" /> Create Reel
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ) : (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={dndIds}
                    strategy={verticalListSortingStrategy}
                  >
                    {paginatedReels.map((reel) => (
                      <SortableRow
                        key={reel.id}
                        reel={reel}
                        isSelected={selectedIds.has(reel.id)}
                        onToggleSelect={() => toggleSelect(reel.id)}
                        onToggleStatus={handleToggleStatus}
                        onDelete={(id) => setDeleteTarget(id)}
                        onEdit={(id) => navigate(`/reels/${id}`)}
                        onPreview={setPreviewReel}
                        onDuplicate={handleDuplicate}
                      />
                    ))}
                  </SortableContext>
                </DndContext>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-[var(--border-color)] px-4 py-3">
            <span className="text-sm text-[var(--text-secondary)]">
              Page {currentPage} of {totalPages}
            </span>
            <div className="flex gap-1">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                const start = Math.max(
                  1,
                  Math.min(currentPage - 2, totalPages - 4)
                );
                const page = start + i;
                if (page > totalPages) return null;
                return (
                  <Button
                    key={page}
                    variant={page === currentPage ? "default" : "outline"}
                    size="icon"
                    className="h-8 w-8 text-xs"
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </Button>
                );
              })}
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                disabled={currentPage === totalPages}
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Delete confirmation */}
      <Dialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <DialogContent className="bg-[var(--bg-card)] border-[var(--border-color)]">
          <DialogHeader>
            <DialogTitle>Delete Reel</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this reel? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteTarget(null)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteTarget && handleDelete(deleteTarget)}
              disabled={isDeleting}
            >
              {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk delete confirmation */}
      <Dialog open={bulkDeleteOpen} onOpenChange={setBulkDeleteOpen}>
        <DialogContent className="bg-[var(--bg-card)] border-[var(--border-color)]">
          <DialogHeader>
            <DialogTitle>Delete {selectedIds.size} Reel(s)</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {selectedIds.size} reel(s)? This
              action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setBulkDeleteOpen(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleBulkDelete}
              disabled={isDeleting}
            >
              {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete All
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Preview modal */}
      <Dialog
        open={!!previewReel}
        onOpenChange={(open) => {
          if (!open) setPreviewReel(null);
        }}
      >
        <DialogContent className="bg-[var(--bg-card)] border-[var(--border-color)] max-w-sm w-[90vw] p-0 overflow-hidden max-h-[90vh]">
          {previewReel && (
            <div className="relative">
              <button
                onClick={() => setPreviewReel(null)}
                className="absolute top-2 right-2 z-10 w-8 h-8 rounded-full bg-black/60 flex items-center justify-center text-white hover:bg-black/80 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
              <video
                src={previewReel.videoUrl}
                className="w-full max-h-[60vh] object-contain bg-black"
                controls
                autoPlay
              />
              <div className="p-4">
                <p className="font-medium truncate">{previewReel.product?.name}</p>
                <p className="text-sm text-[var(--text-secondary)]">
                  Order: #{previewReel.displayOrder} · Status: {previewReel.status}
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ===================== REEL FORM =====================

interface ProductData {
  id: string;
  name: string;
  slug: string;
  images?: { url: string }[];
  variants?: {
    id: string;
    price: number;
    salePrice?: number;
    sku?: string;
    attributes?: { attributeValue?: { value: string } }[];
  }[];
}

function ReelForm({
  mode,
  reelId,
}: {
  mode: "create" | "edit";
  reelId?: string;
}) {
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(mode === "edit");
  const [isSaving, setIsSaving] = useState(false);

  // Video
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [videoMeta, setVideoMeta] = useState<{
    duration: number;
    size: number;
  } | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [existingVideoUrl, setExistingVideoUrl] = useState<string | null>(null);

  // Thumbnail
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [existingThumbUrl, setExistingThumbUrl] = useState<string | null>(null);

  // Product
  const [productSearch, setProductSearch] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<ProductData | null>(
    null
  );
  const [variantId, setVariantId] = useState("");

  // Settings
  const [displayOrder, setDisplayOrder] = useState("0");
  const [status, setStatus] = useState<"ACTIVE" | "INACTIVE">("ACTIVE");

  // Load existing reel
  useEffect(() => {
    if (mode === "edit" && reelId) {
      reelsApi
        .getReelById(reelId)
        .then((res) => {
          const reel = res.data.data?.reel;
          if (reel) {
            setDisplayOrder(String(reel.displayOrder));
            setStatus(reel.status);
            setExistingVideoUrl(reel.videoUrl);
            setExistingThumbUrl(reel.thumbnailUrl);
            if (reel.product) {
              setSelectedProduct(reel.product);
              setProductSearch(reel.product.name);
            }
            if (reel.variantId) {
              setVariantId(reel.variantId);
            }
          }
        })
        .catch(() => toast.error("Failed to load reel"))
        .finally(() => setIsLoading(false));
    }
  }, [mode, reelId]);

  // Video dropzone
  const {
    getRootProps: getVideoRootProps,
    getInputProps: getVideoInputProps,
    isDragActive: isVideoDragActive,
  } = useDropzone({
    accept: {
      "video/mp4": [".mp4"],
      "video/quicktime": [".mov"],
      "video/webm": [".webm"],
    },
    multiple: false,
    maxSize: 100 * 1024 * 1024,
    onDrop: (acceptedFiles) => {
      const file = acceptedFiles[0];
      if (!file) return;
      setVideoFile(file);
      setVideoPreview(URL.createObjectURL(file));
      // Get metadata
      const video = document.createElement("video");
      video.preload = "metadata";
      video.onloadedmetadata = () => {
        setVideoMeta({
          duration: video.duration,
          size: file.size,
        });
      };
      video.src = URL.createObjectURL(file);
    },
    onDropRejected: (rejections) => {
      const err = rejections[0]?.errors[0];
      if (err?.code === "file-too-large") {
        toast.error("Video must be under 100MB");
      } else {
        toast.error("Only MP4, MOV, and WEBM are allowed");
      }
    },
  });

  // Thumbnail dropzone
  const {
    getRootProps: getThumbRootProps,
    getInputProps: getThumbInputProps,
    isDragActive: isThumbDragActive,
  } = useDropzone({
    accept: { "image/*": [".png", ".jpg", ".jpeg", ".webp"] },
    multiple: false,
    onDrop: (acceptedFiles) => {
      const file = acceptedFiles[0];
      if (!file) return;
      setThumbnailFile(file);
      setThumbnailPreview(URL.createObjectURL(file));
    },
  });

  const formatDuration = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) {
      toast.error("Please select a product");
      return;
    }
    if (mode === "create" && !videoFile) {
      toast.error("Please upload a video");
      return;
    }

    setIsSaving(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append("productId", selectedProduct.id);
      if (variantId) formData.append("variantId", variantId);
      formData.append("displayOrder", displayOrder);
      formData.append("status", status);
      if (videoFile) formData.append("video", videoFile);
      if (thumbnailFile) formData.append("thumbnail", thumbnailFile);

      // Simulate progress for UX (actual upload is one request)
      setIsUploading(true);
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => Math.min(prev + 10, 90));
      }, 200);

      if (mode === "create") {
        await reelsApi.createReel(formData);
      } else {
        await reelsApi.updateReel(reelId!, formData);
      }

      clearInterval(progressInterval);
      setUploadProgress(100);

      toast.success(mode === "create" ? "Reel created" : "Reel updated");
      navigate("/reels");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to save");
    } finally {
      setIsSaving(false);
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center py-10">
        <Loader2 className="h-10 w-10 animate-spin text-[var(--accent)]" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate("/reels")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">
            {mode === "create" ? "Create Reel" : "Edit Reel"}
          </h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            {mode === "create"
              ? "Upload a video and link it to a product"
              : "Update reel details"}
          </p>
        </div>
      </div>

      <div className="h-px bg-[var(--border-color)]" />

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Video Upload */}
        <Card className="p-6 space-y-4">
          <Label className="text-base font-semibold">
            Video {mode === "create" && <span className="text-destructive">*</span>}
          </Label>

          {existingVideoUrl && !videoFile ? (
            <div className="relative">
              <video
                src={existingVideoUrl}
                className="w-full max-h-80 rounded-lg bg-black"
                controls
              />
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="absolute top-2 right-2"
                onClick={() => {
                  setExistingVideoUrl(null);
                  setVideoFile(null);
                }}
              >
                <X className="h-3 w-3 mr-1" /> Replace
              </Button>
            </div>
          ) : videoPreview ? (
            <div className="relative">
              <video
                src={videoPreview}
                className="w-full max-h-80 rounded-lg bg-black"
                controls
              />
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="absolute top-2 right-2"
                onClick={() => {
                  setVideoFile(null);
                  setVideoPreview(null);
                  setVideoMeta(null);
                }}
              >
                <X className="h-3 w-3 mr-1" /> Remove
              </Button>
              {videoMeta && (
                <div className="absolute bottom-2 left-2 flex gap-2">
                  <Badge variant="secondary" className="bg-black/60 text-white border-0">
                    {formatDuration(videoMeta.duration)}
                  </Badge>
                  <Badge variant="secondary" className="bg-black/60 text-white border-0">
                    {formatSize(videoMeta.size)}
                  </Badge>
                </div>
              )}
            </div>
          ) : (
            <div
              {...getVideoRootProps()}
              className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all ${
                isVideoDragActive
                  ? "border-[var(--accent)] bg-[var(--accent)]/5"
                  : "border-[var(--border-color)] hover:border-[var(--accent)] hover:bg-[var(--bg-secondary)]"
              }`}
            >
              <input {...getVideoInputProps()} />
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[var(--bg-secondary)] mb-4">
                <Upload className="h-8 w-8 text-[var(--text-secondary)]" />
              </div>
              <p className="text-sm font-medium mb-1">
                {isVideoDragActive
                  ? "Drop your video here"
                  : "Drag & drop or click to upload"}
              </p>
              <p className="text-xs text-[var(--text-secondary)]">
                MP4, MOV, or WEBM. Max 100MB.
              </p>
            </div>
          )}

          {/* Upload progress */}
          {isUploading && (
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-[var(--text-secondary)]">
                <span>Uploading...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="h-2 bg-[var(--bg-secondary)] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[var(--accent)] transition-all rounded-full"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}
        </Card>

        {/* Thumbnail */}
        <Card className="p-6 space-y-4">
          <Label className="text-base font-semibold">Thumbnail (optional)</Label>
          <p className="text-xs text-[var(--text-secondary)]">
            Custom thumbnail for the reel card. If empty, auto-generated from video.
          </p>

          <div
            {...getThumbRootProps()}
            className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all w-48 ${
              isThumbDragActive
                ? "border-[var(--accent)] bg-[var(--accent)]/5"
                : "border-[var(--border-color)] hover:border-[var(--accent)]"
            }`}
          >
            <input {...getThumbInputProps()} />
            {thumbnailPreview || existingThumbUrl ? (
              <div className="relative">
                <img
                  src={thumbnailPreview || existingThumbUrl || ""}
                  alt="Thumbnail"
                  className="w-full h-24 object-cover rounded"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute -top-2 -right-2 h-5 w-5"
                  onClick={(e) => {
                    e.stopPropagation();
                    setThumbnailFile(null);
                    setThumbnailPreview(null);
                    setExistingThumbUrl(null);
                  }}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ) : (
              <div className="space-y-1">
                <Upload className="h-5 w-5 mx-auto text-[var(--text-secondary)]" />
                <p className="text-xs text-[var(--text-secondary)]">Upload</p>
              </div>
            )}
          </div>
        </Card>

        {/* Product Selection */}
        <Card className="p-6 space-y-4">
          <Label className="text-base font-semibold">
            Product <span className="text-destructive">*</span>
          </Label>

          <AsyncProductSearch
            value={productSearch}
            onChange={setProductSearch}
            onSelect={(product) => {
              setSelectedProduct(product);
              setProductSearch(product.name);
              setVariantId("");
            }}
            selectedProduct={selectedProduct}
            onClear={() => {
              setSelectedProduct(null);
              setProductSearch("");
              setVariantId("");
            }}
            required
          />

          {/* Variant selector */}
          {selectedProduct && selectedProduct.variants && selectedProduct.variants.length > 1 && (
            <div className="space-y-2">
              <Label>Variant (optional)</Label>
              <div className="border border-[var(--border-color)] rounded-lg max-h-48 overflow-y-auto">
                <button
                  type="button"
                  className={`w-full flex items-center justify-between px-3 py-2.5 text-left text-sm hover:bg-[var(--bg-secondary)] transition-colors ${
                    !variantId ? "bg-[var(--bg-secondary)]" : ""
                  }`}
                  onClick={() => setVariantId("")}
                >
                  <span className="text-[var(--text-secondary)]">
                    Use default (first variant)
                  </span>
                </button>
                {selectedProduct.variants.map((v) => (
                  <button
                    key={v.id}
                    type="button"
                    className={`w-full flex items-center justify-between px-3 py-2.5 text-left text-sm hover:bg-[var(--bg-secondary)] transition-colors border-t border-[var(--border-color)] ${
                      variantId === v.id ? "bg-[var(--bg-secondary)]" : ""
                    }`}
                    onClick={() => setVariantId(v.id)}
                  >
                    <span>
                      {v.sku || v.id}
                      {v.attributes
                        ?.map((a) => a.attributeValue?.value)
                        .filter(Boolean)
                        .join(" / ")}
                    </span>
                    <span className="text-[var(--text-secondary)] font-medium">
                      ₹{v.salePrice || v.price}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </Card>

        {/* Display Order & Status */}
        <Card className="p-6 space-y-4">
          <Label className="text-base font-semibold">Settings</Label>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Display Order</Label>
              <Input
                type="number"
                min="0"
                value={displayOrder}
                onChange={(e) => setDisplayOrder(e.target.value)}
                placeholder="0"
              />
              <p className="text-xs text-[var(--text-secondary)]">
                Position on homepage. Lower = first. Auto-shifts on save.
              </p>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <div className="flex items-center gap-3 pt-1">
                <Switch
                  checked={status === "ACTIVE"}
                  onCheckedChange={(checked) =>
                    setStatus(checked ? "ACTIVE" : "INACTIVE")
                  }
                />
                <span className="text-sm">
                  {status === "ACTIVE" ? "Active" : "Inactive"}
                </span>
              </div>
            </div>
          </div>
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/reels")}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSaving}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {mode === "create" ? "Create Reel" : "Update Reel"}
          </Button>
        </div>
      </form>
    </div>
  );
}
