import { useState, useEffect, useCallback, useMemo } from "react";
import { menus, categories } from "@/api/adminService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Plus,
  Trash2,
  Edit,
  ChevronDown,
  ChevronRight,
  GripVertical,
  Search,
  Layers,
  Link2,
  ImageIcon,
  Copy,
  Eye,
  EyeOff,
  PanelRightOpen,
  PanelRightClose,
  X,
  LayoutGrid,
  Columns3,
  List,
  Image as ImageIconLucide,
} from "lucide-react";

// ----------------------------------------------------
// SORTABLE WRAPPER
// ----------------------------------------------------
function SortableItem({
  id,
  children,
  className,
}: {
  id: string;
  children: React.ReactNode;
  className?: string;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
    opacity: isDragging ? 0.8 : undefined,
  };

  return (
    <div ref={setNodeRef} style={style} className={className}>
      <div className="flex items-center">
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing p-1 text-gray-300 hover:text-gray-500 shrink-0"
        >
          <GripVertical className="h-4 w-4" />
        </button>
        {children}
      </div>
    </div>
  );
}

// ----------------------------------------------------
// TYPE DEFINITIONS
// ----------------------------------------------------
interface NavLink {
  id: string;
  label: string;
  url: string;
  image?: string | null;
  badge?: string | null;
  order: number;
  columnId: string;
}

interface NavColumn {
  id: string;
  title: string;
  order: number;
  categoryId?: string | null;
  category?: { id: string; name: string; slug: string } | null;
  links: NavLink[];
  navbarItemId: string;
}

interface NavItem {
  id: string;
  label: string;
  slug?: string | null;
  order: number;
  isActive: boolean;
  layout: string;
  bannerImage?: string | null;
  bannerTitle?: string | null;
  bannerSubtitle?: string | null;
  bannerLink?: string | null;
  columns: NavColumn[];
}

// ----------------------------------------------------
// LAYOUT ICONS
// ----------------------------------------------------
const layoutIcons: Record<string, React.ReactNode> = {
  SIMPLE: <List className="h-3.5 w-3.5" />,
  COLUMNS_WITH_BANNER: <Columns3 className="h-3.5 w-3.5" />,
  SHOP_TABS: <LayoutGrid className="h-3.5 w-3.5" />,
  IMAGE_GRID: <ImageIconLucide className="h-3.5 w-3.5" />,
};

const layoutLabels: Record<string, string> = {
  SIMPLE: "Simple Link",
  COLUMNS_WITH_BANNER: "Mega Menu + Banner",
  SHOP_TABS: "Category Tabs",
  IMAGE_GRID: "Image Grid",
};

