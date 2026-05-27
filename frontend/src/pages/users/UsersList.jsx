import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Badge, Button, Spinner, TextInput } from "flowbite-react";
import { resolveProfileImage } from "@/utils/profileImage";
import StatusBadge from "@/components/common/StatusBadge";
import {
  HiChevronLeft,
  HiChevronRight,
  HiDotsVertical,
  HiIdentification,
  HiPlus,
  HiMail,
  HiOfficeBuilding,
  HiSearch,
  HiUser,
} from "react-icons/hi";
import {
  getUsers,
  toggleUserStatus,
  USER_LIST_PER_PAGE,
} from "@/api/userService";

const getUserId = (user) => user?.id ?? user?.user_id ?? user?.people_id ?? user?.uuid;

const getUserName = (user) => {
  if (user?.name) return user.name;
  if (user?.full_name) return user.full_name;

  const firstName = user?.first_name ?? "";
  const lastName = user?.last_name ?? "";
  const fullName = `${firstName} ${lastName}`.trim();
  return fullName || "Unknown User";
};

const getUserRole = (user) => {
  if (typeof user?.role === "string") return user.role;
  if (user?.role?.name) return user.role.name;

  if (Array.isArray(user?.role) && user.role.length > 0) {
    const roleNames = user.role
      .map((role) => (typeof role === "string" ? role : role?.name))
      .filter(Boolean);
    return roleNames.join(", ") || "-";
  }

  if (Array.isArray(user?.roles) && user.roles.length > 0) {
    const roleNames = user.roles
      .map((role) => (typeof role === "string" ? role : role?.name))
      .filter(Boolean);
    return roleNames.join(", ") || "-";
  }

  return "-";
};

const getWorkplace = (user) => {
  return (
    user?.workplace?.name ||
    user?.workplace?.institution_name ||
    user?.current_workplace?.name ||
    user?.institution?.name ||
    user?.office?.name ||
    user?.workplace ||
    "-"
  );
};

const getStatusLabel = (user) => {
  if (user?.status === 1 || user?.status === "1") {
    return "Active";
  }

  if (user?.status === 0 || user?.status === "0") {
    return "Inactive";
  }

  if (typeof user?.status === "boolean") {
    return user.status ? "Active" : "Inactive";
  }

  if (typeof user?.is_active === "boolean") {
    return user.is_active ? "Active" : "Inactive";
  }

  if (typeof user?.status === "string" && user.status.trim()) {
    return user.status.charAt(0).toUpperCase() + user.status.slice(1).toLowerCase();
  }

  return "Unknown";
};

const getStatusColor = (statusLabel) => {
  const normalized = statusLabel.toLowerCase();
  if (normalized === "active") return "success";
  if (normalized === "inactive") return "failure";
  return "warning";
};

const isActiveStatus = (statusLabel) => statusLabel?.toLowerCase() === "active";

