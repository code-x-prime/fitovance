import { useState, useEffect } from "react";
import axios from "axios";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  MoreHorizontal,
  Eye,
  Trash2,
  Mail,
  Search,
  User,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Inbox,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { API_URL } from "@/config/api";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

interface ContactRequest {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  pincode: string | null;
  dimensions: string | null;
  material: string | null;
  colors: string | null;
  designNotes: string | null;
  type: "CUSTOM_RUG" | "RUG_SERVICE" | "CONTACT_ENQUIRY";
  status: "NEW" | "IN_PROGRESS" | "RESOLVED" | "SPAM";
  adminNotes: string | null;
  createdAt: string;
  updatedAt: string;
}

interface ContactRequestsResponse {
  submissions: ContactRequest[];
  pagination: {
    page: number;
    limit: number;
    totalPages: number;
    total: number;
  };
}

const updateStatusSchema = z.object({
  status: z.enum(["NEW", "IN_PROGRESS", "RESOLVED", "SPAM"]),
  adminNotes: z.string().optional(),
});

const ContactManagementPage = () => {
  const [submissions, setSubmissions] = useState<ContactRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedContact, setSelectedContact] =
    useState<ContactRequest | null>(null);

  const { toast } = useToast();

  const statusConfig: Record<
    string,
    { label: string; className: string; icon: React.ReactNode }
  > = {
    NEW: {
      label: "New",
      className:
        "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800",
      icon: <Inbox className="h-3 w-3" />,
    },
    IN_PROGRESS: {
      label: "In Progress",
      className:
        "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800",
      icon: <Clock className="h-3 w-3" />,
    },
    RESOLVED: {
      label: "Resolved",
      className:
        "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800",
      icon: <CheckCircle2 className="h-3 w-3" />,
    },
    SPAM: {
      label: "Spam",
      className:
        "bg-gray-50 text-gray-600 border-gray-200 dark:bg-gray-900 dark:text-gray-400 dark:border-gray-700",
      icon: <AlertTriangle className="h-3 w-3" />,
    },
  };

  const updateForm = useForm<z.infer<typeof updateStatusSchema>>({
    resolver: zodResolver(updateStatusSchema),
    defaultValues: {
      status: "NEW",
      adminNotes: "",
    },
  });

  const fetchSubmissions = async () => {
    setIsLoading(true);
    try {
      let url = `${API_URL}/admin/custom-rugs?page=${page}&limit=10&type=CONTACT_ENQUIRY`;
      if (selectedStatus) {
        url += `&status=${selectedStatus}`;
      }

      const response = await axios.get<{ data: ContactRequestsResponse }>(
        url,
        { withCredentials: true }
      );

      const responseData = response.data?.data;
      setSubmissions(responseData?.submissions || []);
      setTotalPages(responseData?.pagination?.totalPages || 1);
    } catch (error) {
      console.error("Error fetching contact enquiries:", error);
      setSubmissions([]);
      toast({
        title: "Error",
        description: "Failed to fetch contact enquiries",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, [page, selectedStatus]);

  const handleStatusChange = (value: string) => {
    setSelectedStatus(value === "ALL" ? null : value);
    setPage(1);
  };

  const handleViewContact = (contact: ContactRequest) => {
    setSelectedContact(contact);
    setViewDialogOpen(true);
  };

  const handleUpdateStatus = (contact: ContactRequest) => {
    setSelectedContact(contact);
    updateForm.setValue("status", contact.status);
    updateForm.setValue("adminNotes", contact.adminNotes || "");
    setUpdateDialogOpen(true);
  };

  const confirmDelete = (contact: ContactRequest) => {
    setSelectedContact(contact);
    setDeleteDialogOpen(true);
  };

  const handleDeleteContact = async () => {
    if (!selectedContact) return;

    try {
      await axios.delete(`${API_URL}/admin/custom-rugs/${selectedContact.id}`, {
        withCredentials: true,
      });

      toast({
        title: "Success",
        description: "Contact enquiry deleted successfully",
      });

      fetchSubmissions();
    } catch (error) {
      console.error("Error deleting contact enquiry:", error);
      toast({
        title: "Error",
        description: "Failed to delete contact enquiry",
        variant: "destructive",
      });
    } finally {
      setDeleteDialogOpen(false);
      setSelectedContact(null);
    }
  };

  const handleUpdateContact = async (
    values: z.infer<typeof updateStatusSchema>
  ) => {
    if (!selectedContact) return;

    try {
      await axios.put(
        `${API_URL}/admin/custom-rugs/${selectedContact.id}/status`,
        {
          status: values.status,
          adminNotes: values.adminNotes,
        },
        { withCredentials: true }
      );

      toast({
        title: "Success",
        description: "Status updated successfully",
      });

      fetchSubmissions();
      setUpdateDialogOpen(false);
      setSelectedContact(null);
    } catch (error) {
      console.error("Error updating contact enquiry:", error);
      toast({
        title: "Error",
        description: "Failed to update contact enquiry",
        variant: "destructive",
      });
    }
  };

  const getFilteredCount = () => {
    return submissions.length;
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">
            Contact Management
          </h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            View and manage contact form enquiries from your website visitors
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
          <Mail className="h-4 w-4" />
          <span>{getFilteredCount()} enquiries</span>
        </div>
      </div>

      {/* Filters Bar */}
      <Card className="bg-[var(--bg-card)] border-[var(--border-color)] shadow-sm rounded-xl">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-secondary)]" />
              <Input
                type="search"
                placeholder="Search by name, email, or message..."
                className="pl-10 border-[var(--border-color)] focus:border-primary h-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select
              value={selectedStatus || "ALL"}
              onValueChange={handleStatusChange}
            >
              <SelectTrigger className="w-full sm:w-[180px] border-[var(--border-color)] focus:border-primary h-10">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Status</SelectItem>
                <SelectItem value="NEW">New</SelectItem>
                <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                <SelectItem value="RESOLVED">Resolved</SelectItem>
                <SelectItem value="SPAM">Spam</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Enquiries List */}
      <Card className="bg-[var(--bg-card)] border-[var(--border-color)] shadow-sm rounded-xl">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center py-20">
              <div className="flex flex-col items-center gap-3">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--accent)] border-t-transparent"></div>
                <p className="text-sm text-[var(--text-secondary)]">
                  Loading enquiries...
                </p>
              </div>
            </div>
          ) : !submissions || submissions.length === 0 ? (
            <div className="flex items-center justify-center py-16">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-[var(--bg-secondary)] mb-4">
                  <Mail className="h-7 w-7 text-[var(--text-secondary)]" />
                </div>
                <h3 className="text-base font-semibold text-[var(--text-primary)] mb-1">
                  No Enquiries Found
                </h3>
                <p className="text-sm text-[var(--text-secondary)] max-w-sm">
                  {searchQuery || selectedStatus
                    ? "No contact enquiries match your current filters. Try adjusting your search criteria."
                    : "There are no contact form submissions yet. Enquiries will appear here once visitors submit the contact form."}
                </p>
              </div>
            </div>
          ) : (
            <>
              <div className="divide-y divide-[var(--border-color)]">
                {submissions.map((contact) => (
                  <div
                    key={contact.id}
                    className="p-5 hover:bg-[var(--bg-secondary)]/50 transition-colors"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--accent)]/10 flex-shrink-0">
                          <User className="h-5 w-5 text-[var(--accent)]" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium text-[var(--text-primary)] truncate">
                              {contact.name}
                            </h3>
                          </div>
                          <p className="text-sm text-[var(--text-secondary)] truncate">
                            {contact.email}
                          </p>
                          {contact.designNotes && (
                            <p className="text-xs text-[var(--text-secondary)] truncate mt-0.5 max-w-md">
                              {contact.designNotes}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <div className="text-right hidden sm:block">
                          <p className="text-xs text-[var(--text-secondary)]">
                            {formatDistanceToNow(new Date(contact.createdAt), {
                              addSuffix: true,
                            })}
                          </p>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-xs font-medium gap-1 ${statusConfig[contact.status]?.className || ""}`}
                        >
                          {statusConfig[contact.status]?.icon}
                          {statusConfig[contact.status]?.label}
                        </Badge>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                            >
                              <MoreHorizontal className="h-4 w-4 text-[var(--text-secondary)]" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            align="end"
                            className="bg-[var(--bg-card)] border-[var(--border-color)] shadow-lg"
                          >
                            <DropdownMenuItem
                              className="text-[var(--text-primary)] cursor-pointer"
                              onClick={() => handleViewContact(contact)}
                            >
                              <Eye className="mr-2 h-4 w-4" /> View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-[var(--text-primary)] cursor-pointer"
                              onClick={() => handleUpdateStatus(contact)}
                            >
                              <Mail className="mr-2 h-4 w-4" /> Update Status
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-red-600 cursor-pointer focus:text-red-600"
                              onClick={() => confirmDelete(contact)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {/* Pagination */}
              <div className="flex items-center justify-between border-t border-[var(--border-color)] px-5 py-3">
                <p className="text-sm text-[var(--text-secondary)]">
                  Page {page} of {totalPages}
                </p>
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() =>
                          setPage((prev) => Math.max(prev - 1, 1))
                        }
                        className={
                          page <= 1
                            ? "pointer-events-none opacity-50"
                            : "hover:bg-[var(--bg-secondary)] cursor-pointer"
                        }
                      />
                    </PaginationItem>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                      (pageNum) => (
                        <PaginationItem key={pageNum}>
                          <PaginationLink
                            onClick={() => setPage(pageNum)}
                            isActive={pageNum === page}
                            className={
                              pageNum === page
                                ? "bg-[var(--accent)] text-white hover:bg-[var(--accent)]/90"
                                : "hover:bg-[var(--bg-secondary)] cursor-pointer"
                            }
                          >
                            {pageNum}
                          </PaginationLink>
                        </PaginationItem>
                      )
                    )}
                    <PaginationItem>
                      <PaginationNext
                        onClick={() =>
                          setPage((prev) =>
                            prev < totalPages ? prev + 1 : prev
                          )
                        }
                        className={
                          page >= totalPages
                            ? "pointer-events-none opacity-50"
                            : "hover:bg-[var(--bg-secondary)] cursor-pointer"
                        }
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* View Details Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="bg-[var(--bg-card)] border-[var(--border-color)] max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-[var(--text-primary)]">
              Contact Enquiry Details
            </DialogTitle>
          </DialogHeader>
          {selectedContact && (
            <div className="space-y-5 py-2">
              {/* Contact Information */}
              <div className="bg-[var(--bg-secondary)] p-4 rounded-xl border border-[var(--border-color)]">
                <h4 className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-3">
                  Contact Information
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-[var(--text-secondary)] mb-0.5">
                      Name
                    </p>
                    <p className="text-sm font-medium text-[var(--text-primary)]">
                      {selectedContact.name}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-[var(--text-secondary)] mb-0.5">
                      Email
                    </p>
                    <p className="text-sm font-medium text-[var(--text-primary)] break-all">
                      {selectedContact.email}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-[var(--text-secondary)] mb-0.5">
                      Phone
                    </p>
                    <p className="text-sm font-medium text-[var(--text-primary)]">
                      {selectedContact.phone || "Not provided"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-[var(--text-secondary)] mb-0.5">
                      Status
                    </p>
                    <Badge
                      variant="outline"
                      className={`text-xs font-medium gap-1 ${statusConfig[selectedContact.status]?.className || ""}`}
                    >
                      {statusConfig[selectedContact.status]?.icon}
                      {statusConfig[selectedContact.status]?.label}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Message */}
              <div>
                <h4 className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-2">
                  Message
                </h4>
                <div className="p-4 bg-[var(--bg-secondary)] rounded-lg border border-[var(--border-color)] whitespace-pre-wrap text-sm text-[var(--text-primary)] min-h-[80px]">
                  {selectedContact.designNotes || (
                    <span className="text-[var(--text-secondary)] italic">
                      No message provided.
                    </span>
                  )}
                </div>
              </div>

              {/* Admin Notes */}
              {selectedContact.adminNotes && (
                <div>
                  <h4 className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-2">
                    Admin Notes
                  </h4>
                  <div className="p-4 bg-[var(--accent)]/5 rounded-lg border border-[var(--accent)]/20 whitespace-pre-wrap text-sm text-[var(--text-primary)]">
                    {selectedContact.adminNotes}
                  </div>
                </div>
              )}

              {/* Timestamps */}
              <div className="flex flex-wrap gap-4 text-xs text-[var(--text-secondary)] bg-[var(--bg-secondary)] p-3 rounded-lg border border-[var(--border-color)]">
                <span>
                  <span className="font-medium">Submitted:</span>{" "}
                  {new Date(selectedContact.createdAt).toLocaleString()}
                </span>
                <span>
                  <span className="font-medium">Updated:</span>{" "}
                  {new Date(selectedContact.updatedAt).toLocaleString()}
                </span>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-3 border-t border-[var(--border-color)]">
                <Button
                  variant="outline"
                  className="border-[var(--border-color)]"
                  onClick={() => {
                    setViewDialogOpen(false);
                    setSelectedContact(null);
                  }}
                >
                  Close
                </Button>
                <Button
                  onClick={() => {
                    setViewDialogOpen(false);
                    handleUpdateStatus(selectedContact);
                  }}
                >
                  Update Status
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Update Status Dialog */}
      <Dialog open={updateDialogOpen} onOpenChange={setUpdateDialogOpen}>
        <DialogContent className="bg-[var(--bg-card)] border-[var(--border-color)]">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-[var(--text-primary)]">
              Update Status
            </DialogTitle>
          </DialogHeader>
          <Form {...updateForm}>
            <form
              onSubmit={updateForm.handleSubmit(handleUpdateContact)}
              className="space-y-4 py-2"
            >
              <FormField
                control={updateForm.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-[var(--text-primary)]">
                      Status
                    </FormLabel>
                    <FormControl>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger className="border-[var(--border-color)] focus:border-primary">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="NEW">New</SelectItem>
                          <SelectItem value="IN_PROGRESS">
                            In Progress
                          </SelectItem>
                          <SelectItem value="RESOLVED">Resolved</SelectItem>
                          <SelectItem value="SPAM">Spam</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={updateForm.control}
                name="adminNotes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-[var(--text-primary)]">
                      Admin Notes
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Add private notes for your team..."
                        {...field}
                        value={field.value || ""}
                        className="border-[var(--border-color)] focus:border-primary min-h-[100px]"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-3 pt-3 border-t border-[var(--border-color)]">
                <Button
                  type="button"
                  variant="outline"
                  className="border-[var(--border-color)]"
                  onClick={() => {
                    setUpdateDialogOpen(false);
                    setSelectedContact(null);
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit">Update</Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="bg-[var(--bg-card)] border-[var(--border-color)]">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-[var(--text-primary)]">
              Delete Enquiry
            </DialogTitle>
          </DialogHeader>
          <div className="py-3">
            <p className="text-sm text-[var(--text-primary)]">
              Are you sure you want to delete the enquiry from{" "}
              <span className="font-semibold">{selectedContact?.name}</span>?
              This action cannot be undone.
            </p>
          </div>
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              className="border-[var(--border-color)]"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={handleDeleteContact}
            >
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ContactManagementPage;
