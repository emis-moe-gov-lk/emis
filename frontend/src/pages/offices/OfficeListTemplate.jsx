import { useEffect, useMemo, useState } from "react";
import { Badge, Button, Select, Spinner, TextInput } from "flowbite-react";
import StatusBadge from "@/components/common/StatusBadge";
import {
  HiOfficeBuilding,
  HiLocationMarker,
  HiSearch,
  HiEye,
  HiChevronLeft,
  HiChevronRight,
} from "react-icons/hi";
import api from "@/api/axios";

/**
 * A reusable, professional list page for office datasets.
 * Works even if API field names differ, by extracting common fields safely.
 * Styled to match InstitutionIndex aesthetic.
 */
const OfficeListTemplate = ({ title, subtitle, endpoint, createLabel }) => {
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);

  const [selectedPeo, setSelectedPeo] = useState("");
  const [selectedZeo, setSelectedZeo] = useState("");
  const [peoOptions, setPeoOptions] = useState([]);
  const [zeoOptions, setZeoOptions] = useState([]);

  useEffect(() => {
    setPage(1);
    setSearch("");
  }, [endpoint]);

  // Load PEO list once when endpoint changes if applicable
  useEffect(() => {
    if (endpoint === "/deo-list" || endpoint === "/zeo-list") {
      api.get("/peo-list", { params: { per_page: 100 } })
        .then((res) => {
          const list = res.data?.data || res.data || [];
          setPeoOptions(list);
        })
        .catch((err) => console.error("Failed to load PEOs:", err));
    } else {
      setPeoOptions([]);
    }
    setSelectedPeo("");
    setSelectedZeo("");
  }, [endpoint]);

  // Load ZEO list when PEO is selected
  useEffect(() => {
    if (endpoint === "/deo-list") {
      api.get("/zeo-list", { params: { per_page: 100, peo_wp_id: selectedPeo || undefined } })
        .then((res) => {
          const list = res.data?.data || res.data || [];
          setZeoOptions(list);
        })
        .catch((err) => console.error("Failed to load ZEOs:", err));
      setSelectedZeo("");
    } else {
      setZeoOptions([]);
    }
  }, [endpoint, selectedPeo]);

  useEffect(() => {
    setPage(1);
  }, [selectedPeo, selectedZeo]);

  useEffect(() => {
    setLoading(true);
    const params = { page, per_page: 20 };
    if (endpoint === "/deo-list") {
      if (selectedPeo) params.peo_wp_id = selectedPeo;
      if (selectedZeo) params.zeo_wp_id = selectedZeo;
    } else if (endpoint === "/zeo-list") {
      if (selectedPeo) params.peo_wp_id = selectedPeo;
    }

    api
      .get(endpoint, { params })
      .then((res) => {
        const data = res.data;
        const list = Array.isArray(data)
          ? data
          : Array.isArray(data?.data)
            ? data.data
            : Array.isArray(data?.items)
              ? data.items
              : Array.isArray(data?.result)
                ? data.result
                : [];
        setRows(list);
        setTotal(data?.total ?? list.length);
        setLastPage(data?.last_page ?? 1);
      })
      .catch((err) => {
        console.error(err);
        setRows([]);
      })
      .finally(() => setLoading(false));
  }, [endpoint, page, selectedPeo, selectedZeo]);

  // pick helper: first existing key value
  const pick = (obj, keys) => {
    for (const k of keys) {
      const v = obj?.[k];
      if (v !== undefined && v !== null && String(v).trim() !== "") return v;
    }
    return "";
  };

  // Extract "best" display fields without assuming exact schema
  const normalized = useMemo(() => {
    return rows.map((r) => {
      const name = pick(r, [
        "name",
        "office_name",
        "institution_name",
        "workplace_name",
        "title",
        "short_name",
      ]);

      const code = pick(r, [
        "work_place_id",
        "workplace_id",
        "wp_id",
        "office_id",
        "moe_id",
        "pmoe_id",
        "peo_id",
        "zeo_id",
        "deo_id",
        "code",
        "id",
      ]);

      const address = pick(r, [
        "address",
        "address_line",
        "address1",
        "address_1",
        "location",
        "city",
      ]);

      const shortName = pick(r, ["short_name", "shortname"]);

      const contact = pick(r, [
        "contact",
        "phone",
        "telephone",
        "tel",
        "mobile",
        "contact_no",
      ]);

      const email = pick(r, ["email", "email_address"]);

      const statusRaw = pick(r, ["status", "active_status", "is_active"]);
      const status =
        statusRaw === 1 ||
        statusRaw === "1" ||
        statusRaw === true ||
        statusRaw === "active"
          ? "Active"
          : statusRaw === 0 ||
              statusRaw === "0" ||
              statusRaw === false ||
              statusRaw === "inactive"
            ? "Inactive"
            : statusRaw || "—";

      return {
        raw: r,
        name: name || "—",
        code: code || "—",
        address: address || shortName || "—",
        contact,
        email,
        status,
      };
    });
  }, [rows]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return normalized;
    return normalized.filter((x) => {
      return (
        x.name.toLowerCase().includes(q) ||
        String(x.code).toLowerCase().includes(q) ||
        String(x.address || "")
          .toLowerCase()
          .includes(q) ||
        String(x.contact || "")
          .toLowerCase()
          .includes(q) ||
        String(x.email || "")
          .toLowerCase()
          .includes(q)
      );
    });
  }, [normalized, search]);

  return (
    <div className="p-6 lg:p-10 w-full px-4 sm:px-6 lg:px-8 mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {title}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            {subtitle}
          </p>
        </div>
          <div className="flex items-center gap-2">
          <StatusBadge className="px-3 py-1 font-bold text-sm">
            {`Total: ${total}`}
          </StatusBadge>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="w-full md:max-w-md">
          <TextInput
            id="search"
            type="text"
            icon={HiSearch}
            placeholder={`Search ${title.toLowerCase()}...`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {(endpoint === "/deo-list" || endpoint === "/zeo-list") && (
            <div className="min-w-[180px] w-full sm:w-auto">
              <Select
                id="filter-peo"
                value={selectedPeo}
                onChange={(e) => setSelectedPeo(e.target.value)}
              >
                <option value="">All Provinces (PEO)</option>
                {peoOptions.map((opt) => (
                  <option key={opt.workplace_id} value={opt.workplace_id}>
                    {opt.name}
                  </option>
                ))}
              </Select>
            </div>
          )}

          {endpoint === "/deo-list" && (
            <div className="min-w-[180px] w-full sm:w-auto">
              <Select
                id="filter-zeo"
                value={selectedZeo}
                onChange={(e) => setSelectedZeo(e.target.value)}
              >
                <option value="">All Zones (ZEO)</option>
                {zeoOptions.map((opt) => (
                  <option key={opt.workplace_id} value={opt.workplace_id}>
                    {opt.name}
                  </option>
                ))}
              </Select>
            </div>
          )}

          {(selectedPeo || selectedZeo || search) && (
            <Button
              color="gray"
              size="md"
              onClick={() => {
                setSearch("");
                setSelectedPeo("");
                setSelectedZeo("");
              }}
              className="w-full sm:w-auto"
            >
              Clear Filters
            </Button>
          )}
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
          <Spinner size="xl" color="info" />
          <p className="mt-4 text-gray-500 dark:text-gray-400 animate-pulse">
            Loading {title.toLowerCase()}...
          </p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700">
          <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-full w-fit mx-auto mb-4">
            <HiOfficeBuilding className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            No records found
          </h3>
          <p className="text-gray-500 max-w-sm mx-auto mt-2">
            Try adjusting your search filters or add a new entry.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((row, idx) => (
            <div
              key={idx}
              className="group flex flex-col md:flex-row md:items-center gap-4 p-5 bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-md border border-gray-100 dark:border-gray-700 transition-all duration-200 hover:border-blue-100 dark:hover:border-blue-900/30"
            >
              {/* Icon & Index */}
              <div className="flex items-center gap-4 min-w-[60px]">
                <span className="text-xs font-mono text-gray-400 w-6">
                  #{((page - 1) * 20 + idx + 1).toString().padStart(2, "0")}
                </span>
                <div className="p-2.5 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
                  <HiOfficeBuilding className="w-6 h-6" />
                </div>
              </div>

              {/* Main Info */}
              <div className="flex-1 min-w-0 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                {/* Name & Code */}
                <div className="md:col-span-4">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white truncate group-hover:text-blue-600 transition-colors">
                    {row.name}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 font-mono mt-0.5">
                    Code: {row.code}
                  </p>
                  <p className="md:hidden text-sm text-gray-500 mt-1 flex items-center gap-1">
                    <HiLocationMarker className="w-4 h-4" />
                    {row.address || "No address"}
                  </p>
                </div>

                {/* Address (Desktop) */}
                <div className="md:col-span-4 hidden md:block text-sm text-gray-600 dark:text-gray-300 truncate">
                  {row.address || "No address provided"}
                </div>

                {/* Contact */}
                <div className="md:col-span-2 text-sm text-gray-500 dark:text-gray-400">
                  <div className="truncate">{row.contact || "-"}</div>
                  <div className="text-xs truncate">{row.email}</div>
                </div>

                {/* Status & Actions */}
                <div className="md:col-span-2 flex items-center md:justify-end gap-3">
                  {row.status === "Active" ? (
                    <StatusBadge className="px-3 py-1 bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400 ring-1 ring-green-600/20">
                      Active
                    </StatusBadge>
                  ) : (
                    <StatusBadge className="px-3 py-1 bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400 ring-1 ring-red-600/20">
                      {row.status}
                    </StatusBadge>
                  )}
                </div>
              </div>

              {/* Mobile View Action */}
              <div className="flex items-center justify-end gap-2 border-t border-gray-100 dark:border-gray-700 pt-3 md:pt-0 md:border-0">
                <Button size="xs" color="gray" className="gap-1">
                  <HiEye className="w-4 h-4" />
                  View
                </Button>
              </div>
            </div>
          ))}

          {/* Pagination Controls */}
          {lastPage > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
              <span className="text-sm text-gray-500 dark:text-gray-400 order-2 sm:order-1">
                Showing page{" "}
                <span className="font-semibold text-gray-900 dark:text-white">
                  {page}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-gray-900 dark:text-white">
                  {lastPage}
                </span>
              </span>

              <div className="flex gap-2 order-1 sm:order-2 w-full sm:w-auto">
                <Button
                  color="gray"
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                  className="flex-1 sm:flex-none inline-flex items-center gap-1"
                >
                  <HiChevronLeft className="w-5 h-5" />
                  Previous
                </Button>
                <Button
                  color="gray"
                  disabled={page === lastPage}
                  onClick={() => setPage(page + 1)}
                  className="flex-1 sm:flex-none inline-flex items-center gap-1"
                >
                  Next
                  <HiChevronRight className="w-5 h-5" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default OfficeListTemplate;