const UsersList = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [from, setFrom] = useState(0);
  const [to, setTo] = useState(0);
  const [total, setTotal] = useState(0);
  const [openMenuKey, setOpenMenuKey] = useState(null);
  const [actionLoadingKey, setActionLoadingKey] = useState(null);

  const fetchUsers = async (pageNumber = 1, searchTerm = search) => {
    setLoading(true);
    try {
      const {
        users: usersList,
        total: usersTotal,
        currentPage,
        lastPage: fetchedLastPage,
        from: fetchedFrom,
        to: fetchedTo,
      } = await getUsers({
        page: pageNumber,
        perPage: USER_LIST_PER_PAGE,
        search: searchTerm,
      });
      setUsers(usersList);
      setTotal(usersTotal);
      setPage(currentPage);
      setLastPage(fetchedLastPage);
      setFrom(fetchedFrom);
      setTo(fetchedTo);
    } catch (error) {
      console.error("Failed to load users:", error);
      setUsers([]);
      setTotal(0);
      setFrom(0);
      setTo(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = () => setOpenMenuKey(null);
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (page !== 1) {
        setPage(1);
        return;
      }

      fetchUsers(1, search);
    }, 350);

    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    fetchUsers(page, search);
  }, [page]);

  const handleToggleStatusClick = async (event, user) => {
    event.stopPropagation();

    if (!user.id) return;
    const currentlyActive = isActiveStatus(user.status);
    const nextActiveState = !currentlyActive;
    const actionLabel = nextActiveState ? "activate" : "deactivate";
    const confirmed = window.confirm(`Are you sure you want to ${actionLabel} ${user.name}?`);
    if (!confirmed) return;

    try {
      setActionLoadingKey(user.menuKey);
      setOpenMenuKey(null);
      await toggleUserStatus(user.id);
      await fetchUsers(page, search);
    } catch (error) {
      console.error("Failed to update user status:", error);
      window.alert("Failed to update user status. Please try again.");
    } finally {
      setActionLoadingKey(null);
    }
  };

  const formattedUsers = useMemo(() => {
    return users.map((user, index) => {
      const id = getUserId(user);
      const status = getStatusLabel(user);
      const menuKey = id ?? `row-${index}`;

      return {
        raw: user,
        id,
        menuKey,
        name: getUserName(user),
        nic: user?.nic ?? user?.nic_no ?? "-",
        email: user?.email ?? "-",
        workplace: getWorkplace(user),
        role: getUserRole(user),
        profileImage:
          resolveProfileImage(
            user?.profile_image ??
              user?.profile_picture ??
              user?.avatar_url ??
              user?.avatar,
            user?.gender_id ?? user?.gender?.gender_id,
          ),
        genderId: user?.gender_id ?? user?.gender?.gender_id ?? null,
        status,
        statusColor: getStatusColor(status),
      };
    });
  }, [users]);

  return (
    <div className="p-4 sm:p-6 lg:p-10 w-full px-4 sm:px-6 lg:px-8 mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Users</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            Manage user accounts and permissions.
          </p>
        </div>

        {/* <div className="flex items-center gap-2">
          <Badge color="blue" size="lg">
            Total: {total}
          </Badge>
          <Button
            color="blue"
            size="sm"
            onClick={() => navigate("/users/create")}
            className="inline-flex items-center"
          >
            <HiPlus className="w-4 h-4 mr-1" />
            Create User
          </Button>
        </div> */}
      </div>

      <div className="w-full sm:max-w-md">
        <TextInput
          id="search-users"
          type="text"
          icon={HiSearch}
          placeholder="Search by name, NIC, or email..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
          <Spinner size="xl" color="info" />
          <p className="mt-4 text-gray-500 dark:text-gray-400 animate-pulse font-medium">
            Loading Users List...
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {formattedUsers.length > 0 ? (
            formattedUsers.map((user) => (
              <div
                key={user.menuKey}
                onClick={() =>
                  navigate("/users/edit", {
                    state: { user: user.raw, userId: user.id },
                  })
                }
                className={`group rounded-2xl border bg-white dark:bg-gray-800 shadow-sm transition-all duration-200 ${
                  "cursor-pointer border-gray-100 dark:border-gray-700 hover:shadow-md hover:border-blue-100 dark:hover:border-blue-900/30"
                }`}
              >
                <div className="p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-12 gap-4 items-start xl:items-center">
                  <div className="xl:col-span-3 min-w-0 flex items-center gap-3">
                    {user.profileImage ? (
                      <img
                        src={user.profileImage}
                        alt={`${user.name} profile`}
                        className="h-12 w-12 sm:h-14 sm:w-14 rounded-full object-cover border-2 border-white dark:border-slate-800 shadow-sm shrink-0"
                      />
                    ) : (
                      <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                        <HiUser className="w-6 h-6" />
                      </div>
                    )}

                    <div className="min-w-0">
                      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">
                        Name
                      </p>
                      <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white truncate group-hover:text-blue-600 transition-colors">
                        {user.name}
                      </h3>
                    </div>
                  </div>

                  <div className="xl:col-span-2 min-w-0">
                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">
                      NIC
                    </p>
                    <div className="flex items-center gap-1.5 text-sm text-gray-700 dark:text-gray-200">
                      <HiIdentification className="w-4 h-4 text-gray-400 shrink-0" />
                      <span className="truncate">{user.nic}</span>
                    </div>
                  </div>

                  <div className="xl:col-span-2 min-w-0">
                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">
                      Email
                    </p>
                    <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-300">
                      <HiMail className="w-4 h-4 text-gray-400 shrink-0" />
                      <span className="truncate">{user.email}</span>
                    </div>
                  </div>

                  <div className="xl:col-span-2 min-w-0">
                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">
                      Workplace
                    </p>
                    <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-300">
                      <HiOfficeBuilding className="w-4 h-4 text-gray-400 shrink-0" />
                      <span className="truncate">{user.workplace}</span>
                    </div>
                  </div>

                  <div className="xl:col-span-1 min-w-0">
                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">
                      Role
                    </p>
                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-200 truncate">
                      {user.role}
                    </p>
                  </div>

                  <div className="xl:col-span-2 flex items-center justify-between xl:justify-end gap-2">
                    <StatusBadge className="px-3 py-1 whitespace-nowrap">
                      {user.status}
                    </StatusBadge>

                    <div className="relative">
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          setOpenMenuKey(openMenuKey === user.menuKey ? null : user.menuKey);
                        }}
                        disabled={actionLoadingKey === user.menuKey}
                        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        aria-label={`Open actions for ${user.name}`}
                      >
                        <HiDotsVertical className="w-5 h-5 text-gray-500" />
                      </button>

                      {openMenuKey === user.menuKey && (
                        <div
                          onClick={(event) => event.stopPropagation()}
                          className="absolute right-0 top-9 z-50 w-44 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 py-1"
                        >
                          <button
                            type="button"
                            onClick={(event) => handleToggleStatusClick(event, user)}
                            className="w-full text-left px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                          >
                            {isActiveStatus(user.status) ? "Deactivate User" : "Activate User"}
                          </button>

                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              setOpenMenuKey(null);
                              navigate("/users/edit", {
                                state: { user: user.raw, userId: user.id },
                              });
                            }}
                            className="w-full text-left px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                          >
                            Edit User
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700">
              <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-full w-fit mx-auto mb-4">
                <HiUser className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">No users found</h3>
              <p className="text-gray-500 max-w-sm mx-auto mt-2">
                Try adjusting your search or add a new user.
              </p>
            </div>
          )}

          {formattedUsers.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
              <span className="text-sm text-gray-500 dark:text-gray-400 order-2 sm:order-1">
                Showing <span className="font-semibold text-gray-900 dark:text-white">{from}</span> to{" "}
                <span className="font-semibold text-gray-900 dark:text-white">{to}</span> of{" "}
                <span className="font-semibold text-gray-900 dark:text-white">{total}</span>
              </span>

              <div className="flex gap-2 order-1 sm:order-2 w-full sm:w-auto">
                <Button
                  color="gray"
                  disabled={page <= 1}
                  onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                  className="flex-1 sm:flex-none border-gray-200 dark:border-gray-700 shadow-sm"
                >
                  <HiChevronLeft className="w-5 h-5 mr-1" />
                  Previous
                </Button>
                <Button
                  color="gray"
                  disabled={page >= lastPage}
                  onClick={() => setPage((prev) => Math.min(lastPage, prev + 1))}
                  className="flex-1 sm:flex-none border-gray-200 dark:border-gray-700 shadow-sm"
                >
                  Next
                  <HiChevronRight className="w-5 h-5 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default UsersList;
