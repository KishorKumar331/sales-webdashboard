import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  TrendingUp,
  CheckCircle2,
  Clock,
  DollarSign,
  Users,
  Search,
  Filter,
  Download,
  RefreshCw,
  Eye,
  FileText,
  Calendar,
  Layers,
  ArrowUpRight,
  Receipt,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  LayoutGrid,
  Table as TableIcon,
  X,
  Phone,
  Mail,
  Award,
  ChevronRight,
  ExternalLink,
  MapPin,
  Sparkles,
  Percent,
  FileSpreadsheet,
  User,
  Baby,
} from "lucide-react";
import axios from "axios";
import { toast } from "react-toastify";

// Helper for formatting currency in Indian Rupees
const formatINR = (val) => {
  const num = parseFloat(val) || 0;
  return "₹" + num.toLocaleString("en-IN");
};

// Date Presets generator
const getDatePresets = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();

  const toDateStr = (d) => d.toISOString().split("T")[0];

  const today = toDateStr(now);

  const last7DaysDate = new Date();
  last7DaysDate.setDate(last7DaysDate.getDate() - 7);
  const last7Days = toDateStr(last7DaysDate);

  const thisMonthStart = toDateStr(new Date(year, month, 1));
  const thisMonthEnd = toDateStr(new Date(year, month + 1, 0));

  const lastMonthStart = toDateStr(new Date(year, month - 1, 1));
  const lastMonthEnd = toDateStr(new Date(year, month, 0));

  const ytdStart = `${year}-01-01`;
  const allTimeStart = "2024-01-01";
  const allTimeEnd = "2026-12-31";

  return {
    today: { start: today, end: today, label: "Today" },
    week: { start: last7Days, end: today, label: "Last 7 Days" },
    month: { start: thisMonthStart, end: thisMonthEnd, label: "This Month" },
    lastMonth: { start: lastMonthStart, end: lastMonthEnd, label: "Last Month" },
    ytd: { start: ytdStart, end: today, label: "Year to Date" },
    all: { start: allTimeStart, end: allTimeEnd, label: "All Time" },
  };
};

// In-memory invoice cache by tripId
const globalInvoiceCache = new Map();

// Helper to fetch invoice by Trip ID
const fetchInvoiceByTripId = async (tripId) => {
  if (!tripId) return null;
  const key = String(tripId).trim();
  if (globalInvoiceCache.has(key)) {
    return globalInvoiceCache.get(key);
  }

  try {
    const res = await axios.get(
      `https://0rq0f90i05.execute-api.ap-south-1.amazonaws.com/salesapp/invoice-management/invoice?invoiceId=${encodeURIComponent(
        key
      )}&tripId=${encodeURIComponent(key)}`
    );

    if (res.data && !res.data.error) {
      const inv = Array.isArray(res.data)
        ? res.data[0]
        : res.data.invoices && Array.isArray(res.data.invoices)
          ? res.data.invoices[0]
          : res.data;

      if (inv && (inv.invoiceNumber || inv.invoiceId || inv.pricing)) {
        globalInvoiceCache.set(key, inv);
        return inv;
      }
    }
  } catch (err) {
    // Invoice not found
  }

  globalInvoiceCache.set(key, null);
  return null;
};

// Helper to extract financial amounts from an invoice
const extractInvoiceAmounts = (inv, fallbackBudget = 0) => {
  if (!inv) {
    const budget = parseFloat(fallbackBudget) || 0;
    return {
      hasInvoice: false,
      invoiceNumber: null,
      packageCost: budget,
      receivedAmount: 0,
      pendingAmount: budget,
      status: "No Invoice",
      installments: [],
      rawInvoice: null,
    };
  }

  const installments = Array.isArray(inv.payment?.installments)
    ? inv.payment.installments
    : [];

  const installmentTotal = installments.reduce(
    (sum, inst) => sum + (parseFloat(inst.installmentAmount) || 0),
    0
  );

  const packageCost =
    parseFloat(inv.pricing?.totalAmount) ||
    parseFloat(inv.pricing?.baseAmount) ||
    installmentTotal ||
    parseFloat(fallbackBudget) ||
    0;

  const receivedAmount = installments
    .filter((inst) => (inst.status || "").toLowerCase() === "paid")
    .reduce(
      (sum, inst) => sum + (parseFloat(inst.installmentAmount) || 0),
      0
    );

  const pendingAmount = Math.max(0, packageCost - receivedAmount);

  let statusBadge = inv.status || "Created";
  if (packageCost > 0) {
    if (receivedAmount >= packageCost) statusBadge = "Paid";
    else if (receivedAmount > 0) statusBadge = "Partial Paid";
    else statusBadge = "Pending";
  }

  return {
    hasInvoice: true,
    invoiceNumber: inv.invoiceNumber || inv.invoiceId || "INV",
    packageCost,
    receivedAmount,
    pendingAmount,
    status: statusBadge,
    installments,
    rawInvoice: inv,
  };
};

