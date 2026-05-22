"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Download, Eye, Loader2, Mail, Search, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import * as XLSX from "xlsx";

import { Button } from "@/components/ui/button";
import { DeleteConfirmDialog } from "@/components/ui/delete-confirm-dialog";
import { Pagination } from "@/components/ui/pagination";
import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

export type ContactMessageRow = {
  id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  created_at: string;
};

type MessagesManagerProps = {
  initialUserEmail: string;
  initialMessages: ContactMessageRow[];
};

type SortKey = "created_at" | "name" | "email" | "subject";
type SortDirection = "asc" | "desc";

const itemsPerPage = 10;

const formatDate = (value: string) => {
  if (!value) return "";
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
};

const getDateInputValue = (value: string) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
};

export default function MessagesManager({
  initialUserEmail,
  initialMessages,
}: MessagesManagerProps) {
  const router = useRouter();
  const [checkingSession, setCheckingSession] = useState(true);
  const [messages, setMessages] = useState(initialMessages);
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("created_at");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMessage, setViewMessage] = useState<ContactMessageRow | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ContactMessageRow | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    const syncSession = async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        router.replace("/admin/login");
        return;
      }
      setCheckingSession(false);
    };
    void syncSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) router.replace("/admin/login");
    });
    return () => subscription.unsubscribe();
  }, [initialUserEmail, router]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, dateFilter, sortKey, sortDirection]);

  const filteredMessages = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return messages
      .filter((message) => {
        if (!query) return true;
        return [
          message.name,
          message.email,
          message.phone,
          message.subject,
          message.message,
        ].some((value) => value.toLowerCase().includes(query));
      })
      .filter((message) => {
        if (!dateFilter) return true;
        return getDateInputValue(message.created_at) === dateFilter;
      })
      .sort((a, b) => {
        const aValue = sortKey === "created_at" ? new Date(a.created_at).getTime() : a[sortKey].toLowerCase();
        const bValue = sortKey === "created_at" ? new Date(b.created_at).getTime() : b[sortKey].toLowerCase();

        if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
        if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
        return 0;
      });
  }, [dateFilter, messages, searchQuery, sortDirection, sortKey]);

  const totalPages = Math.ceil(filteredMessages.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedMessages = filteredMessages.slice(startIndex, startIndex + itemsPerPage);

  const setSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection((current) => (current === "asc" ? "desc" : "asc"));
      return;
    }
    setSortKey(key);
    setSortDirection(key === "created_at" ? "desc" : "asc");
  };

  const deleteMessage = async () => {
    if (!deleteTarget) return;
    setDeleting(deleteTarget.id);

    try {
      const response = await fetch(`/api/admin/messages/${deleteTarget.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result?.error ?? "Unable to delete message.");
      }

      setMessages((current) => current.filter((message) => message.id !== deleteTarget.id));
      setDeleteTarget(null);
      toast.success("Message deleted.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to delete message.");
    } finally {
      setDeleting(null);
    }
  };

  const exportMessages = () => {
    if (!filteredMessages.length) {
      toast.error("No messages to export.");
      return;
    }

    const rows = filteredMessages.map((message) => ({
      ID: message.id,
      Name: message.name,
      Email: message.email,
      Phone: message.phone,
      Topic: message.subject,
      Message: message.message,
      "Created At": message.created_at ? new Date(message.created_at) : "",
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const dateColumnIndex = 6;
    filteredMessages.forEach((_, index) => {
      const cellRef = XLSX.utils.encode_cell({ c: dateColumnIndex, r: index + 1 });
      if (worksheet[cellRef]) {
        worksheet[cellRef].t = "d";
        worksheet[cellRef].z = "yyyy-mm-dd hh:mm";
      }
    });
    worksheet["!cols"] = [
      { wch: 12 },
      { wch: 24 },
      { wch: 28 },
      { wch: 18 },
      { wch: 22 },
      { wch: 60 },
      { wch: 22 },
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Messages");
    XLSX.writeFile(workbook, `contact-messages-${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  if (checkingSession) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex items-center gap-3 text-[#665b4f]">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Checking session...</span>
        </div>
      </div>
    );
  }

  const sortLabel = (key: SortKey) => (sortKey === key ? (sortDirection === "asc" ? " ↑" : " ↓") : "");

  return (
    <div className="px-6 py-8 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <motion.section
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28, ease: "easeOut" }}
          className="rounded-[32px] bg-white p-6 shadow-sm sm:p-8"
        >
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1b1511] text-[#f8f2e8]">
                <Mail className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-3xl tracking-[-0.03em] text-[#1b1511]">Messages</h1>
                <p className="mt-1 text-sm text-[#665b4f]">
                  {messages.length} {messages.length === 1 ? "submission" : "submissions"} from the contact form
                </p>
              </div>
            </div>

            <Button onClick={exportMessages} className="h-11 rounded-full bg-[#1b1511] px-6 text-[#f8f2e8] hover:bg-[#2a211a]">
              <Download className="mr-2 h-4 w-4" />
              Export .xlsx
            </Button>
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28, delay: 0.05, ease: "easeOut" }}
          className="mt-8 rounded-[32px] bg-white p-6 shadow-sm sm:p-8"
        >
          <div className="mb-6 grid gap-3 lg:grid-cols-[1fr_180px_180px]">
            <div className="flex items-center gap-3 rounded-full border border-[#d9ccbc] bg-[#fcfaf7] px-4 py-3">
              <Search className="h-5 w-5 text-[#8a7765]" />
              <input
                type="text"
                placeholder="Search name, email, phone, topic, or message..."
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                className="min-w-0 flex-1 bg-transparent text-sm text-[#1b1511] outline-none placeholder:text-[#a69280]"
              />
            </div>
            <input
              type="date"
              value={dateFilter}
              onChange={(event) => setDateFilter(event.target.value)}
              className="h-12 rounded-full border border-[#d9ccbc] bg-[#fcfaf7] px-4 text-sm text-[#1b1511] outline-none"
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setSearchQuery("");
                setDateFilter("");
              }}
              className="h-12 rounded-full border-[#d9ccbc] bg-transparent text-[#1b1511] hover:bg-[#f5eee4]"
            >
              Clear filters
            </Button>
          </div>

          <div className="max-h-[620px] overflow-auto rounded-2xl border border-[#e8ddd1]">
            {paginatedMessages.length ? (
              <table className="w-full min-w-[980px] border-collapse">
                <thead className="sticky top-0 z-10 bg-[#fcfaf7] shadow-[0_1px_0_#e8ddd1]">
                  <tr>
                    <th className="p-3 text-left text-xs font-semibold uppercase tracking-[0.22em] text-[#8a7765]">
                      <button type="button" onClick={() => setSort("created_at")}>Date{sortLabel("created_at")}</button>
                    </th>
                    <th className="p-3 text-left text-xs font-semibold uppercase tracking-[0.22em] text-[#8a7765]">
                      <button type="button" onClick={() => setSort("name")}>Name{sortLabel("name")}</button>
                    </th>
                    <th className="p-3 text-left text-xs font-semibold uppercase tracking-[0.22em] text-[#8a7765]">
                      <button type="button" onClick={() => setSort("email")}>Email{sortLabel("email")}</button>
                    </th>
                    <th className="p-3 text-left text-xs font-semibold uppercase tracking-[0.22em] text-[#8a7765]">Phone</th>
                    <th className="p-3 text-left text-xs font-semibold uppercase tracking-[0.22em] text-[#8a7765]">
                      <button type="button" onClick={() => setSort("subject")}>Topic{sortLabel("subject")}</button>
                    </th>
                    <th className="p-3 text-left text-xs font-semibold uppercase tracking-[0.22em] text-[#8a7765]">Message</th>
                    <th className="p-3 text-center text-xs font-semibold uppercase tracking-[0.22em] text-[#8a7765]">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence initial={false}>
                    {paginatedMessages.map((message) => (
                      <motion.tr
                        key={message.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="border-b border-[#e8ddd1] transition hover:bg-[#fcfaf7]"
                      >
                        <td className="p-3 text-sm text-[#665b4f]">{formatDate(message.created_at)}</td>
                        <td className="p-3 text-sm font-medium text-[#1b1511]">{message.name}</td>
                        <td className="p-3 text-sm text-[#665b4f]">{message.email}</td>
                        <td className="p-3 text-sm text-[#665b4f]">{message.phone}</td>
                        <td className="p-3 text-sm text-[#665b4f]">{message.subject}</td>
                        <td className="p-3 text-sm text-[#665b4f]">
                          <div className="max-w-xs line-clamp-2">{message.message}</div>
                        </td>
                        <td className="p-3">
                          <div className="flex justify-center gap-2">
                            <button
                              type="button"
                              onClick={() => setViewMessage(message)}
                              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#d9ccbc] text-[#1b1511] transition hover:bg-[#f5eee4]"
                              aria-label={`View message from ${message.name}`}
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteTarget(message)}
                              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#d9ccbc] text-[#7a4d1d] transition hover:bg-[#faf4ea]"
                              aria-label={`Delete message from ${message.name}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            ) : (
              <div className="flex min-h-[240px] items-center justify-center p-8 text-center text-sm leading-7 text-[#665b4f]">
                {messages.length ? "No messages match your filters." : "No contact messages yet."}
              </div>
            )}
          </div>

          {filteredMessages.length > 0 && totalPages > 1 && (
            <div className="mt-6 flex flex-col gap-4 border-t border-[#e8ddd1] pt-6 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-[#665b4f]">
                Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredMessages.length)} of {filteredMessages.length} messages
              </p>
              <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
            </div>
          )}
        </motion.section>
      </div>

      <AnimatePresence>
        {viewMessage && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 10 }}
              className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-[32px] bg-white p-6 shadow-xl sm:p-8"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#8a7765]">
                    {formatDate(viewMessage.created_at)}
                  </p>
                  <h2 className="mt-2 text-3xl tracking-[-0.03em] text-[#1b1511]">{viewMessage.subject}</h2>
                </div>
                <button
                  type="button"
                  onClick={() => setViewMessage(null)}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#d9ccbc] text-[#1b1511] transition hover:bg-[#f5eee4]"
                  aria-label="Close message"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="mt-6 grid gap-4 rounded-2xl bg-[#fcfaf7] p-4 text-sm text-[#665b4f] sm:grid-cols-2">
                <p><span className="font-semibold text-[#1b1511]">Name:</span> {viewMessage.name}</p>
                <p><span className="font-semibold text-[#1b1511]">Email:</span> {viewMessage.email}</p>
                <p><span className="font-semibold text-[#1b1511]">Phone:</span> {viewMessage.phone}</p>
                <p><span className="font-semibold text-[#1b1511]">Topic:</span> {viewMessage.subject}</p>
              </div>

              <div className="mt-6">
                <p className="mb-2 text-xs font-semibold uppercase tracking-[0.22em] text-[#8a7765]">Message</p>
                <p className="whitespace-pre-wrap rounded-2xl border border-[#e8ddd1] p-4 text-sm leading-7 text-[#352a21]">
                  {viewMessage.message}
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <DeleteConfirmDialog
        open={!!deleteTarget}
        itemName={deleteTarget?.subject}
        title="Delete message"
        description={deleteTarget ? `Delete the message from ${deleteTarget.name}? This cannot be undone.` : undefined}
        loading={deleting === deleteTarget?.id}
        onCancel={() => { if (!deleting) setDeleteTarget(null); }}
        onConfirm={deleteMessage}
      />
    </div>
  );
}
