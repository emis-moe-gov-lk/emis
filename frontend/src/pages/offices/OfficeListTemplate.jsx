import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { Badge, Button, Spinner, TextInput } from "flowbite-react";
import {
  HiOfficeBuilding,
  HiLocationMarker,
  HiSearch,
  HiPlus,
  HiEye,
  HiTrash,
} from "react-icons/hi";
import api from "@/api/axios";
import { NavLink } from "react-router-dom";

/**
 * A reusable, professional list page for office datasets.
 * Works even if API field names differ, by extracting common fields safely.
 * Styled to match InstitutionIndex aesthetic.
 */
const OfficeListTemplate = ({ title, subtitle, endpoint, createLabel }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    setLoading(true);
    api
      .get(endpoint)
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
      })
      .catch((err) => {
        console.error(err);
        setRows([]);
      })
      .finally(() => setLoading(false));
  }, [endpoint]);

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
        address,
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
          <Badge color="blue" size="lg">
            Total: {filtered.length}
          </Badge>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="w-full sm:max-w-md">
          <TextInput
            id="search"
            type="text"
            icon={HiSearch}
            placeholder={`Search ${title.toLowerCase()}...`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* <Button
          color="gray"
          className="inline-flex items-center gap-2 rounded-lg border shadow-sm enabled:hover:text-blue-600"
          onClick={() => alert("Create functionality will be connected next.")}
        >
          <HiPlus className="w-5 h-5 mr-1" />
          {createLabel}
        </Button> */}
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
                  #{(idx + 1).toString().padStart(2, "0")}
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
                    <Badge
                      color="success"
                      className="px-3 py-1 bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400 ring-1 ring-green-600/20"
                    >
                      Active
                    </Badge>
                  ) : (
                    <Badge
                      color="failure"
                      className="px-3 py-1 bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400 ring-1 ring-red-600/20"
                    >
                      {row.status}
                    </Badge>
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
        </div>
      )}
    </div>
  );
};

export default OfficeListTemplate;