const TeamDsrReport = ({ teamMembers = [], realUser, onInspect }) => {
  const presets = useMemo(() => getDatePresets(), []);
  const [selectedPreset, setSelectedPreset] = useState("month");
  const [startDate, setStartDate] = useState(presets.month.start);
  const [endDate, setEndDate] = useState(presets.month.end);
  const [viewMode, setViewMode] = useState("sheet"); // 'sheet' (Excel Sheet) | 'table' (Agent Matrix) | 'cards' (Agent Cards)
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [memberStats, setMemberStats] = useState([]);
  const [allEnrichedLeads, setAllEnrichedLeads] = useState([]);
  const [enrichingInvoices, setEnrichingInvoices] = useState(false);

  // Filters for Excel Sheet view
  const [sheetAgentFilter, setSheetAgentFilter] = useState("all");
  const [sheetStageFilter, setSheetStageFilter] = useState("all");
  const [sheetSearchTerm, setSheetSearchTerm] = useState("");

  // Selected Member Details Modal State
  const [selectedMember, setSelectedMember] = useState(null);
  const [memberLeadsLoading, setMemberLeadsLoading] = useState(false);
  const [memberLeadsWithInvoices, setMemberLeadsWithInvoices] = useState([]);
  const [leadStageFilter, setLeadStageFilter] = useState("all");
  const [leadSearchTerm, setLeadSearchTerm] = useState("");
  const [expandedLeadTripId, setExpandedLeadTripId] = useState(null);

  // Handle Preset Change
  const handlePresetSelect = (presetKey) => {
    setSelectedPreset(presetKey);
    if (presetKey !== "custom") {
      setStartDate(presets[presetKey].start);
      setEndDate(presets[presetKey].end);
    }
  };

  // Compile member list including current admin if not in teamMembers
  const compiledMemberList = useMemo(() => {
    const list = [...teamMembers];
    const adminEmail = realUser?.user?.Email || realUser?.Email;
    if (adminEmail && !list.some((m) => m.Email?.toLowerCase() === adminEmail.toLowerCase())) {
      list.unshift({
        fullname: realUser?.user?.FullName || realUser?.FullName || "Admin (You)",
        Email: adminEmail,
        Phone: realUser?.user?.Phone || realUser?.Phone || "",
        Role: "Admin",
        Status: "Active",
      });
    }
    return list;
  }, [teamMembers, realUser]);

  // Fetch DSR Data across all members
  const fetchDsrData = useCallback(async () => {
    const adminEmail = realUser?.user?.Email || realUser?.Email;
    if (!adminEmail) return;

    try {
      setLoading(true);

      const flatLeadsList = [];

      // Process each member
      const memberPromises = compiledMemberList.map(async (member) => {
        const email = member.Email;
        if (!email) return null;

        let createQuoteLeads = [];
        let followUpLeads = [];
        let convertedLeads = [];

        try {
          const [cqRes, fuRes, cvRes] = await Promise.allSettled([
            axios.get(
              `https://0rq0f90i05.execute-api.ap-south-1.amazonaws.com/salesapp/lead-managment/create-quote?salesPersonUid=${encodeURIComponent(
                email
              )}&latestStatus=LeadCreate&case=maxcase`
            ),
            axios.get(
              `https://0rq0f90i05.execute-api.ap-south-1.amazonaws.com/salesapp/lead-managment/create-quote?salesPersonUid=${encodeURIComponent(
                email
              )}&latestStatus=Cold&case=maxcase`
            ),
            axios.get(
              `https://0rq0f90i05.execute-api.ap-south-1.amazonaws.com/salesapp/lead-managment/create-quote?salesPersonUid=${encodeURIComponent(
                email
              )}&latestStatus=Converted`
            ),
          ]);

          if (cqRes.status === "fulfilled" && cqRes.value.data) {
            createQuoteLeads = Array.isArray(cqRes.value.data)
              ? cqRes.value.data
              : Array.isArray(cqRes.value.data.leads)
                ? cqRes.value.data.leads
                : [];
          }

          if (fuRes.status === "fulfilled" && fuRes.value.data) {
            followUpLeads = Array.isArray(fuRes.value.data)
              ? fuRes.value.data
              : Array.isArray(fuRes.value.data.leads)
                ? fuRes.value.data.leads
                : [];
          }

          if (cvRes.status === "fulfilled" && cvRes.value.data) {
            convertedLeads = Array.isArray(cvRes.value.data)
              ? cvRes.value.data
              : Array.isArray(cvRes.value.data.leads)
                ? cvRes.value.data.leads
                : [];
          }
        } catch (e) {
          console.error(`Error fetching leads for ${email}:`, e);
        }

        const memberName = member.fullname || member.FullName || email.split("@")[0];

        // Format all member leads
        const allMemberLeads = [
          ...convertedLeads.map((l) => ({
            ...l,
            stage: "Converted",
            agentName: memberName,
            agentEmail: email,
          })),
          ...followUpLeads.map((l) => ({
            ...l,
            stage: "Follow Up",
            agentName: memberName,
            agentEmail: email,
          })),
          ...createQuoteLeads.map((l) => ({
            ...l,
            stage: "Create Quote",
            agentName: memberName,
            agentEmail: email,
          })),
        ];

        allMemberLeads.forEach((l) => flatLeadsList.push(l));

        // Converted leads invoice fetching by tripId
        let memberPackageCost = 0;
        let memberReceivedAmount = 0;
        let memberInvoicesCount = 0;
        const invoicesFound = [];

        const convertedTripIds = convertedLeads
          .map((l) => l.TripId)
          .filter(Boolean);

        const invoicePromises = convertedTripIds.map(async (tripId) => {
          const inv = await fetchInvoiceByTripId(tripId);
          if (inv) {
            invoicesFound.push(inv);
            const amounts = extractInvoiceAmounts(inv);
            memberPackageCost += amounts.packageCost;
            memberReceivedAmount += amounts.receivedAmount;
            memberInvoicesCount += 1;
          }
        });

        await Promise.allSettled(invoicePromises);

        // Fallback to converted leads budget if no invoices
        if (memberInvoicesCount === 0 && convertedLeads.length > 0) {
          convertedLeads.forEach((l) => {
            const b = parseFloat(l.budget || l["Client-Budget"]) || 0;
            memberPackageCost += b;
          });
        }

        const memberPendingAmount = Math.max(0, memberPackageCost - memberReceivedAmount);
        const assignedCount =
          createQuoteLeads.length + followUpLeads.length + convertedLeads.length;
        const conversionRate =
          assignedCount > 0
            ? ((convertedLeads.length / assignedCount) * 100).toFixed(1)
            : "0.0";
        const collectionRate =
          memberPackageCost > 0
            ? ((memberReceivedAmount / memberPackageCost) * 100).toFixed(1)
            : "0.0";

        return {
          member,
          name: memberName,
          email,
          phone: member.Phone || member.Contact || "N/A",
          status: member.subscription_status || member.Status || "Active",
          createQuoteCount: createQuoteLeads.length,
          followUpCount: followUpLeads.length,
          convertedCount: convertedLeads.length,
          assignedCount,
          conversionRate,
          invoicesCount: memberInvoicesCount,
          packageCost: memberPackageCost,
          receivedAmount: memberReceivedAmount,
          pendingAmount: memberPendingAmount,
          collectionRate,
          invoices: invoicesFound,
          convertedLeads,
          followUpLeads,
          createQuoteLeads,
          allLeads: allMemberLeads,
        };
      });

      const results = (await Promise.all(memberPromises)).filter(Boolean);
      setMemberStats(results);

      // Now enrich all leads with invoice data for the Excel sheet
      setEnrichingInvoices(true);
      const enrichedPromises = flatLeadsList.map(async (lead) => {
        const tripId = lead.TripId;
        const budget = parseFloat(lead.budget || lead["Client-Budget"]) || 0;
        let inv = null;
        if (tripId) {
          inv = await fetchInvoiceByTripId(tripId);
        }
        const amounts = extractInvoiceAmounts(inv, budget);
        return {
          ...lead,
          invoiceInfo: amounts,
        };
      });

      const enriched = await Promise.all(enrichedPromises);
      setAllEnrichedLeads(enriched);
      setEnrichingInvoices(false);
    } catch (err) {
      console.error("DSR report generation error:", err);
      toast.error("Failed to compile complete DSR telemetry.");
    } finally {
      setLoading(false);
    }
  }, [realUser, compiledMemberList]);

  useEffect(() => {
    fetchDsrData();
  }, [fetchDsrData]);

  // Overall Company Aggregates
  const totals = useMemo(() => {
    return memberStats.reduce(
      (acc, s) => {
        acc.assigned += s.assignedCount;
        acc.createQuote += s.createQuoteCount;
        acc.followUp += s.followUpCount;
        acc.converted += s.convertedCount;
        acc.packageCost += s.packageCost;
        acc.received += s.receivedAmount;
        acc.pending += s.pendingAmount;
        acc.invoicesCount += s.invoicesCount;
        return acc;
      },
      {
        assigned: 0,
        createQuote: 0,
        followUp: 0,
        converted: 0,
        packageCost: 0,
        received: 0,
        pending: 0,
        invoicesCount: 0,
      }
    );
  }, [memberStats]);

  const overallConversionRate = useMemo(() => {
    if (totals.assigned === 0) return "0.0";
    return ((totals.converted / totals.assigned) * 100).toFixed(1);
  }, [totals]);

  const overallCollectionRate = useMemo(() => {
    if (totals.packageCost === 0) return "0.0";
    return ((totals.received / totals.packageCost) * 100).toFixed(1);
  }, [totals]);

  // Filtered members for Agent Summary Table & Cards
  const filteredMemberStats = useMemo(() => {
    if (!searchTerm.trim()) return memberStats;
    const term = searchTerm.toLowerCase();
    return memberStats.filter(
      (s) =>
        s.name.toLowerCase().includes(term) ||
        s.email.toLowerCase().includes(term)
    );
  }, [memberStats, searchTerm]);

  // Filtered Leads for the Excel Sheet View
  const filteredSheetLeads = useMemo(() => {
    let list = allEnrichedLeads;

    // Filter by agent
    if (sheetAgentFilter !== "all") {
      list = list.filter((l) => l.agentEmail === sheetAgentFilter);
    }

    // Filter by stage
    if (sheetStageFilter !== "all") {
      list = list.filter((l) => {
        if (sheetStageFilter === "converted") return l.stage === "Converted";
        if (sheetStageFilter === "followup") return l.stage === "Follow Up";
        if (sheetStageFilter === "createquote") return l.stage === "Create Quote";
        return true;
      });
    }

    // Search term filter
    if (sheetSearchTerm.trim()) {
      const term = sheetSearchTerm.toLowerCase();
      list = list.filter((l) => {
        const clientName = (l.clientName || l["Client-Name"] || "").toLowerCase();
        const contact = (l.clientContact || l["Client-Contact"] || l.phone || "").toLowerCase();
        const email = (l.clientEmail || l["Client-Email"] || l.email || "").toLowerCase();
        const destination = (l.destination || l["Client-Destination"] || "").toLowerCase();
        const tripId = String(l.TripId || "").toLowerCase();
        const agent = (l.agentName || "").toLowerCase();
        return (
          clientName.includes(term) ||
          contact.includes(term) ||
          email.includes(term) ||
          destination.includes(term) ||
          tripId.includes(term) ||
          agent.includes(term)
        );
      });
    }

    return list;
  }, [allEnrichedLeads, sheetAgentFilter, sheetStageFilter, sheetSearchTerm]);

  // Aggregates for the currently filtered Excel Sheet leads
  const sheetTotals = useMemo(() => {
    return filteredSheetLeads.reduce(
      (acc, lead) => {
        const pax = parseInt(lead.pax || lead["Client-Pax"]) || 0;
        const child = parseInt(lead.child || lead["Client-Child"]) || 0;
        const infant = parseInt(lead.infant || lead["Client-Infant"]) || 0;
        const info = lead.invoiceInfo || extractInvoiceAmounts(null);

        acc.totalPax += pax;
        acc.totalChild += child;
        acc.totalInfant += infant;
        acc.totalPackageCost += info.packageCost;
        acc.totalReceived += info.receivedAmount;
        acc.totalPending += info.pendingAmount;
        return acc;
      },
      {
        totalPax: 0,
        totalChild: 0,
        totalInfant: 0,
        totalPackageCost: 0,
        totalReceived: 0,
        totalPending: 0,
      }
    );
  }, [filteredSheetLeads]);

  // When a member is clicked, fetch invoices for all their leads by tripId
  const handleOpenMemberDetail = async (stat) => {
    setSelectedMember(stat);
    setMemberLeadsLoading(true);
    setLeadStageFilter("all");
    setLeadSearchTerm("");
    setExpandedLeadTripId(null);

    const allLeads = stat.allLeads || [];

    const enrichedLeadsPromises = allLeads.map(async (lead) => {
      const tripId = lead.TripId;
      const budget = parseFloat(lead.budget || lead["Client-Budget"]) || 0;
      let inv = null;

      if (tripId) {
        inv = await fetchInvoiceByTripId(tripId);
      }

      const amounts = extractInvoiceAmounts(inv, budget);
      return {
        ...lead,
        invoiceInfo: amounts,
      };
    });

    const enrichedLeads = await Promise.all(enrichedLeadsPromises);
    setMemberLeadsWithInvoices(enrichedLeads);
    setMemberLeadsLoading(false);
  };

  // Detailed totals for the selected member dynamically calculated from enriched leads
  const selectedMemberLiveTotals = useMemo(() => {
    if (!selectedMember) return null;

    let packageCost = 0;
    let receivedAmount = 0;
    let invoicesCount = 0;

    memberLeadsWithInvoices.forEach((lead) => {
      const info = lead.invoiceInfo;
      if (info) {
        packageCost += info.packageCost;
        receivedAmount += info.receivedAmount;
        if (info.hasInvoice) invoicesCount++;
      }
    });

    const pendingAmount = Math.max(0, packageCost - receivedAmount);
    const collectionRate =
      packageCost > 0
        ? ((receivedAmount / packageCost) * 100).toFixed(1)
        : "0.0";

    return {
      packageCost,
      receivedAmount,
      pendingAmount,
      invoicesCount,
      collectionRate,
    };
  }, [selectedMember, memberLeadsWithInvoices]);

  // Filtered leads inside the member detail modal
  const filteredMemberLeads = useMemo(() => {
    let list = memberLeadsWithInvoices;

    if (leadStageFilter !== "all") {
      list = list.filter((l) => {
        if (leadStageFilter === "converted") return l.stage === "Converted";
        if (leadStageFilter === "followup") return l.stage === "Follow Up";
        if (leadStageFilter === "createquote") return l.stage === "Create Quote";
        return true;
      });
    }

    if (leadSearchTerm.trim()) {
      const term = leadSearchTerm.toLowerCase();
      list = list.filter((l) => {
        const clientName = (l.clientName || l["Client-Name"] || "").toLowerCase();
        const tripId = String(l.TripId || "").toLowerCase();
        const destination = (l.destination || l["Client-Destination"] || "").toLowerCase();
        const phone = (l.clientContact || l["Client-Contact"] || "").toLowerCase();
        return (
          clientName.includes(term) ||
          tripId.includes(term) ||
          destination.includes(term) ||
          phone.includes(term)
        );
      });
    }

    return list;
  }, [memberLeadsWithInvoices, leadStageFilter, leadSearchTerm]);

  // Export Complete Leads Excel Sheet (.CSV)
  const handleExportLeadsExcel = (leadsToExport = filteredSheetLeads, fileNamePrefix = "DSR_Leads_Report") => {
    if (leadsToExport.length === 0) {
      toast.info("No leads available to export");
      return;
    }

    const headers = [
      "Trip ID",
      "Client Name",
      "Mobile / Contact",
      "Email",
      "Destination",
      "Travel Date",
      "Pax (Adults)",
      "Child",
      "Infant",
      "Assigned Agent",
      "Lead Stage",
      "Invoice Number",
      "Package Cost (INR)",
      "Receiving / Received (INR)",
      "Pending Money (INR)",
      "Payment Status",
    ];

    const rows = leadsToExport.map((lead) => {
      const info = lead.invoiceInfo || extractInvoiceAmounts(null);
      const pax = parseInt(lead.pax || lead["Client-Pax"]) || 0;
      const child = parseInt(lead.child || lead["Client-Child"]) || 0;
      const infant = parseInt(lead.infant || lead["Client-Infant"]) || 0;

      return [
        `"${lead.TripId || "N/A"}"`,
        `"${lead.clientName || lead["Client-Name"] || "Client"}"`,
        `"${lead.clientContact || lead["Client-Contact"] || lead.phone || "N/A"}"`,
        `"${lead.clientEmail || lead["Client-Email"] || lead.email || "N/A"}"`,
        `"${lead.destination || lead["Client-Destination"] || "N/A"}"`,
        `"${lead.travelDate || lead["Client-TravelDate"] || "N/A"}"`,
        pax,
        child,
        infant,
        `"${lead.agentName || lead.salesPersonUid || "Agent"}"`,
        `"${lead.stage || "N/A"}"`,
        `"${info.invoiceNumber || "No Invoice"}"`,
        info.packageCost,
        info.receivedAmount,
        info.pendingAmount,
        `"${info.status || "Pending"}"`,
      ];
    });

    // Add totals row
    rows.push([
      `"TOTAL"`,
      `"${leadsToExport.length} Clients"`,
      `""`,
      `""`,
      `""`,
      `""`,
      sheetTotals.totalPax,
      sheetTotals.totalChild,
      sheetTotals.totalInfant,
      `"All Agents"`,
      `""`,
      `""`,
      sheetTotals.totalPackageCost,
      sheetTotals.totalReceived,
      sheetTotals.totalPending,
      `""`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${fileNamePrefix}_${startDate}_to_${endDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Excel Leads Spreadsheet exported successfully! 📊");
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* ----------------- Top Controls & Filter Bar ----------------- */}
      {/* <div className="bg-white rounded-3xl p-6 border-2 border-slate-100 shadow-sm flex flex-col xl:flex-row xl:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <span className="p-2.5 rounded-2xl bg-emerald-50 text-emerald-700">
              <FileSpreadsheet size={22} />
            </span>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">
              DSR Leads & Financial Telemetry
            </h2>
            <span className="bg-emerald-50 text-emerald-700 font-black text-[10px] tracking-wider uppercase px-2.5 py-1 rounded-full border border-emerald-200 flex items-center gap-1">
              <Sparkles size={11} /> Excel Grid Mode
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium">
            Full Excel sheet with Client Name, Mobile, Email, Destination, Travel Date, Pax/Child/Infant, Package Cost, Receiving & Pending by Trip ID
          </p>
        </div>


        <div className="flex flex-wrap items-center gap-3">
          <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200">
            {Object.keys(presets).map((key) => (
              <button
                key={key}
                onClick={() => handlePresetSelect(key)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${selectedPreset === key
                    ? "bg-white text-emerald-700 shadow-sm"
                    : "text-slate-500 hover:text-slate-800"
                  }`}
              >
                {presets[key].label}
              </button>
            ))}
            <button
              onClick={() => setSelectedPreset("custom")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${selectedPreset === "custom"
                  ? "bg-white text-emerald-700 shadow-sm"
                  : "text-slate-500 hover:text-slate-800"
                }`}
            >
              Custom
            </button>
          </div>

          {selectedPreset === "custom" && (
            <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-2xl border border-slate-200">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-transparent text-xs font-semibold text-slate-700 outline-none"
              />
              <span className="text-slate-400 text-xs">to</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-transparent text-xs font-semibold text-slate-700 outline-none"
              />
            </div>
          )}


          <button
            onClick={fetchDsrData}
            disabled={loading}
            className="p-3 bg-emerald-50 text-emerald-700 rounded-2xl hover:bg-emerald-100 transition-all active:scale-95 border border-emerald-200 flex items-center justify-center disabled:opacity-50"
            title="Refresh DSR Telemetry"
          >
            <RefreshCw size={16} className={loading || enrichingInvoices ? "animate-spin" : ""} />
          </button>

          <button
            onClick={() => handleExportLeadsExcel(filteredSheetLeads)}
            className="flex items-center gap-2 px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-black uppercase tracking-wider transition-all shadow-md active:scale-95 shadow-emerald-200"
          >
            <FileSpreadsheet size={15} />
            Export Excel (CSV)
          </button>
        </div>
      </div> */}

      {/* ----------------- KPI Summary Ribbon ----------------- */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* Total Leads */}
        <div className="bg-white rounded-2xl p-5 border-2 border-slate-100 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
              Total Clients
            </span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Users size={16} />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 leading-none mb-1">
            {allEnrichedLeads.length}
          </div>
          <span className="text-[10px] font-bold text-slate-500">
            Across all pipeline stages
          </span>
        </div>

        {/* Converted Deals */}
        <div className="bg-white rounded-2xl p-5 border-2 border-slate-100 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
              Converted
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 size={16} />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-600 leading-none mb-1 flex items-baseline gap-2">
            {totals.converted}
            <span className="text-xs font-black text-slate-500">
              ({overallConversionRate}%)
            </span>
          </div>
          <span className="text-[10px] font-bold text-emerald-600">
            Win rate across team
          </span>
        </div>

        {/* Pax Count */}
        <div className="bg-white rounded-2xl p-5 border-2 border-slate-100 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
              Total Pax / Travelers
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <User size={16} />
            </div>
          </div>
          <div className="text-2xl font-black text-blue-600 leading-none mb-1">
            {sheetTotals.totalPax}
          </div>
          <span className="text-[10px] font-bold text-blue-600">
            +{sheetTotals.totalChild} Child · +{sheetTotals.totalInfant} Infant
          </span>
        </div>

        {/* Total Package Value */}
        <div className="bg-white rounded-2xl p-5 border-2 border-slate-100 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
              Package Cost
            </span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Receipt size={16} />
            </div>
          </div>
          <div className="text-xl font-black text-slate-900 leading-none mb-1 truncate" title={formatINR(sheetTotals.totalPackageCost)}>
            {formatINR(sheetTotals.totalPackageCost)}
          </div>
          <span className="text-[10px] font-bold text-slate-500">
            From Trip ID invoices
          </span>
        </div>

        {/* Amount Received */}
        <div className="bg-white rounded-2xl p-5 border-2 border-slate-100 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
              Receiving (Paid)
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <DollarSign size={16} />
            </div>
          </div>
          <div className="text-xl font-black text-emerald-600 leading-none mb-1 truncate" title={formatINR(sheetTotals.totalReceived)}>
            {formatINR(sheetTotals.totalReceived)}
          </div>
          <span className="text-[10px] font-bold text-emerald-700">
            Actual cash collected
          </span>
        </div>

        {/* Pending Balance */}
        <div className="bg-white rounded-2xl p-5 border-2 border-slate-100 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
              Pending Balance
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <AlertCircle size={16} />
            </div>
          </div>
          <div className="text-xl font-black text-amber-600 leading-none mb-1 truncate" title={formatINR(sheetTotals.totalPending)}>
            {formatINR(sheetTotals.totalPending)}
          </div>
          <span className="text-[10px] font-bold text-amber-700">
            Remaining balance
          </span>
        </div>
      </div>

      {/* ----------------- View Mode Switcher Header ----------------- */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        {/* View Mode Tabs */}
        <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200 text-xs font-bold w-full md:w-auto">
          <button
            onClick={() => setViewMode("sheet")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all ${viewMode === "sheet"
              ? "bg-emerald-600 text-white shadow-md font-black"
              : "text-slate-600 hover:text-slate-900"
              }`}
          >
            <FileSpreadsheet size={15} />
            Excel Leads Sheet
          </button>
          <button
            onClick={() => setViewMode("table")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all ${viewMode === "table"
              ? "bg-white text-purple-700 shadow-md font-black"
              : "text-slate-600 hover:text-slate-900"
              }`}
          >
            <TableIcon size={15} />
            Agent Matrix
          </button>
          <button
            onClick={() => setViewMode("cards")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all ${viewMode === "cards"
              ? "bg-white text-purple-700 shadow-md font-black"
              : "text-slate-600 hover:text-slate-900"
              }`}
          >
            <LayoutGrid size={15} />
            Agent Cards
          </button>
        </div>

        {/* View Mode Context Filters */}
        {viewMode === "sheet" ? (
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
            {/* Agent Dropdown */}
            <select
              value={sheetAgentFilter}
              onChange={(e) => setSheetAgentFilter(e.target.value)}
              className="bg-white border-2 border-slate-100 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 outline-none shadow-2xs focus:border-emerald-300"
            >
              <option value="all">All Agents ({compiledMemberList.length})</option>
              {compiledMemberList.map((m) => (
                <option key={m.Email} value={m.Email}>
                  {m.fullname || m.FullName || m.Email}
                </option>
              ))}
            </select>

            {/* Stage Dropdown */}
            <select
              value={sheetStageFilter}
              onChange={(e) => setSheetStageFilter(e.target.value)}
              className="bg-white border-2 border-slate-100 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 outline-none shadow-2xs focus:border-emerald-300"
            >
              <option value="all">All Stages</option>
              <option value="converted">Converted Only</option>
              <option value="followup">Follow Up Only</option>
              <option value="createquote">New Quote Only</option>
            </select>

            {/* Sheet Search */}
            <div className="relative w-full sm:w-64">
              <Search
                size={14}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                placeholder="Search client, mobile, destination..."
                value={sheetSearchTerm}
                onChange={(e) => setSheetSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-white border-2 border-slate-100 rounded-xl text-xs font-semibold focus:outline-none focus:border-emerald-300 shadow-2xs"
              />
            </div>
          </div>
        ) : (
          <div className="relative w-full sm:w-72">
            <Search
              size={14}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              placeholder="Filter agent by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 bg-white border-2 border-slate-100 rounded-xl text-xs font-semibold focus:outline-none focus:border-purple-300 shadow-2xs"
            />
          </div>
        )}
      </div>

      {/* ----------------- MAIN VIEW RENDER ----------------- */}
      {loading ? (
        <div className="py-24 bg-white rounded-3xl border-2 border-slate-100 flex flex-col items-center justify-center">
          <div className="w-12 h-12 border-4 border-emerald-100 border-t-emerald-600 rounded-full animate-spin mb-4"></div>
          <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">
            Compiling Complete Leads & Invoice Excel Spreadsheet...
          </p>
        </div>
      ) : viewMode === "sheet" ? (
        /* ==================== 1. EXCEL LEADS SHEET VIEW ==================== */
        <div className="bg-white rounded-3xl border-2 border-slate-100 shadow-sm overflow-hidden animate-in fade-in duration-300">
          <div className="p-4 bg-emerald-50/60 border-b border-emerald-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileSpreadsheet size={18} className="text-emerald-700" />
              <span className="font-black text-slate-900 text-sm">
                Spreadsheet Leads Ledger
              </span>
              <span className="text-xs text-slate-500 font-medium">
                ({filteredSheetLeads.length} rows loaded)
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleExportLeadsExcel(filteredSheetLeads)}
                className="px-3.5 py-1.5 bg-white border border-emerald-300 hover:bg-emerald-50 text-emerald-800 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-2xs"
              >
                <Download size={13} />
                Download Spreadsheet (.CSV)
              </button>
            </div>
          </div>

          <div className="overflow-x-auto max-h-[70vh]">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="sticky top-0 z-20 bg-slate-100 text-[10px] font-black uppercase tracking-wider text-slate-500 shadow-2xs border-b border-slate-200">
                <tr>
                  <th className="py-3 px-3 w-12 text-center bg-slate-100">#</th>
                  <th className="py-3 px-3 bg-slate-100">Trip ID</th>
                  <th className="py-3 px-4 bg-slate-100">Client Name</th>
                  <th className="py-3 px-4 bg-slate-100">Mobile / Contact</th>
                  <th className="py-3 px-4 bg-slate-100">Email</th>
                  <th className="py-3 px-4 bg-slate-100">Destination</th>
                  <th className="py-3 px-3 bg-slate-100 text-center">Travel Date</th>
                  <th className="py-3 px-2 bg-slate-100 text-center">Pax</th>
                  <th className="py-3 px-2 bg-slate-100 text-center">Child</th>
                  <th className="py-3 px-2 bg-slate-100 text-center">Infant</th>
                  <th className="py-3 px-3 bg-slate-100">Agent</th>
                  <th className="py-3 px-3 bg-slate-100 text-center">Stage</th>
                  <th className="py-3 px-4 bg-slate-100 text-right font-black">Package Cost</th>
                  <th className="py-3 px-4 bg-slate-100 text-right font-black text-emerald-700">Receiving</th>
                  <th className="py-3 px-4 bg-slate-100 text-right font-black text-amber-700">Pending</th>
                  <th className="py-3 px-3 bg-slate-100 text-center">Status</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filteredSheetLeads.length === 0 ? (
                  <tr>
                    <td colSpan={16} className="py-16 text-center text-slate-400 font-medium">
                      No leads match the selected filter.
                    </td>
                  </tr>
                ) : (
                  filteredSheetLeads.map((lead, idx) => {
                    const info = lead.invoiceInfo || extractInvoiceAmounts(null);
                    const clientName = lead.clientName || lead["Client-Name"] || "Client";
                    const contact = lead.clientContact || lead["Client-Contact"] || lead.phone || lead.contact || "—";
                    const email = lead.clientEmail || lead["Client-Email"] || lead.email || "—";
                    const destination = lead.destination || lead["Client-Destination"] || "—";
                    const travelDate = lead.travelDate || lead["Client-TravelDate"] || "—";
                    const pax = parseInt(lead.pax || lead["Client-Pax"]) || 0;
                    const child = parseInt(lead.child || lead["Client-Child"]) || 0;
                    const infant = parseInt(lead.infant || lead["Client-Infant"]) || 0;

                    return (
                      <tr
                        key={lead.TripId || idx}
                        className="hover:bg-emerald-50/30 transition-colors odd:bg-white even:bg-slate-50/40"
                      >
                        <td className="py-2.5 px-3 text-center text-slate-400 font-bold text-[11px]">
                          {idx + 1}
                        </td>
                        <td className="py-2.5 px-3 font-mono font-bold text-purple-700 whitespace-nowrap">
                          {lead.TripId ? `#${lead.TripId}` : "—"}
                        </td>
                        <td className="py-2.5 px-4 font-bold text-slate-900 whitespace-nowrap">
                          {clientName}
                        </td>
                        <td className="py-2.5 px-4 font-medium text-slate-600 whitespace-nowrap">
                          {contact !== "—" ? (
                            <a
                              href={`tel:${contact}`}
                              className="hover:text-emerald-600 transition-colors flex items-center gap-1"
                            >
                              <Phone size={11} className="text-slate-400" /> {contact}
                            </a>
                          ) : (
                            "—"
                          )}
                        </td>
                        <td className="py-2.5 px-4 font-medium text-slate-500 whitespace-nowrap">
                          {email !== "—" ? (
                            <a
                              href={`mailto:${email}`}
                              className="hover:text-emerald-600 transition-colors flex items-center gap-1"
                            >
                              <Mail size={11} className="text-slate-400" /> {email}
                            </a>
                          ) : (
                            "—"
                          )}
                        </td>
                        <td className="py-2.5 px-4 font-bold text-slate-800 whitespace-nowrap">
                          {destination}
                        </td>
                        <td className="py-2.5 px-3 text-center text-slate-600 whitespace-nowrap font-medium text-[11px]">
                          {travelDate}
                        </td>
                        <td className="py-2.5 px-2 text-center font-bold text-slate-800">
                          {pax}
                        </td>
                        <td className="py-2.5 px-2 text-center font-bold text-slate-500">
                          {child}
                        </td>
                        <td className="py-2.5 px-2 text-center font-bold text-slate-400">
                          {infant}
                        </td>
                        <td className="py-2.5 px-3 font-medium text-slate-700 whitespace-nowrap">
                          <span className="px-2 py-0.5 rounded bg-slate-100 text-[11px] font-bold">
                            {lead.agentName || "Agent"}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-center whitespace-nowrap">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${lead.stage === "Converted"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : lead.stage === "Follow Up"
                                ? "bg-blue-50 text-blue-700 border-blue-200"
                                : "bg-purple-50 text-purple-700 border-purple-200"
                              }`}
                          >
                            {lead.stage}
                          </span>
                        </td>
                        <td className="py-2.5 px-4 text-right font-black text-slate-900 whitespace-nowrap font-mono">
                          {formatINR(info.packageCost)}
                        </td>
                        <td className="py-2.5 px-4 text-right font-black text-emerald-600 whitespace-nowrap font-mono">
                          {formatINR(info.receivedAmount)}
                        </td>
                        <td className="py-2.5 px-4 text-right font-black text-amber-600 whitespace-nowrap font-mono">
                          {formatINR(info.pendingAmount)}
                        </td>
                        <td className="py-2.5 px-3 text-center whitespace-nowrap">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${info.hasInvoice
                              ? info.status === "Paid"
                                ? "bg-emerald-100 text-emerald-800 font-black"
                                : "bg-purple-100 text-purple-800 font-black"
                              : "bg-slate-100 text-slate-500"
                              }`}
                          >
                            {info.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>

              {/* Sticky / Bold Total Footer */}
              <tfoot className="sticky bottom-0 z-20 bg-slate-100 border-t-2 border-slate-300 text-xs font-black text-slate-900 shadow-lg">
                <tr>
                  <td colSpan={6} className="py-3 px-4 uppercase tracking-wider text-slate-600">
                    Total Summary ({filteredSheetLeads.length} Clients)
                  </td>
                  <td className="py-3 px-3 text-center text-slate-500">—</td>
                  <td className="py-3 px-2 text-center text-slate-900">{sheetTotals.totalPax}</td>
                  <td className="py-3 px-2 text-center text-slate-600">{sheetTotals.totalChild}</td>
                  <td className="py-3 px-2 text-center text-slate-400">{sheetTotals.totalInfant}</td>
                  <td className="py-3 px-3 text-slate-500">—</td>
                  <td className="py-3 px-3 text-slate-500 text-center">—</td>
                  <td className="py-3 px-4 text-right text-slate-900 font-mono">
                    {formatINR(sheetTotals.totalPackageCost)}
                  </td>
                  <td className="py-3 px-4 text-right text-emerald-600 font-mono">
                    {formatINR(sheetTotals.totalReceived)}
                  </td>
                  <td className="py-3 px-4 text-right text-amber-600 font-mono">
                    {formatINR(sheetTotals.totalPending)}
                  </td>
                  <td className="py-3 px-3 text-center text-slate-500 text-[10px]">
                    {sheetTotals.totalPackageCost > 0
                      ? `${((sheetTotals.totalReceived / sheetTotals.totalPackageCost) * 100).toFixed(1)}% Paid`
                      : "—"}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      ) : viewMode === "table" ? (
        /* ==================== 2. AGENT MATRIX TABLE VIEW ==================== */
        <div className="bg-white rounded-3xl border-2 border-slate-100 shadow-sm overflow-hidden animate-in fade-in duration-300">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/75 border-b border-slate-100 text-[10px] font-black uppercase tracking-wider text-slate-400">
                  <th className="py-4 px-6">Agent (Click to inspect leads)</th>
                  <th className="py-4 px-4 text-center">Assigned</th>
                  <th className="py-4 px-4 text-center">New Quote</th>
                  <th className="py-4 px-4 text-center">Follow Up</th>
                  <th className="py-4 px-4 text-center">Converted</th>
                  <th className="py-4 px-4 text-center">Conversion %</th>
                  <th className="py-4 px-4 text-right">Package Cost</th>
                  <th className="py-4 px-4 text-right">Received</th>
                  <th className="py-4 px-4 text-right">Pending</th>
                  <th className="py-4 px-6 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredMemberStats.map((stat) => (
                  <tr
                    key={stat.email}
                    onClick={() => handleOpenMemberDetail(stat)}
                    className="hover:bg-purple-50/40 cursor-pointer transition-colors group"
                  >
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-linear-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-black text-sm shadow-md ring-2 ring-purple-100 group-hover:scale-105 transition-transform">
                          {stat.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-extrabold text-slate-900 text-sm group-hover:text-purple-600 transition-colors flex items-center gap-1.5">
                            {stat.name}
                            <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 text-purple-600 transition-opacity" />
                          </div>
                          <div className="text-slate-400 text-[11px] font-medium">
                            {stat.email}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-4 text-center font-black text-slate-900">
                      <span className="inline-block px-2.5 py-1 rounded-xl bg-slate-100 text-slate-700">
                        {stat.assignedCount}
                      </span>
                    </td>

                    <td className="py-4 px-4 text-center font-bold text-slate-600">
                      {stat.createQuoteCount}
                    </td>

                    <td className="py-4 px-4 text-center font-bold text-slate-600">
                      {stat.followUpCount}
                    </td>

                    <td className="py-4 px-4 text-center font-black text-emerald-600">
                      <span className="inline-block px-2.5 py-1 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-100">
                        {stat.convertedCount}
                      </span>
                    </td>

                    <td className="py-4 px-4 text-center">
                      <div className="flex flex-col items-center">
                        <span className="font-extrabold text-slate-900">
                          {stat.conversionRate}%
                        </span>
                        <div className="w-16 bg-slate-100 h-1.5 rounded-full overflow-hidden mt-1">
                          <div
                            className="bg-emerald-500 h-full rounded-full"
                            style={{
                              width: `${Math.min(100, parseFloat(stat.conversionRate))}%`,
                            }}
                          ></div>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-4 text-right font-black text-slate-900 font-mono">
                      {formatINR(stat.packageCost)}
                      <div className="text-[10px] text-slate-400 font-semibold font-sans">
                        {stat.invoicesCount} inv.
                      </div>
                    </td>

                    <td className="py-4 px-4 text-right font-black text-emerald-600 font-mono">
                      {formatINR(stat.receivedAmount)}
                      <div className="text-[10px] text-emerald-700 font-semibold font-sans">
                        {stat.collectionRate}% coll.
                      </div>
                    </td>

                    <td className="py-4 px-4 text-right font-black text-amber-600 font-mono">
                      {formatINR(stat.pendingAmount)}
                    </td>

                    <td className="py-4 px-6 text-center" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleOpenMemberDetail(stat)}
                          className="px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-600 hover:text-white text-purple-700 font-bold text-xs transition-all flex items-center gap-1.5 shadow-2xs"
                        >
                          <FileText size={13} />
                          Leads & Invoices
                        </button>
                        {onInspect && (
                          <button
                            onClick={() => onInspect(stat.member)}
                            className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-all"
                            title="Inspect Agent Profile"
                          >
                            <Eye size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>

              <tfoot>
                <tr className="bg-slate-50 font-black text-xs text-slate-900 border-t-2 border-slate-200">
                  <td className="py-4 px-6 uppercase tracking-wider text-slate-500">
                    Fleet Totals ({filteredMemberStats.length} Agents)
                  </td>
                  <td className="py-4 px-4 text-center">{totals.assigned}</td>
                  <td className="py-4 px-4 text-center">{totals.createQuote}</td>
                  <td className="py-4 px-4 text-center">{totals.followUp}</td>
                  <td className="py-4 px-4 text-center text-emerald-600">
                    {totals.converted}
                  </td>
                  <td className="py-4 px-4 text-center text-emerald-600">
                    {overallConversionRate}%
                  </td>
                  <td className="py-4 px-4 text-right font-mono">
                    {formatINR(totals.packageCost)}
                  </td>
                  <td className="py-4 px-4 text-right text-emerald-600 font-mono">
                    {formatINR(totals.received)}
                  </td>
                  <td className="py-4 px-4 text-right text-amber-600 font-mono">
                    {formatINR(totals.pending)}
                  </td>
                  <td className="py-4 px-6 text-center">
                    <span className="text-[10px] uppercase font-bold text-slate-400">
                      {overallCollectionRate}% Paid
                    </span>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      ) : (
        /* ==================== 3. AGENT CARDS VIEW ==================== */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 animate-in fade-in duration-300">
          {filteredMemberStats.map((stat) => (
            <div
              key={stat.email}
              onClick={() => handleOpenMemberDetail(stat)}
              className="bg-white rounded-[2rem] p-6 border-2 border-slate-100 hover:border-purple-300 cursor-pointer shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-start justify-between mb-5">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-linear-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-black text-lg shadow-md ring-4 ring-purple-50 group-hover:scale-105 transition-transform">
                      {stat.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-black text-slate-900 text-base group-hover:text-purple-600 transition-colors flex items-center gap-1.5">
                        {stat.name}
                        <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 text-purple-600 transition-opacity" />
                      </h4>
                      <p className="text-slate-400 text-xs font-medium truncate max-w-[170px]">
                        {stat.email}
                      </p>
                    </div>
                  </div>

                  <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-50 text-purple-700 border border-purple-100">
                    {stat.conversionRate}% Win
                  </span>
                </div>

                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 mb-5">
                  <div className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-3 flex items-center justify-between">
                    <span>Lead Telemetry</span>
                    <span className="text-slate-900 font-bold">{stat.assignedCount} Assigned</span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="bg-white p-2.5 rounded-xl border border-slate-100 shadow-2xs">
                      <div className="text-xs text-slate-400 font-bold mb-0.5">
                        New Quote
                      </div>
                      <div className="text-sm font-black text-slate-900">
                        {stat.createQuoteCount}
                      </div>
                    </div>

                    <div className="bg-white p-2.5 rounded-xl border border-slate-100 shadow-2xs">
                      <div className="text-xs text-slate-400 font-bold mb-0.5">
                        Follow Up
                      </div>
                      <div className="text-sm font-black text-slate-900">
                        {stat.followUpCount}
                      </div>
                    </div>

                    <div className="bg-emerald-50 p-2.5 rounded-xl border border-emerald-100 shadow-2xs">
                      <div className="text-xs text-emerald-700 font-bold mb-0.5">
                        Converted
                      </div>
                      <div className="text-sm font-black text-emerald-700">
                        {stat.convertedCount}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 mb-5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500 font-medium">Package Cost:</span>
                    <span className="font-extrabold text-slate-900 font-mono">
                      {formatINR(stat.packageCost)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500 font-medium">Received Money:</span>
                    <span className="font-extrabold text-emerald-600 font-mono">
                      {formatINR(stat.receivedAmount)} ({stat.collectionRate}%)
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500 font-medium">Pending Balance:</span>
                    <span className="font-extrabold text-amber-600 font-mono">
                      {formatINR(stat.pendingAmount)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={() => handleOpenMemberDetail(stat)}
                  className="flex-1 py-2.5 rounded-xl bg-purple-50 text-purple-700 hover:bg-purple-600 hover:text-white font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-2xs"
                >
                  <FileText size={14} />
                  View Leads & Invoices
                </button>
                {onInspect && (
                  <button
                    onClick={() => onInspect(stat.member)}
                    className="p-2.5 rounded-xl bg-slate-900 text-white hover:bg-slate-800 transition-all"
                    title="Inspect Dashboard as Agent"
                  >
                    <Eye size={16} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ----------------- COMPREHENSIVE MEMBER LEADS & INVOICES MODAL ----------------- */}
      {selectedMember && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-6xl shadow-2xl max-h-[94vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-linear-to-br from-emerald-600 to-teal-700 text-white font-black text-xl flex items-center justify-center shadow-lg ring-4 ring-emerald-50">
                  {selectedMember.name.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-black text-slate-900">
                      {selectedMember.name} — Leads & Financial Ledger
                    </h3>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800">
                      {selectedMember.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium flex items-center gap-3 mt-0.5">
                    <span className="flex items-center gap-1">
                      <Mail size={12} /> {selectedMember.email}
                    </span>
                    {selectedMember.phone && (
                      <span className="flex items-center gap-1">
                        <Phone size={12} /> {selectedMember.phone}
                      </span>
                    )}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleExportLeadsExcel(filteredMemberLeads, `DSR_${selectedMember.name.replace(/\s+/g, "_")}`)}
                  className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
                >
                  <Download size={14} />
                  Export Agent Excel
                </button>
                {onInspect && (
                  <button
                    onClick={() => {
                      onInspect(selectedMember.member);
                      setSelectedMember(null);
                    }}
                    className="px-3.5 py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
                  >
                    <Eye size={14} />
                    Inspect
                  </button>
                )}
                <button
                  onClick={() => setSelectedMember(null)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Modal Sub-Header: Live Financial Ribbon */}
            <div className="bg-slate-50/50 p-6 border-b border-slate-100">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-2xs">
                  <div className="text-[10px] font-black uppercase text-slate-400 mb-1">
                    Assigned Leads
                  </div>
                  <div className="text-xl font-black text-slate-900">
                    {selectedMember.assignedCount}
                  </div>
                  <div className="text-[10px] text-emerald-600 font-bold mt-0.5">
                    {selectedMember.convertedCount} Converted ({selectedMember.conversionRate}%)
                  </div>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-2xs">
                  <div className="text-[10px] font-black uppercase text-slate-400 mb-1">
                    Total Package Cost
                  </div>
                  <div className="text-xl font-black text-slate-900 truncate font-mono" title={formatINR(selectedMemberLiveTotals?.packageCost || 0)}>
                    {formatINR(selectedMemberLiveTotals?.packageCost || 0)}
                  </div>
                  <div className="text-[10px] text-slate-500 font-medium mt-0.5 font-sans">
                    {selectedMemberLiveTotals?.invoicesCount || 0} Invoices Linked
                  </div>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-2xs">
                  <div className="text-[10px] font-black uppercase text-slate-400 mb-1">
                    Receiving (Paid)
                  </div>
                  <div className="text-xl font-black text-emerald-600 truncate font-mono" title={formatINR(selectedMemberLiveTotals?.receivedAmount || 0)}>
                    {formatINR(selectedMemberLiveTotals?.receivedAmount || 0)}
                  </div>
                  <div className="text-[10px] text-emerald-700 font-bold mt-0.5 font-sans">
                    {selectedMemberLiveTotals?.collectionRate}% Collected
                  </div>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-2xs">
                  <div className="text-[10px] font-black uppercase text-slate-400 mb-1">
                    Pending Balance
                  </div>
                  <div className="text-xl font-black text-amber-600 truncate font-mono" title={formatINR(selectedMemberLiveTotals?.pendingAmount || 0)}>
                    {formatINR(selectedMemberLiveTotals?.pendingAmount || 0)}
                  </div>
                  <div className="text-[10px] text-amber-700 font-bold mt-0.5 font-sans">
                    To be collected
                  </div>
                </div>
              </div>
            </div>

            {/* Filter controls inside Modal */}
            <div className="px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white">
              {/* Stage Pills */}
              <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200 text-xs font-bold w-full sm:w-auto overflow-x-auto">
                <button
                  onClick={() => setLeadStageFilter("all")}
                  className={`px-3 py-1.5 rounded-xl transition-all ${leadStageFilter === "all"
                    ? "bg-white text-emerald-800 shadow-sm font-black"
                    : "text-slate-500 hover:text-slate-800"
                    }`}
                >
                  All Leads ({memberLeadsWithInvoices.length})
                </button>
                <button
                  onClick={() => setLeadStageFilter("converted")}
                  className={`px-3 py-1.5 rounded-xl transition-all ${leadStageFilter === "converted"
                    ? "bg-white text-emerald-700 shadow-sm font-black"
                    : "text-slate-500 hover:text-slate-800"
                    }`}
                >
                  Converted ({selectedMember.convertedCount})
                </button>
                <button
                  onClick={() => setLeadStageFilter("followup")}
                  className={`px-3 py-1.5 rounded-xl transition-all ${leadStageFilter === "followup"
                    ? "bg-white text-blue-700 shadow-sm font-black"
                    : "text-slate-500 hover:text-slate-800"
                    }`}
                >
                  Follow Up ({selectedMember.followUpCount})
                </button>
                <button
                  onClick={() => setLeadStageFilter("createquote")}
                  className={`px-3 py-1.5 rounded-xl transition-all ${leadStageFilter === "createquote"
                    ? "bg-white text-purple-700 shadow-sm font-black"
                    : "text-slate-500 hover:text-slate-800"
                    }`}
                >
                  New Quote ({selectedMember.createQuoteCount})
                </button>
              </div>

              {/* Lead Search Input */}
              <div className="relative w-full sm:w-72">
                <Search
                  size={14}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="text"
                  placeholder="Search client, mobile, Trip ID..."
                  value={leadSearchTerm}
                  onChange={(e) => setLeadSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-emerald-300"
                />
              </div>
            </div>

            {/* Modal Body: Excel Leads Table */}
            <div className="overflow-y-auto flex-1 bg-white">
              {memberLeadsLoading ? (
                <div className="py-24 flex flex-col items-center justify-center">
                  <div className="w-10 h-10 border-4 border-emerald-100 border-t-emerald-600 rounded-full animate-spin mb-3"></div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Querying Invoices by Trip ID...
                  </p>
                </div>
              ) : filteredMemberLeads.length === 0 ? (
                <div className="py-20 text-center bg-white p-6">
                  <AlertCircle size={32} className="mx-auto text-slate-300 mb-2" />
                  <p className="text-sm font-bold text-slate-700">No leads found</p>
                  <p className="text-xs text-slate-400">Try changing stage or search filter</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead className="sticky top-0 z-10 bg-slate-100 text-[10px] font-black uppercase tracking-wider text-slate-500 border-b border-slate-200">
                      <tr>
                        <th className="py-3 px-3 w-10 text-center bg-slate-100">#</th>
                        <th className="py-3 px-3 bg-slate-100">Trip ID</th>
                        <th className="py-3 px-4 bg-slate-100">Client Name</th>
                        <th className="py-3 px-4 bg-slate-100">Mobile Number</th>
                        <th className="py-3 px-4 bg-slate-100">Email</th>
                        <th className="py-3 px-4 bg-slate-100">Destination</th>
                        <th className="py-3 px-3 bg-slate-100 text-center">Travel Date</th>
                        <th className="py-3 px-2 bg-slate-100 text-center">Pax</th>
                        <th className="py-3 px-2 bg-slate-100 text-center">Child</th>
                        <th className="py-3 px-2 bg-slate-100 text-center">Infant</th>
                        <th className="py-3 px-3 bg-slate-100 text-center">Stage</th>
                        <th className="py-3 px-4 bg-slate-100 text-right font-black">Package Cost</th>
                        <th className="py-3 px-4 bg-slate-100 text-right font-black text-emerald-700">Receiving</th>
                        <th className="py-3 px-4 bg-slate-100 text-right font-black text-amber-700">Pending</th>
                        <th className="py-3 px-3 bg-slate-100 text-center">Invoice</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredMemberLeads.map((lead, idx) => {
                        const info = lead.invoiceInfo || extractInvoiceAmounts(null);
                        const clientName = lead.clientName || lead["Client-Name"] || "Client";
                        const contact = lead.clientContact || lead["Client-Contact"] || lead.phone || lead.contact || "—";
                        const email = lead.clientEmail || lead["Client-Email"] || lead.email || "—";
                        const destination = lead.destination || lead["Client-Destination"] || "—";
                        const travelDate = lead.travelDate || lead["Client-TravelDate"] || "—";
                        const pax = parseInt(lead.pax || lead["Client-Pax"]) || 0;
                        const child = parseInt(lead.child || lead["Client-Child"]) || 0;
                        const infant = parseInt(lead.infant || lead["Client-Infant"]) || 0;
                        const isExpanded = expandedLeadTripId === lead.TripId;

                        return (
                          <React.Fragment key={lead.TripId || idx}>
                            <tr className="hover:bg-emerald-50/30 transition-colors odd:bg-white even:bg-slate-50/40">
                              <td className="py-2.5 px-3 text-center text-slate-400 font-bold text-[11px]">
                                {idx + 1}
                              </td>
                              <td className="py-2.5 px-3 font-mono font-bold text-purple-700 whitespace-nowrap">
                                {lead.TripId ? `#${lead.TripId}` : "—"}
                              </td>
                              <td className="py-2.5 px-4 font-bold text-slate-900 whitespace-nowrap">
                                {clientName}
                              </td>
                              <td className="py-2.5 px-4 font-medium text-slate-600 whitespace-nowrap">
                                {contact !== "—" ? (
                                  <a href={`tel:${contact}`} className="hover:text-emerald-600 flex items-center gap-1">
                                    <Phone size={11} className="text-slate-400" /> {contact}
                                  </a>
                                ) : (
                                  "—"
                                )}
                              </td>
                              <td className="py-2.5 px-4 font-medium text-slate-500 whitespace-nowrap">
                                {email !== "—" ? (
                                  <a href={`mailto:${email}`} className="hover:text-emerald-600 flex items-center gap-1">
                                    <Mail size={11} className="text-slate-400" /> {email}
                                  </a>
                                ) : (
                                  "—"
                                )}
                              </td>
                              <td className="py-2.5 px-4 font-bold text-slate-800 whitespace-nowrap">
                                {destination}
                              </td>
                              <td className="py-2.5 px-3 text-center text-slate-600 whitespace-nowrap font-medium text-[11px]">
                                {travelDate}
                              </td>
                              <td className="py-2.5 px-2 text-center font-bold text-slate-800">
                                {pax}
                              </td>
                              <td className="py-2.5 px-2 text-center font-bold text-slate-500">
                                {child}
                              </td>
                              <td className="py-2.5 px-2 text-center font-bold text-slate-400">
                                {infant}
                              </td>
                              <td className="py-2.5 px-3 text-center whitespace-nowrap">
                                <span
                                  className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${lead.stage === "Converted"
                                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                    : lead.stage === "Follow Up"
                                      ? "bg-blue-50 text-blue-700 border-blue-200"
                                      : "bg-purple-50 text-purple-700 border-purple-200"
                                    }`}
                                >
                                  {lead.stage}
                                </span>
                              </td>
                              <td className="py-2.5 px-4 text-right font-black text-slate-900 whitespace-nowrap font-mono">
                                {formatINR(info.packageCost)}
                              </td>
                              <td className="py-2.5 px-4 text-right font-black text-emerald-600 whitespace-nowrap font-mono">
                                {formatINR(info.receivedAmount)}
                              </td>
                              <td className="py-2.5 px-4 text-right font-black text-amber-600 whitespace-nowrap font-mono">
                                {formatINR(info.pendingAmount)}
                              </td>
                              <td className="py-2.5 px-3 text-center whitespace-nowrap">
                                {info.hasInvoice ? (
                                  <button
                                    onClick={() => setExpandedLeadTripId(isExpanded ? null : lead.TripId)}
                                    className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-800 hover:bg-purple-200 transition-colors flex items-center gap-1 mx-auto"
                                    title="Click to view installments"
                                  >
                                    #{info.invoiceNumber}
                                    {isExpanded ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
                                  </button>
                                ) : (
                                  <span className="text-[10px] text-slate-400">No Inv</span>
                                )}
                              </td>
                            </tr>

                            {/* Expandable Installments Drawer inside Modal */}
                            {isExpanded && info.installments && info.installments.length > 0 && (
                              <tr className="bg-slate-100/70">
                                <td colSpan={15} className="py-3 px-8">
                                  <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
                                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block mb-2">
                                      Installment Schedule for Trip #{lead.TripId}
                                    </span>
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                      {info.installments.map((inst, iIdx) => (
                                        <div
                                          key={iIdx}
                                          className="p-2 rounded-lg bg-slate-50 border border-slate-200 text-xs flex items-center justify-between"
                                        >
                                          <div>
                                            <span className="font-bold text-slate-700">
                                              Inst #{inst.sequence || iIdx + 1}
                                            </span>
                                            {inst.installmentDate && (
                                              <div className="text-[10px] text-slate-400">
                                                {inst.installmentDate}
                                              </div>
                                            )}
                                          </div>
                                          <div className="text-right">
                                            <span className="font-black text-slate-900 block font-mono">
                                              {formatINR(inst.installmentAmount)}
                                            </span>
                                            <span
                                              className={`text-[9px] font-bold uppercase px-1.5 py-0.2 rounded ${(inst.status || "").toLowerCase() === "paid"
                                                ? "bg-emerald-100 text-emerald-800"
                                                : "bg-amber-100 text-amber-800"
                                                }`}
                                            >
                                              {inst.status || "Pending"}
                                            </span>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
              <span className="text-xs text-slate-500 font-medium">
                Showing {filteredMemberLeads.length} leads for {selectedMember.name}
              </span>
              <button
                onClick={() => setSelectedMember(null)}
                className="px-6 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamDsrReport;