// ----------------------------------------------------
// MAIN COMPONENT
// ----------------------------------------------------
export default function NavigationPage() {
  const [navbarItems, setNavbarItems] = useState<NavItem[]>([]);
  const [categoriesList, setCategoriesList] = useState<{ id: string; name: string; slug: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [panelOpen, setPanelOpen] = useState(true);

  // Dialog states
  const [isItemDialogOpen, setIsItemDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<NavItem | null>(null);
  const [isColDialogOpen, setIsColDialogOpen] = useState(false);
  const [editingCol, setEditingCol] = useState<NavColumn | null>(null);
  const [activeItemForCol, setActiveItemForCol] = useState<NavItem | null>(null);
  const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false);
  const [editingLink, setEditingLink] = useState<NavLink | null>(null);
  const [activeColForLink, setActiveColForLink] = useState<NavColumn | null>(null);

  // Form states
  const [itemForm, setItemForm] = useState({
    label: "",
    slug: "",
    order: "0",
    isActive: true,
    layout: "COLUMNS_WITH_BANNER",
    bannerTitle: "",
    bannerSubtitle: "",
    bannerLink: "",
  });
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [colForm, setColForm] = useState({ title: "", order: "0", categoryId: "" });
  const [linkForm, setLinkForm] = useState({ label: "", url: "", badge: "", order: "0" });
  const [linkImageFile, setLinkImageFile] = useState<File | null>(null);
  const [linkImagePreview, setLinkImagePreview] = useState<string | null>(null);

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  // ----------------------------------------------------
  // DATA FETCHING
  // ----------------------------------------------------
  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [menuRes, catRes] = await Promise.all([
        menus.getNavbarItems(),
        categories.getCategories(),
      ]);
      if (menuRes.data.success) {
        setNavbarItems(menuRes.data.data?.navbarItems || []);
      }
      if (catRes.data.success) {
        setCategoriesList(catRes.data.data?.categories || []);
      }
    } catch {
      setError("Failed to load navigation data.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ----------------------------------------------------
  // FILTERED ITEMS
  // ----------------------------------------------------
  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return navbarItems;
    const q = searchQuery.toLowerCase();
    return navbarItems.filter(
      (item) =>
        item.label.toLowerCase().includes(q) ||
        item.columns.some(
          (col) =>
            col.title.toLowerCase().includes(q) ||
            col.links.some((lnk) => lnk.label.toLowerCase().includes(q))
        )
    );
  }, [navbarItems, searchQuery]);

  // ----------------------------------------------------
  // EXPAND / COLLAPSE
  // ----------------------------------------------------
  const toggleExpand = (id: string) => {
    setExpandedItems((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const expandAll = () => {
    const all: Record<string, boolean> = {};
    navbarItems.forEach((item) => (all[item.id] = true));
    setExpandedItems(all);
  };

  const collapseAll = () => setExpandedItems({});

  // ----------------------------------------------------
  // REORDER ITEMS (DnD)
  // ----------------------------------------------------
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = navbarItems.findIndex((i) => i.id === active.id);
    const newIndex = navbarItems.findIndex((i) => i.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = arrayMove(navbarItems, oldIndex, newIndex);
    setNavbarItems(reordered);

    // Persist order
    try {
      for (let i = 0; i < reordered.length; i++) {
        const item = reordered[i];
        if (item.order !== i) {
          const fd = new FormData();
          fd.append("order", String(i));
          await menus.updateNavbarItem(item.id, fd);
        }
      }
    } catch {
      toast.error("Failed to save order");
      fetchData();
    }
  };

  // ----------------------------------------------------
  // ITEM CRUD
  // ----------------------------------------------------
  const openItemDialog = (item?: NavItem) => {
    if (item) {
      setEditingItem(item);
      setItemForm({
        label: item.label,
        slug: item.slug || "",
        order: String(item.order),
        isActive: item.isActive,
        layout: item.layout,
        bannerTitle: item.bannerTitle || "",
        bannerSubtitle: item.bannerSubtitle || "",
        bannerLink: item.bannerLink || "",
      });
      setBannerPreview(item.bannerImage || null);
    } else {
      setEditingItem(null);
      setItemForm({
        label: "",
        slug: "",
        order: String(navbarItems.length),
        isActive: true,
        layout: "COLUMNS_WITH_BANNER",
        bannerTitle: "",
        bannerSubtitle: "",
        bannerLink: "",
      });
      setBannerPreview(null);
    }
    setBannerFile(null);
    setIsItemDialogOpen(true);
  };

  const handleItemSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemForm.label.trim()) return toast.error("Label is required");
    try {
      const fd = new FormData();
      fd.append("label", itemForm.label);
      fd.append("slug", itemForm.slug);
      fd.append("order", itemForm.order);
      fd.append("isActive", String(itemForm.isActive));
      fd.append("layout", itemForm.layout);
      fd.append("bannerTitle", itemForm.bannerTitle);
      fd.append("bannerSubtitle", itemForm.bannerSubtitle);
      fd.append("bannerLink", itemForm.bannerLink);
      if (bannerFile) fd.append("bannerImage", bannerFile);

      const res = editingItem
        ? await menus.updateNavbarItem(editingItem.id, fd)
        : await menus.createNavbarItem(fd);

      if (res.data.success) {
        toast.success(editingItem ? "Menu updated" : "Menu created");
        setIsItemDialogOpen(false);
        fetchData();
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error saving";
      toast.error(message);
    }
  };

  const handleDeleteItem = async (id: string) => {
    if (!confirm("Delete this menu and all its columns/links?")) return;
    try {
      const res = await menus.deleteNavbarItem(id);
      if (res.data.success) {
        toast.success("Menu deleted");
        if (selectedItemId === id) setSelectedItemId(null);
        fetchData();
      }
    } catch {
      toast.error("Error deleting");
    }
  };

  const handleToggleActive = async (item: NavItem) => {
    try {
      const fd = new FormData();
      fd.append("isActive", String(!item.isActive));
      await menus.updateNavbarItem(item.id, fd);
      toast.success(item.isActive ? "Menu hidden" : "Menu visible");
      fetchData();
    } catch {
      toast.error("Error toggling visibility");
    }
  };

  const handleDuplicate = async (item: NavItem) => {
    try {
      const fd = new FormData();
      fd.append("label", `${item.label} (Copy)`);
      fd.append("order", String(navbarItems.length));
      fd.append("isActive", "false");
      fd.append("layout", item.layout);
      const res = await menus.createNavbarItem(fd);
      if (res.data.success) {
        toast.success("Menu duplicated");
        fetchData();
      }
    } catch {
      toast.error("Error duplicating");
    }
  };

  // ----------------------------------------------------
  // COLUMN CRUD
  // ----------------------------------------------------
  const openColDialog = (navItem: NavItem, col?: NavColumn) => {
    setActiveItemForCol(navItem);
    if (col) {
      setEditingCol(col);
      setColForm({ title: col.title, order: String(col.order), categoryId: col.categoryId || "" });
    } else {
      setEditingCol(null);
      setColForm({ title: "", order: String(col?.links?.length || 0), categoryId: "" });
    }
    setIsColDialogOpen(true);
  };

  const handleColSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!colForm.title.trim()) return toast.error("Title is required");
    try {
      const data = {
        title: colForm.title,
        order: parseInt(colForm.order) || 0,
        categoryId: colForm.categoryId || undefined,
      };
      const res = editingCol
        ? await menus.updateColumn(activeItemForCol!.id, editingCol.id, data)
        : await menus.createColumn(activeItemForCol!.id, data);
      if (res.data.success) {
        toast.success(editingCol ? "Column updated" : "Column created");
        setIsColDialogOpen(false);
        fetchData();
      }
    } catch {
      toast.error("Error saving column");
    }
  };

  const handleDeleteCol = async (navItemId: string, colId: string) => {
    if (!confirm("Delete this column and its links?")) return;
    try {
      const res = await menus.deleteColumn(navItemId, colId);
      if (res.data.success) {
        toast.success("Column deleted");
        fetchData();
      }
    } catch {
      toast.error("Error deleting");
    }
  };

  // ----------------------------------------------------
  // LINK CRUD
  // ----------------------------------------------------
  const openLinkDialog = (col: NavColumn, link?: NavLink) => {
    setActiveColForLink(col);
    if (link) {
      setEditingLink(link);
      setLinkForm({ label: link.label, url: link.url, badge: link.badge || "", order: String(link.order) });
      setLinkImagePreview(link.image || null);
    } else {
      setEditingLink(null);
      setLinkForm({ label: "", url: "", badge: "", order: String(col.links?.length || 0) });
      setLinkImagePreview(null);
    }
    setLinkImageFile(null);
    setIsLinkDialogOpen(true);
  };

  const handleLinkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!linkForm.label.trim() || !linkForm.url.trim()) return toast.error("Label and URL required");
    try {
      const fd = new FormData();
      fd.append("label", linkForm.label);
      fd.append("url", linkForm.url);
      fd.append("badge", linkForm.badge);
      fd.append("order", linkForm.order);
      if (linkImageFile) fd.append("image", linkImageFile);

      const res = editingLink
        ? await menus.updateLink(activeColForLink!.id, editingLink.id, fd)
        : await menus.createLink(activeColForLink!.id, fd);
      if (res.data.success) {
        toast.success(editingLink ? "Link updated" : "Link created");
        setIsLinkDialogOpen(false);
        fetchData();
      }
    } catch {
      toast.error("Error saving link");
    }
  };

  const handleDeleteLink = async (colId: string, linkId: string) => {
    if (!confirm("Delete this link?")) return;
    try {
      const res = await menus.deleteLink(colId, linkId);
      if (res.data.success) {
        toast.success("Link deleted");
        fetchData();
      }
    } catch {
      toast.error("Error deleting");
    }
  };

  // ----------------------------------------------------
  // SELECTED ITEM
  // ----------------------------------------------------
  const selectedItem = navbarItems.find((i) => i.id === selectedItemId) || null;

  // ----------------------------------------------------
  // LOADING STATE
  // ----------------------------------------------------
  if (isLoading && navbarItems.length === 0) {
    return (
      <div className="max-w-6xl mx-auto p-6 space-y-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-4 w-96" />
        <div className="space-y-3 mt-6">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16 w-full rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (error && navbarItems.length === 0) {
    return (
      <div className="max-w-6xl mx-auto p-6 flex flex-col items-center justify-center py-20">
        <p className="text-sm text-gray-500 mb-4">{error}</p>
        <Button variant="outline" onClick={fetchData}>Retry</Button>
      </div>
    );
  }

  // ----------------------------------------------------
  // RENDER
  // ----------------------------------------------------
  return (
    <div className="max-w-7xl mx-auto">
      {/* TOP BAR */}
      <div className="sticky top-0 z-30 bg-white border-b border-gray-200 px-6 py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1">
            <h1 className="text-lg font-bold text-gray-900 tracking-tight whitespace-nowrap">Navigation Builder</h1>
            <Separator orientation="vertical" className="h-6" />
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search menus, columns, links..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9 text-sm"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={expandAll} className="h-8 text-xs">
              <ChevronDown className="h-3.5 w-3.5 mr-1" /> Expand All
            </Button>
            <Button variant="ghost" size="sm" onClick={collapseAll} className="h-8 text-xs">
              <ChevronRight className="h-3.5 w-3.5 mr-1" /> Collapse All
            </Button>
            <Separator orientation="vertical" className="h-6" />
            <Button variant="ghost" size="sm" onClick={() => setShowPreview(!showPreview)} className="h-8 text-xs">
              <Eye className="h-3.5 w-3.5 mr-1" /> {showPreview ? "Hide" : "Preview"}
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setPanelOpen(!panelOpen)} className="h-8 text-xs hidden lg:flex">
              {panelOpen ? <PanelRightClose className="h-3.5 w-3.5" /> : <PanelRightOpen className="h-3.5 w-3.5" />}
            </Button>
            <Separator orientation="vertical" className="h-6" />
            <Button size="sm" onClick={() => openItemDialog()} className="h-8 text-xs font-semibold">
              <Plus className="h-3.5 w-3.5 mr-1" /> Add Menu
            </Button>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex min-h-[calc(100vh-57px)]">
        {/* LEFT: Navigation Tree */}
        <div className={`flex-1 p-6 ${panelOpen ? "border-r border-gray-100" : ""}`}>
          {filteredItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
                <Layers className="h-7 w-7 text-gray-400" />
              </div>
              <p className="text-sm font-medium text-gray-600 mb-1">
                {searchQuery ? "No menus match your search" : "No navigation menus yet"}
              </p>
              <p className="text-xs text-gray-400 mb-4 max-w-xs">
                {searchQuery
                  ? "Try a different search term"
                  : "Add your first menu item to start building the navigation."}
              </p>
              {!searchQuery && (
                <Button size="sm" onClick={() => openItemDialog()}>
                  <Plus className="h-3.5 w-3.5 mr-1" /> Create Menu
                </Button>
              )}
            </div>
          ) : (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={filteredItems.map((i) => i.id)} strategy={verticalListSortingStrategy}>
                <div className="space-y-2">
                  {filteredItems.map((item) => (
                    <SortableItem key={item.id} id={item.id}>
                      <div
                        className={`flex-1 border rounded-xl transition-all duration-150 ${
                          selectedItemId === item.id
                            ? "border-blue-300 bg-blue-50/50 shadow-sm"
                            : "border-gray-200 bg-white hover:border-gray-300"
                        }`}
                      >
                        {/* Item Header */}
                        <div
                          className="flex items-center justify-between px-3 py-2.5 cursor-pointer select-none"
                          onClick={() => {
                            toggleExpand(item.id);
                            setSelectedItemId(item.id);
                          }}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className={`p-1.5 rounded-lg ${item.isActive ? "bg-gray-100" : "bg-gray-50"}`}>
                              {layoutIcons[item.layout] || <Layers className="h-3.5 w-3.5" />}
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className="font-semibold text-sm text-gray-900 truncate">{item.label}</span>
                                <Badge variant="secondary" className="text-[9px] px-1.5 py-0 font-medium shrink-0">
                                  {layoutLabels[item.layout] || item.layout}
                                </Badge>
                                {!item.isActive && (
                                  <Badge variant="destructive" className="text-[9px] px-1.5 py-0 font-medium shrink-0">
                                    Hidden
                                  </Badge>
                                )}
                              </div>
                              <p className="text-[11px] text-gray-400 truncate mt-0.5">
                                {item.columns.length} columns &bull; {item.columns.reduce((acc, c) => acc + c.links.length, 0)} links
                                {item.slug ? ` • ${item.slug}` : ""}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 p-0"
                              onClick={(e) => { e.stopPropagation(); handleToggleActive(item); }}
                              title={item.isActive ? "Hide menu" : "Show menu"}
                            >
                              {item.isActive ? <Eye className="h-3.5 w-3.5 text-gray-400" /> : <EyeOff className="h-3.5 w-3.5 text-gray-400" />}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 p-0"
                              onClick={(e) => { e.stopPropagation(); handleDuplicate(item); }}
                              title="Duplicate"
                            >
                              <Copy className="h-3.5 w-3.5 text-gray-400" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 p-0"
                              onClick={(e) => { e.stopPropagation(); openItemDialog(item); }}
                              title="Edit"
                            >
                              <Edit className="h-3.5 w-3.5 text-gray-400" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 p-0 hover:text-red-600"
                              onClick={(e) => { e.stopPropagation(); handleDeleteItem(item.id); }}
                              title="Delete"
                            >
                              <Trash2 className="h-3.5 w-3.5 text-gray-400" />
                            </Button>
                            {expandedItems[item.id] ? (
                              <ChevronDown className="h-4 w-4 text-gray-300" />
                            ) : (
                              <ChevronRight className="h-4 w-4 text-gray-300" />
                            )}
                          </div>
                        </div>

                        {/* Expanded: Columns & Links */}
                        {expandedItems[item.id] && (
                          <div className="border-t border-gray-100 px-4 py-3 bg-gray-50/50">
                            {/* Columns header */}
                            <div className="flex items-center justify-between mb-3">
                              <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                                {item.layout === "SHOP_TABS" ? "Category Columns" : "Menu Columns"}
                              </span>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-7 text-[11px]"
                                onClick={(e) => { e.stopPropagation(); openColDialog(item); }}
                              >
                                <Plus className="h-3 w-3 mr-1" /> Add Column
                              </Button>
                            </div>

                            {item.columns.length === 0 ? (
                              <div className="text-center py-6 text-xs text-gray-400 border border-dashed rounded-lg bg-white">
                                No columns yet. Add a column to organize links.
                              </div>
                            ) : (
                              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                                {item.columns.map((col) => (
                                  <div key={col.id} className="bg-white border border-gray-200 rounded-lg p-3 group">
                                    <div className="flex items-center justify-between mb-2">
                                      <div>
                                        <h5 className="text-xs font-bold text-gray-700 uppercase tracking-wide">{col.title}</h5>
                                        {col.category && (
                                          <p className="text-[10px] text-blue-500 mt-0.5">Tab: {col.category.name}</p>
                                        )}
                                      </div>
                                      <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => openColDialog(item, col)} className="p-1 text-gray-400 hover:text-gray-600 rounded">
                                          <Edit className="h-3 w-3" />
                                        </button>
                                        <button onClick={() => handleDeleteCol(item.id, col.id)} className="p-1 text-gray-400 hover:text-red-600 rounded">
                                          <Trash2 className="h-3 w-3" />
                                        </button>
                                      </div>
                                    </div>

                                    <div className="space-y-1 min-h-[32px]">
                                      {col.links.length === 0 ? (
                                        <p className="text-[10px] text-gray-300 text-center py-2">No links</p>
                                      ) : (
                                        col.links.map((lnk) => (
                                          <div key={lnk.id} className="flex items-center justify-between px-2 py-1.5 rounded bg-gray-50 hover:bg-gray-100 transition-colors group/link">
                                            <div className="flex items-center gap-1.5 min-w-0">
                                              {lnk.image ? (
                                                <img src={lnk.image} alt="" className="h-4 w-4 rounded object-cover" />
                                              ) : (
                                                <Link2 className="h-3 w-3 text-gray-300 shrink-0" />
                                              )}
                                              <span className="text-[11px] text-gray-600 truncate">{lnk.label}</span>
                                              {lnk.badge && (
                                                <Badge variant="secondary" className="text-[8px] px-1 py-0 font-bold">
                                                  {lnk.badge}
                                                </Badge>
                                              )}
                                            </div>
                                            <div className="flex gap-0.5 opacity-0 group-hover/link:opacity-100 transition-opacity shrink-0">
                                              <button onClick={() => openLinkDialog(col, lnk)} className="p-0.5 text-gray-400 hover:text-gray-600">
                                                <Edit className="h-2.5 w-2.5" />
                                              </button>
                                              <button onClick={() => handleDeleteLink(col.id, lnk.id)} className="p-0.5 text-gray-400 hover:text-red-600">
                                                <Trash2 className="h-2.5 w-2.5" />
                                              </button>
                                            </div>
                                          </div>
                                        ))
                                      )}
                                    </div>

                                    <button
                                      onClick={() => openLinkDialog(col)}
                                      className="w-full mt-2 py-1.5 text-[10px] text-gray-400 hover:text-gray-600 border border-dashed border-gray-200 hover:border-gray-300 rounded transition-colors flex items-center justify-center gap-1"
                                    >
                                      <Plus className="h-2.5 w-2.5" /> Add Link
                                    </button>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </SortableItem>
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </div>

        {/* RIGHT: Properties Panel */}
        {panelOpen && selectedItem && (
          <div className="w-80 shrink-0 p-4 bg-gray-50/80 overflow-y-auto hidden lg:block">
            <div className="space-y-4">
              <div>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Properties</h3>
                <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
                  <div>
                    <Label className="text-[11px] text-gray-500">Label</Label>
                    <p className="text-sm font-semibold text-gray-900">{selectedItem.label}</p>
                  </div>
                  <Separator />
                  <div>
                    <Label className="text-[11px] text-gray-500">Layout</Label>
                    <p className="text-sm text-gray-700">{layoutLabels[selectedItem.layout]}</p>
                  </div>
                  <Separator />
                  <div>
                    <Label className="text-[11px] text-gray-500">Order</Label>
                    <p className="text-sm text-gray-700">{selectedItem.order}</p>
                  </div>
                  <Separator />
                  <div>
                    <Label className="text-[11px] text-gray-500">Status</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <Switch
                        checked={selectedItem.isActive}
                        onCheckedChange={() => handleToggleActive(selectedItem)}
                      />
                      <span className="text-xs text-gray-500">{selectedItem.isActive ? "Visible" : "Hidden"}</span>
                    </div>
                  </div>
                  {selectedItem.slug && (
                    <>
                      <Separator />
                      <div>
                        <Label className="text-[11px] text-gray-500">Direct Link</Label>
                        <p className="text-sm text-blue-600 truncate">{selectedItem.slug}</p>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Quick Actions</h3>
                <div className="space-y-2">
                  <Button variant="outline" size="sm" className="w-full justify-start text-xs h-8" onClick={() => openColDialog(selectedItem)}>
                    <Plus className="h-3.5 w-3.5 mr-2" /> Add Column
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start text-xs h-8" onClick={() => openItemDialog(selectedItem)}>
                    <Edit className="h-3.5 w-3.5 mr-2" /> Edit Menu Settings
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start text-xs h-8" onClick={() => handleDuplicate(selectedItem)}>
                    <Copy className="h-3.5 w-3.5 mr-2" /> Duplicate Menu
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start text-xs h-8 text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => handleDeleteItem(selectedItem.id)}>
                    <Trash2 className="h-3.5 w-3.5 mr-2" /> Delete Menu
                  </Button>
                </div>
              </div>

              {/* Banner preview */}
              {selectedItem.layout === "COLUMNS_WITH_BANNER" && selectedItem.bannerTitle && (
                <div>
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Banner Preview</h3>
                  <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                    {selectedItem.bannerImage ? (
                      <div className="relative h-32">
                        <img src={selectedItem.bannerImage} alt="" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                        <div className="absolute bottom-3 left-3 right-3 text-white">
                          <p className="text-xs font-bold">{selectedItem.bannerTitle}</p>
                          <p className="text-[10px] opacity-80">{selectedItem.bannerSubtitle}</p>
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 text-center">
                        <p className="text-xs font-bold text-gray-700">{selectedItem.bannerTitle}</p>
                        <p className="text-[10px] text-gray-400">{selectedItem.bannerSubtitle}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── PREVIEW OVERLAY ── */}
      {showPreview && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-start justify-center pt-20" onClick={() => setShowPreview(false)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full mx-4 max-h-[70vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b px-6 py-3 flex items-center justify-between rounded-t-2xl">
              <h3 className="font-bold text-sm">Navigation Preview</h3>
              <Button variant="ghost" size="sm" onClick={() => setShowPreview(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="p-6">
              <nav className="flex items-center justify-center gap-6 border-b pb-4">
                {navbarItems.filter((i) => i.isActive).map((item) => (
                  <div key={item.id} className="group relative">
                    <span className="text-xs font-semibold tracking-widest uppercase text-gray-700 hover:text-black cursor-pointer">
                      {item.label}
                    </span>
                    {item.columns.length > 0 && (
                      <div className="absolute top-full left-0 pt-2 hidden group-hover:block z-10">
                        <div className="bg-white border rounded-xl shadow-xl p-4 min-w-[200px]">
                          {item.columns.map((col) => (
                            <div key={col.id} className="mb-3">
                              <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">{col.title}</p>
                              {col.links.map((lnk) => (
                                <p key={lnk.id} className="text-xs text-gray-600 hover:text-black py-0.5 cursor-pointer">
                                  {lnk.label}
                                </p>
                              ))}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </nav>
              <p className="text-center text-xs text-gray-400 mt-4">This is a simplified preview. Actual rendering happens on the storefront.</p>
            </div>
          </div>
        </div>
      )}

      {/* ── ITEM DIALOG ── */}
      <Dialog open={isItemDialogOpen} onOpenChange={setIsItemDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <form onSubmit={handleItemSubmit} className="space-y-4">
            <DialogHeader>
              <DialogTitle>{editingItem ? "Edit Menu Item" : "Create Menu Item"}</DialogTitle>
              <DialogDescription>Configure the top-level navigation item.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label>Menu Label</Label>
                <Input value={itemForm.label} onChange={(e) => setItemForm({ ...itemForm, label: e.target.value })} placeholder="e.g. SHOP, PROTEIN, GOALS" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Direct URL (optional)</Label>
                  <Input value={itemForm.slug} onChange={(e) => setItemForm({ ...itemForm, slug: e.target.value })} placeholder="/products" />
                </div>
                <div className="space-y-1.5">
                  <Label>Order</Label>
                  <Input type="number" value={itemForm.order} onChange={(e) => setItemForm({ ...itemForm, order: e.target.value })} />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Layout</Label>
                <select value={itemForm.layout} onChange={(e) => setItemForm({ ...itemForm, layout: e.target.value })} className="w-full h-9 rounded-md border border-gray-200 bg-white px-3 py-1 text-sm outline-none">
                  <option value="SIMPLE">Simple Link (direct navigation)</option>
                  <option value="COLUMNS_WITH_BANNER">Mega Menu + Banner (columns + promo)</option>
                  <option value="SHOP_TABS">Category Tabs (left tabs, right columns)</option>
                  <option value="IMAGE_GRID">Image Grid (visual cards)</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={itemForm.isActive} onCheckedChange={(v) => setItemForm({ ...itemForm, isActive: v })} />
                <Label className="text-sm">Visible on storefront</Label>
              </div>

              {itemForm.layout === "COLUMNS_WITH_BANNER" && (
                <div className="border-t pt-4 space-y-3">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Banner Settings</h4>
                  <div className="space-y-1.5">
                    <Label>Banner Image</Label>
                    <div className="flex items-center gap-3">
                      {bannerPreview ? (
                        <img src={bannerPreview} alt="" className="h-14 w-24 rounded object-cover border" />
                      ) : (
                        <div className="h-14 w-24 rounded border border-dashed flex items-center justify-center">
                          <ImageIcon className="h-5 w-5 text-gray-300" />
                        </div>
                      )}
                      <Input type="file" accept="image/*" onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) { setBannerFile(f); setBannerPreview(URL.createObjectURL(f)); }
                      }} className="text-xs" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label>Title</Label>
                      <Input value={itemForm.bannerTitle} onChange={(e) => setItemForm({ ...itemForm, bannerTitle: e.target.value })} placeholder="e.g. BUILD. RECOVER. GROW." />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Button Text</Label>
                      <Input value={itemForm.bannerSubtitle} onChange={(e) => setItemForm({ ...itemForm, bannerSubtitle: e.target.value })} placeholder="e.g. SHOP NOW" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Button Link</Label>
                    <Input value={itemForm.bannerLink} onChange={(e) => setItemForm({ ...itemForm, bannerLink: e.target.value })} placeholder="/products?sort=featured" />
                  </div>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsItemDialogOpen(false)}>Cancel</Button>
              <Button type="submit">{editingItem ? "Update" : "Create"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── COLUMN DIALOG ── */}
      <Dialog open={isColDialogOpen} onOpenChange={setIsColDialogOpen}>
        <DialogContent className="max-w-md">
          <form onSubmit={handleColSubmit} className="space-y-4">
            <DialogHeader>
              <DialogTitle>{editingCol ? "Edit Column" : "Add Column"}</DialogTitle>
              <DialogDescription>For {activeItemForCol?.label} menu.</DialogDescription>
            </DialogHeader>
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label>Column Title</Label>
                <Input value={colForm.title} onChange={(e) => setColForm({ ...colForm, title: e.target.value })} placeholder="e.g. SHOP BY CATEGORY, GOALS" />
              </div>
              <div className="space-y-1.5">
                <Label>Order</Label>
                <Input type="number" value={colForm.order} onChange={(e) => setColForm({ ...colForm, order: e.target.value })} />
              </div>
              {activeItemForCol?.layout === "SHOP_TABS" && (
                <div className="space-y-1.5">
                  <Label>Associate Category Tab</Label>
                  <select value={colForm.categoryId} onChange={(e) => setColForm({ ...colForm, categoryId: e.target.value })} className="w-full h-9 rounded-md border border-gray-200 bg-white px-3 py-1 text-sm outline-none">
                    <option value="">None</option>
                    {categoriesList.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsColDialogOpen(false)}>Cancel</Button>
              <Button type="submit">{editingCol ? "Update" : "Create"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── LINK DIALOG ── */}
      <Dialog open={isLinkDialogOpen} onOpenChange={setIsLinkDialogOpen}>
        <DialogContent className="max-w-md">
          <form onSubmit={handleLinkSubmit} className="space-y-4">
            <DialogHeader>
              <DialogTitle>{editingLink ? "Edit Link" : "Add Link"}</DialogTitle>
              <DialogDescription>In column: {activeColForLink?.title}</DialogDescription>
            </DialogHeader>
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label>Link Label</Label>
                <Input value={linkForm.label} onChange={(e) => setLinkForm({ ...linkForm, label: e.target.value })} placeholder="e.g. Whey Protein, Build Muscle" />
              </div>
              <div className="space-y-1.5">
                <Label>URL</Label>
                <Input value={linkForm.url} onChange={(e) => setLinkForm({ ...linkForm, url: e.target.value })} placeholder="/products?category=whey-protein" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Badge (optional)</Label>
                  <Input value={linkForm.badge} onChange={(e) => setLinkForm({ ...linkForm, badge: e.target.value })} placeholder="NEW, HOT, SALE" />
                </div>
                <div className="space-y-1.5">
                  <Label>Order</Label>
                  <Input type="number" value={linkForm.order} onChange={(e) => setLinkForm({ ...linkForm, order: e.target.value })} />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Thumbnail (optional)</Label>
                <div className="flex items-center gap-3">
                  {linkImagePreview ? (
                    <img src={linkImagePreview} alt="" className="h-10 w-10 rounded object-cover border" />
                  ) : (
                    <div className="h-10 w-10 rounded border border-dashed flex items-center justify-center">
                      <ImageIcon className="h-4 w-4 text-gray-300" />
                    </div>
                  )}
                  <Input type="file" accept="image/*" onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) { setLinkImageFile(f); setLinkImagePreview(URL.createObjectURL(f)); }
                  }} className="text-xs" />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsLinkDialogOpen(false)}>Cancel</Button>
              <Button type="submit">{editingLink ? "Update" : "Create"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
