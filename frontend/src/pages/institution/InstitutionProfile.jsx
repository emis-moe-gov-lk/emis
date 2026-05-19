"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Badge, Button, Spinner, Tooltip } from "flowbite-react";
import {
  HiLocationMarker,
  HiCalendar,
  HiOfficeBuilding,
  HiDocumentReport,
  HiPencilAlt,
  HiClipboardCheck,
  HiShieldCheck,
  HiHeart,
  HiGlobeAlt,
  HiInformationCircle,
  HiPhone,
  HiMail,
} from "react-icons/hi";
import { motion } from "framer-motion";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import api from "@/api/axios";
import BackToListButton from "@/components/UiComponents/BackToListButton";

import Can from "@/components/common/Can";
import { PermissionGroups } from "@/data/permissionGroups";

/* Leaflet icon fix (Vite + Leaflet) */
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

/* Motion */
const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
};

/* UI helpers */
function EmptyText({ children = "Not available" }) {
  return (
    <span className="text-gray-400 dark:text-gray-500 italic">{children}</span>
  );
}

function MiniChip({ children, tone = "neutral" }) {
  const tones = {
    neutral:
      "bg-white/80 dark:bg-gray-800/50 text-gray-700 dark:text-gray-200 ring-1 ring-gray-200 dark:ring-gray-700",
    blue: "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 ring-1 ring-blue-200 dark:ring-blue-800",
    indigo:
      "bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 ring-1 ring-indigo-200 dark:ring-indigo-800",
    purple:
      "bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 ring-1 ring-purple-200 dark:ring-purple-800",
    green:
      "bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 ring-1 ring-green-200 dark:ring-green-800",
    yellow:
      "bg-yellow-100 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-200 ring-1 ring-yellow-200 dark:ring-yellow-800",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${tones[tone]}`}
    >
      {children}
    </span>
  );
}

function InfoField({ label, value }) {
  return (
    <div className="space-y-1">
      <div className="text-[11px] uppercase tracking-wider text-gray-400 dark:text-gray-500">
        {label}
      </div>
      <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
        {value ? value : <EmptyText />}
      </div>
    </div>
  );
}

function ContactRow({ icon: Icon, value, href }) {
  if (!value) return <EmptyText />;
  return (
    <a
      href={href}
      className="inline-flex items-center gap-2 text-sm font-medium text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
    >
      <Icon className="h-4 w-4 text-gray-400 dark:text-gray-500" />
      {value}
    </a>
  );
}

function SoftCard({
  title,
  subtitle,
  icon: Icon,
  accent = "blue",
  children,
  className = "",
}) {
  const accentRing =
    accent === "blue"
      ? "ring-blue-200 dark:ring-blue-800"
      : accent === "purple"
        ? "ring-purple-200 dark:ring-purple-800"
        : accent === "indigo"
          ? "ring-indigo-200 dark:ring-indigo-800"
          : "ring-gray-200 dark:ring-gray-700";

  const accentIconBg =
    accent === "blue"
      ? "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300"
      : accent === "purple"
        ? "bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300"
        : accent === "indigo"
          ? "bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300"
          : "bg-gray-100 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300";

  return (
    <motion.div
      variants={fadeUp}
      whileHover={{ y: -2 }}
      className={`rounded-3xl bg-white/80 dark:bg-gray-800/50 backdrop-blur ring-1 ${accentRing} shadow-sm hover:shadow-md transition-all ${className}`}
    >
      <div className="p-6">
        <div className="flex items-start gap-4">
          <div
            className={`h-11 w-11 rounded-2xl flex items-center justify-center ${accentIconBg}`}
          >
            <Icon className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <div className="text-[11px] uppercase tracking-wider text-gray-500 dark:text-gray-400">
              {subtitle}
            </div>
            <div className="text-base font-extrabold text-gray-900 dark:text-gray-100">
              {title}
            </div>
            <div className="mt-4">{children}</div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function InstitutionProfile() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [institution, setInstitution] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get(`/institutions/${id}`);
        setInstitution(res.data.data);
      } catch (e) {
        console.error("Error fetching institution:", e);
      } finally {
        setLoading(false);
      }
    };
    if (id) load();
  }, [id]);

  const initials = useMemo(() => {
    const name = institution?.name || "";
    const parts = name.split(" ").filter(Boolean);
    return (
      parts
        .slice(0, 2)
        .map((w) => w[0])
        .join("")
        .toUpperCase() || "SC"
    );
  }, [institution]);

  const isActive = Number(institution?.active_status) === 1;

  // NOTE: Your backend appears swapped: latitude=79.x, longitude=6.x
  // Leaflet expects [lat, lng], so we use [longitude, latitude].
  const lat = institution?.latitude ? Number(institution.latitude) : null;
  const lng = institution?.longitude ? Number(institution.longitude) : null;

  const updatedDate = institution?.updated_at
    ? new Date(institution.updated_at).toLocaleDateString()
    : null;

  const createdDate = institution?.created_at
    ? new Date(institution.created_at).toLocaleDateString()
    : null;

  const sportsSchool =
    institution?.sport_s === "1" || institution?.sport_s === 1 ? "Yes" : "No";

  const handleGetDirections = () => {
    if (!lat || !lng) return;

    if (!navigator.geolocation) {
      alert("Geolocation is not supported by this browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const fromLat = position.coords.latitude;
        const fromLng = position.coords.longitude;

        const url = `https://www.openstreetmap.org/directions?engine=fossgis_osrm_car&route=${fromLat},${fromLng};${lng},${lat}`;

        window.open(url, "_blank", "noopener,noreferrer");
      },
      () => {
        alert("Unable to get your current location.");
      },
    );
  };

  const handleShareLocation = () => {
    if (!lat || !lng) return;

    if (!navigator.geolocation) {
      alert("Geolocation is not supported by this browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const fromLat = position.coords.latitude;
        const fromLng = position.coords.longitude;

        const url = `https://www.openstreetmap.org/directions?engine=fossgis_osrm_car&route=${fromLat},${fromLng};${lng},${lat}`;

        // Try native share (mobile-first)
        if (navigator.share) {
          try {
            await navigator.share({
              title: institution?.name ?? "Location",
              text: "Directions via OpenStreetMap",
              url,
            });
          } catch {
            // user cancelled — do nothing
          }
        } else {
          // Fallback: copy to clipboard
          await navigator.clipboard.writeText(url);
          alert("Location link copied to clipboard.");
        }
      },
      () => {
        alert("Unable to get your current location.");
      },
    );
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Spinner size="xl" />
        <p className="mt-4 text-gray-500 dark:text-gray-400 animate-pulse">
          Loading profile…
        </p>
      </div>
    );
  }

  if (!institution) {
    return (
      <div className="p-10 text-center">
        <h2 className="text-xl font-bold text-gray-700 dark:text-gray-300">
          School not found
        </h2>
        <BackToListButton className="mt-4" onClick={() => navigate(-1)} label="Go Back" />
      </div>
    );
  }

  return (
    <motion.div
      className="w-full px-4 sm:px-6 lg:px-8 mx-auto px-6 lg:px-10 space-y-10"
      initial="hidden"
      animate="visible"
      variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
    >
      {/* Back */}
      <motion.div variants={fadeUp}>
        <BackToListButton onClick={() => navigate(-1)} label="Back to List" />
      </motion.div>

      {/* HEADER (match your sample: light, no black) */}
      <motion.div variants={fadeUp}>
        <div className="rounded-[28px] bg-gradient-to-r from-blue-50 dark:from-blue-950/30 via-sky-50 dark:via-slate-900/20 to-indigo-50 dark:to-indigo-950/30 ring-1 ring-blue-200 dark:ring-blue-800 shadow-sm">
          <div className="p-8 lg:p-10 flex flex-col lg:flex-row gap-8 items-center">
            {/* Avatar */}
            <motion.div
              whileHover={{ scale: 1.03 }}
              className="w-24 h-24 rounded-3xl bg-gradient-to-br from-indigo-600 to-blue-600 text-white flex items-center justify-center text-3xl font-extrabold shadow-lg"
            >
              {initials}
            </motion.div>

            {/* Identity */}
            <div className="flex-1 space-y-2">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-3xl font-extrabold text-gray-900 dark:text-gray-100">
                  {institution.name}
                </h1>

                <Badge color={isActive ? "success" : "failure"}>
                  {isActive ? "Active" : "Inactive"}
                </Badge>

                <span className="text-xs px-3 py-1 rounded-full bg-white/80 dark:bg-gray-800/50 ring-1 ring-gray-200 dark:ring-gray-700 font-mono">
                  #{institution.census_no ?? "—"}
                </span>
              </div>

              {/* Category/Type/Grade/Gender badges */}
              <div className="flex flex-wrap gap-2">
                <MiniChip tone="blue">
                  {institution.institution_category
                    ?.institution_category_name ?? "—"}
                </MiniChip>
                <MiniChip tone="purple">
                  {institution.institution_type?.institution_types_name ?? "—"}
                </MiniChip>
                <MiniChip tone="green">
                  {institution.grade_span?.grade_span_name ?? "—"}
                </MiniChip>
                <MiniChip tone="yellow">
                  {institution.type_by_gender?.name ?? "—"}
                </MiniChip>

                {/* Extra: Authority & Language (missing previously, now added) */}
                <MiniChip tone="indigo">
                  <HiInformationCircle className="mr-1 h-4 w-4" />
                  {institution.authority?.authority_name ?? "Authority —"}
                </MiniChip>
                <MiniChip tone="neutral">
                  <HiGlobeAlt className="mr-1 h-4 w-4" />
                  {institution.institution_languages?.name ?? "Language —"}
                </MiniChip>

                <MiniChip tone="neutral">
                  Sports School: {sportsSchool}
                </MiniChip>
              </div>

              {/* Meta row */}
              <div className="flex flex-wrap gap-6 text-sm text-gray-600 dark:text-gray-400">
                <span className="flex items-center gap-2">
                  <HiLocationMarker className="h-5 w-5 text-gray-400" />
                  {institution.address ?? <EmptyText />}
                </span>
                <span className="flex items-center gap-2">
                  <HiCalendar className="h-5 w-5 text-gray-400" />
                  Established {institution.established_year ?? "—"}
                </span>
                {createdDate && (
                  <span className="flex items-center gap-2">
                    <HiCalendar className="h-5 w-5 text-gray-400" />
                    Started {createdDate}
                  </span>
                )}
              </div>
            </div>

            {/* Metric tiles (light, NOT black; match sample) */}
            <div className="flex gap-4">
              {[
                { label: "Students", value: "—" },
                { label: "Teachers", value: "—" },
                { label: "Classes", value: "—" },
              ].map((m) => (
                <motion.div
                  key={m.label}
                  whileHover={{ y: -2 }}
                  className="w-24 h-20 rounded-2xl bg-white/80 dark:bg-gray-800/50 ring-1 ring-gray-200 dark:ring-gray-700 shadow-sm flex flex-col items-center justify-center"
                >
                  <div className="text-lg font-extrabold text-indigo-600 dark:text-indigo-400">
                    {m.value}
                  </div>
                  <div className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                    {m.label}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Row: ZEO/DEO (left) + Vision/Mission (right) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <SoftCard
            icon={HiOfficeBuilding}
            subtitle="Zonal Education Office"
            title={institution.zonal_education_office?.name ?? "—"}
            accent="blue"
          >
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {institution.zonal_education_office?.short_name ?? <EmptyText />}
            </div>
          </SoftCard>

          <SoftCard
            icon={HiOfficeBuilding}
            subtitle="Divisional Education Office"
            title={institution.divisional_education_office?.name ?? "—"}
            accent="purple"
          >
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {institution.divisional_education_office?.short_name ?? (
                <EmptyText />
              )}
            </div>
          </SoftCard>
        </div>

        {/* Vision / Mission + Category / Type */}
        <motion.div
          variants={fadeUp}
          className="rounded-3xl bg-blue-50/70 dark:bg-blue-950/20 ring-1 ring-blue-200 dark:ring-blue-800 p-8 space-y-8"
        >
          {/* Vision & Mission */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <HiInformationCircle className="text-blue-600 dark:text-blue-400 h-5 w-5" />
                <h3 className="text-lg font-bold dark:text-gray-100">Vision</h3>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {institution.vision || (
                  <span className="text-gray-400 dark:text-gray-500 italic">
                    Not available
                  </span>
                )}
              </p>
            </div>

            <div className="md:border-l md:pl-8 border-blue-200 dark:border-blue-800">
              <div className="flex items-center gap-2 mb-2">
                <HiInformationCircle className="text-blue-600 dark:text-blue-400 h-5 w-5" />
                <h3 className="text-lg font-bold dark:text-gray-100">
                  Mission
                </h3>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {institution.mission || (
                  <span className="text-gray-400 dark:text-gray-500 italic">
                    Not available
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* Institution Category & Type */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-2xl bg-white dark:bg-gray-800/50 p-6 ring-1 ring-blue-100 dark:ring-blue-800/50">
              <div className="text-xs uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-1">
                Institution Category
              </div>
              <div className="text-lg font-bold text-gray-900 dark:text-gray-100">
                {institution.institution_category?.institution_category_name ||
                  "—"}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                {institution.institution_category?.description || (
                  <span className="text-gray-400 dark:text-gray-500 italic">
                    Not available
                  </span>
                )}
              </p>
            </div>

            <div className="rounded-2xl bg-white dark:bg-gray-800/50 p-6 ring-1 ring-blue-100 dark:ring-blue-800/50">
              <div className="text-xs uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-1">
                Institution Type
              </div>
              <div className="text-lg font-bold text-gray-900 dark:text-gray-100">
                {institution.institution_type?.institution_types_name || "—"}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                {institution.institution_type?.description || (
                  <span className="text-gray-400 dark:text-gray-500 italic">
                    Not available
                  </span>
                )}
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Row: Police + MOH (both light panels, with icons) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SoftCard
          icon={HiShieldCheck}
          subtitle="Police Station"
          title={institution.police_station?.police_station_name ?? "—"}
          accent="indigo"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InfoField
              label="Address"
              value={institution.police_station?.address}
            />
            <InfoField
              label="Postal Code"
              value={institution.police_station?.postal_code}
            />
            <div className="space-y-1">
              <div className="text-[11px] uppercase tracking-wider text-gray-400 dark:text-gray-500">
                Phone
              </div>
              <div>
                <ContactRow
                  icon={HiPhone}
                  value={institution.police_station?.phone}
                  href={
                    institution.police_station?.phone
                      ? `tel:${institution.police_station.phone}`
                      : "#"
                  }
                />
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-[11px] uppercase tracking-wider text-gray-400 dark:text-gray-500">
                Email
              </div>
              <div className="truncate">
                <ContactRow
                  icon={HiMail}
                  value={institution.police_station?.email}
                  href={
                    institution.police_station?.email
                      ? `mailto:${institution.police_station.email}`
                      : "#"
                  }
                />
              </div>
            </div>
          </div>
        </SoftCard>

        <SoftCard
          icon={HiHeart}
          subtitle="MOH Area"
          title={institution.moh_area?.moh_area_name ?? "—"}
          accent="blue"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InfoField label="Address" value={institution.moh_area?.address} />
            <InfoField
              label="Postal Code"
              value={institution.moh_area?.postal_code}
            />
            <div className="space-y-1">
              <div className="text-[11px] uppercase tracking-wider text-gray-400 dark:text-gray-500">
                Phone
              </div>
              <div>
                <ContactRow
                  icon={HiPhone}
                  value={institution.moh_area?.phone}
                  href={
                    institution.moh_area?.phone
                      ? `tel:${institution.moh_area.phone}`
                      : "#"
                  }
                />
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-[11px] uppercase tracking-wider text-gray-400 dark:text-gray-500">
                Email
              </div>
              <div className="truncate">
                <ContactRow
                  icon={HiMail}
                  value={institution.moh_area?.email}
                  href={
                    institution.moh_area?.email
                      ? `mailto:${institution.moh_area.email}`
                      : "#"
                  }
                />
              </div>
            </div>
          </div>
        </SoftCard>
      </div>

      {/* Row: Location (left) + Map (right) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          variants={fadeUp}
          className="rounded-3xl bg-blue-50/30 dark:bg-blue-950/20 ring-1 ring-blue-200 dark:ring-blue-800 shadow-sm"
        >
          <div className="p-6 space-y-5">
            <div className="flex items-center gap-2">
              <HiLocationMarker className="h-5 w-5 text-blue-700 dark:text-blue-400" />
              <div className="font-extrabold text-gray-900 dark:text-gray-100">
                Location Details
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <InfoField label="Address" value={institution.address} />
              <InfoField label="Postal Code" value={institution.postal_code} />
              <InfoField
                label="Province"
                value={institution.district?.province_id}
              />
              <InfoField
                label="District"
                value={institution.district?.district_name}
              />

              {/* Missing fields that exist but may not have relations */}
              <InfoField
                label="GN Division"
                value={institution.gn_division_id}
              />
              <InfoField label="Ethnicity" value={institution.ethnicity_id} />
            </div>

            <div className="flex gap-3 pt-2">
              {/* <Button
                color="blue"
                size="sm"
                className="rounded-full"
                onClick={handleGetDirections}
              >
                Get Directions
              </Button> */}

              {/* <Button
                color="gray"
                outline
                size="sm"
                className="rounded-full"
                onClick={handleShareLocation}
              >
                Share Location
              </Button> */}
            </div>
          </div>
        </motion.div>

        <motion.div
          variants={fadeUp}
          className="rounded-3xl overflow-hidden ring-1 ring-blue-200 dark:ring-blue-800 shadow-sm"
        >
          {lat && lng ? (
            <MapContainer
              center={[lng, lat]}
              zoom={14}
              className="h-[320px] w-full"
            >
              <TileLayer
                attribution="© OpenStreetMap contributors"
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <Marker position={[lng, lat]}>
                <Popup>{institution.name}</Popup>
              </Marker>
            </MapContainer>
          ) : (
            <div className="h-[320px] flex items-center justify-center text-gray-400 dark:text-gray-500 bg-white dark:bg-gray-800/50">
              Map not available
            </div>
          )}
        </motion.div>
      </div>

      {/* Footer: updated + actions (match sample style; no black) */}
      <motion.div
        variants={fadeUp}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-gray-200 dark:border-gray-700 pt-6"
      >
        <div className="text-sm text-gray-400 dark:text-gray-500">
          Last updated: {updatedDate ?? "—"}
        </div>

        <div className="flex flex-wrap gap-3 justify-end">
          <Can permission={PermissionGroups.INSTITUTION.PROFILE_REPORT}>
            <Button color="gray" outline className="rounded-full">
              <HiDocumentReport className="mr-2 h-4 w-4" />
              Generate Report
            </Button>
          </Can>

          <Can permission={PermissionGroups.INSTITUTION.PROFILE_EDIT}>
            <Button
              color="blue"
              className="rounded-full shadow-sm hover:shadow-md transition-shadow"
            >
              <HiPencilAlt className="mr-2 h-4 w-4" />
              Edit Profile
            </Button>
          </Can>
          {/* <Button color="success" className="rounded-full shadow-sm hover:shadow-md transition-shadow">
            <HiClipboardCheck className="mr-2 h-4 w-4" />
            Schedule Visit
          </Button> */}
        </div>
      </motion.div>
    </motion.div>
  );
}
