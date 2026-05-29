import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Badge, Select, Spinner, TextInput } from "flowbite-react";
import StatusBadge from "@/components/common/StatusBadge";
import {
  HiOfficeBuilding,
  HiLocationMarker,
  HiChevronLeft,
  HiChevronRight,
  HiSearch,
} from "react-icons/hi";
import api from "@/api/axios";
import { HiPlus } from "react-icons/hi";
import { NavLink } from "react-router-dom";

import Can from "@/components/common/Can";
import { PermissionGroups } from "@/data/permissionGroups";
import Button from "@/components/UiComponents/Button";

export default function InstitutionIndex() {
  const navigate = useNavigate();
  const [institutions, setInstitutions] = useState([]);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({
    authorityId: "",
    peoWpId: "",
    zeoWpId: "",
    deoWpId: "",
    activeStatus: "",
  });
  const [filterOptions, setFilterOptions] = useState({
    authorities: [],
    provinces: [],
    zones: [],
    divisions: [],
  });

  useEffect(() => {
    api.get("/institutions/filters").then((res) => {
      setFilterOptions((prev) => ({ ...prev, ...res.data.data }));
    });
  }, []);

  const visibleZones = filters.peoWpId
    ? filterOptions.zones.filter((z) => z.peo_wp_id === filters.peoWpId)
    : filterOptions.zones;

  const visibleDivisions = filters.zeoWpId
    ? filterOptions.divisions.filter((d) => d.zeo_wp_id === filters.zeoWpId)
    : filterOptions.divisions;

  const updateFilter = (key, value) => {
    setFilters((current) => {
      const next = { ...current, [key]: value };
      if (key === "peoWpId") { next.zeoWpId = ""; next.deoWpId = ""; }
      if (key === "zeoWpId") { next.deoWpId = ""; }
      return next;
    });
  };

  const fetchInstitutions = useCallback(async (pageNumber = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: pageNumber });

      if (search.trim()) params.set("search", search.trim());
      if (filters.authorityId) params.set("authority_id", filters.authorityId);
      if (filters.peoWpId) params.set("peo_wp_id", filters.peoWpId);
      if (filters.zeoWpId) params.set("zeo_wp_id", filters.zeoWpId);
      if (filters.deoWpId) params.set("deo_wp_id", filters.deoWpId);
      if (filters.activeStatus) {
        params.set("active_status", filters.activeStatus);
      }

      const response = await api.get(`/institutions?${params.toString()}`);
      const payload = response.data.data;

      setInstitutions(payload.data);
      setPage(payload.current_page);
      setLastPage(payload.last_page);
      setPerPage(payload.per_page);
      setTotal(payload.total);
    } catch (error) {
      console.error("Error fetching institutions:", error);
    } finally {
      setLoading(false);
    }
  }, [filters, search]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      setPage(1);
      fetchInstitutions(1);
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [fetchInstitutions, search, filters]);

  useEffect(() => {
    if (page === 1) return;
    fetchInstitutions(page);
    // Page changes should use the latest debounced search/filter state.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  return (
    <div className="p-6 lg:p-10 w-full px-4 sm:px-6 lg:px-8 mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Institutions
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            Manage and view all registered schools and offices.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge className="px-3 py-1 font-bold text-sm">
            {`Total: ${total || 0}`}
          </StatusBadge>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-6">
          <Select
            aria-label="Filter by authority"
            value={filters.authorityId}
            onChange={(e) => updateFilter("authorityId", e.target.value)}
          >
            <option value="">All Authorities</option>
            {filterOptions.authorities.map((a) => (
              <option key={a.authority_id} value={a.authority_id}>
                {a.authority_name}
              </option>
            ))}
          </Select>

          <Select
            aria-label="Filter by province"
            value={filters.peoWpId}
            onChange={(e) => updateFilter("peoWpId", e.target.value)}
          >
            <option value="">All Provinces</option>
            {filterOptions.provinces.map((p) => (
              <option key={p.workplace_id} value={p.workplace_id}>
                {p.short_name}
              </option>
            ))}
          </Select>

          <Select
            aria-label="Filter by zonal office"
            value={filters.zeoWpId}
            onChange={(e) => updateFilter("zeoWpId", e.target.value)}
          >
            <option value="">All Zonal Offices</option>
            {visibleZones.map((z) => (
              <option key={z.workplace_id} value={z.workplace_id}>
                {z.short_name}
              </option>
            ))}
          </Select>

          <Select
            aria-label="Filter by divisional office"
            value={filters.deoWpId}
            onChange={(e) => updateFilter("deoWpId", e.target.value)}
          >
            <option value="">All Divisional Offices</option>
            {visibleDivisions.map((d) => (
              <option key={d.workplace_id} value={d.workplace_id}>
                {d.name}
              </option>
            ))}
          </Select>

          <Select
            aria-label="Filter by status"
            value={filters.activeStatus}
            onChange={(e) => updateFilter("activeStatus", e.target.value)}
          >
            <option value="">Any Status</option>
            <option value="1">Active</option>
            <option value="0">Inactive</option>
          </Select>

          <TextInput
            id="search"
            type="text"
            icon={HiSearch}
            placeholder="Search institutions by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="flex justify-end">
        <Can permission={PermissionGroups.INSTITUTION.CREATE}>
          <NavLink to="/institution/create">
            <Button variant="secondary" icon={<HiPlus />}>
              Create Institution
            </Button>
          </NavLink>
        </Can>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
          <Spinner size="xl" color="info" />
          <p className="mt-4 text-gray-500 dark:text-gray-400 animate-pulse">
            Loading institutions...
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {institutions.length > 0 ? (
            institutions.map((inst, index) => (
              <div
                key={inst.id}
                onClick={() => navigate(`/institution/${inst.id}`)}
                className="group flex flex-col md:flex-row md:items-center gap-4 p-5 bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-md border border-gray-100 dark:border-gray-700 transition-all duration-200 hover:border-blue-100 dark:hover:border-blue-900/30 cursor-pointer"
              >
                {/* Icon & Index */}
                <div className="flex items-center gap-4 min-w-[60px]">
                  <span className="text-xs font-mono text-gray-400 w-6">
                    #
                    {((page - 1) * perPage + index + 1)
                      .toString()
                      .padStart(2, "0")}
                  </span>
                  <div className="p-2.5 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
                    <HiOfficeBuilding className="w-6 h-6" />
                  </div>
                </div>

                {/* Main Info */}
                <div className="flex-1 min-w-0 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                  {/* Name */}
                  <div className="md:col-span-4">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white truncate group-hover:text-blue-600 transition-colors">
                      {inst.name}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 font-mono mt-0.5">
                      Census No.: {inst.census_no ?? "No Census No"}
                    </p>
                    <p className="md:hidden text-sm text-gray-500 mt-1 flex items-center gap-1">
                      <HiLocationMarker className="w-4 h-4" />
                      {inst.district?.district_name ?? "Unknown District"}
                    </p>
                  </div>

                  {/* Address */}
                  <div className="md:col-span-4 hidden md:block text-sm text-gray-600 dark:text-gray-300 truncate">
                    {inst.address ?? "No address provided"}
                  </div>

                  {/* District (Desktop) */}
                  <div className="md:col-span-2 hidden md:block text-sm text-gray-500 dark:text-gray-400">
                    {inst.district?.district_name ?? "-"}
                  </div>

                  {/* Status */}
                  <div className="md:col-span-2 flex md:justify-end">
                    {inst.active_status === 1 ? (
                      <StatusBadge className="px-3 py-1 bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400 ring-1 ring-green-600/20">
                        Active
                      </StatusBadge>
                    ) : (
                      <StatusBadge className="px-3 py-1 bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400 ring-1 ring-red-600/20">
                        Inactive
                      </StatusBadge>
                    )}
                  </div>
                </div>

                {/* Mobile Address Fallback */}
                <div className="md:hidden text-sm text-gray-500 border-t border-gray-100 dark:border-gray-700 pt-3 mt-1">
                  {inst.address ?? "No address provided"}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700">
              <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-full w-fit mx-auto mb-4">
                <HiOfficeBuilding className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                No institutions found
              </h3>
              <p className="text-gray-500 max-w-sm mx-auto mt-2">
                Try adjusting your search filters or add a new institution.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Pagination */}
      {institutions.length > 0 && (
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
              variant="secondary"
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
              className="flex-1 sm:flex-none"
            >
              <HiChevronLeft className="w-5 h-5 mr-1" />
              Previous
            </Button>
            <Button
              variant="secondary"
              disabled={page === lastPage}
              onClick={() => setPage(page + 1)}
              className="flex-1 sm:flex-none"
            >
              Next
              <HiChevronRight className="w-5 h-5 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
