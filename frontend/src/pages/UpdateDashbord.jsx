import Header from "../components/Dashbord/Header";
import WelcomeCard from "../components/Dashbord/WelcomeCard";
import WeeklySchedule from "../components/Dashbord/WeeklySchedule";
import { getStats, getWeekDays, todayEvents } from "../data/dateData";
import StatCard from "../components/Dashbord/StatCard";
import AnalyticsHeader from "../components/Dashbord/Analytics/AnalyticsHeader";
import OfficeGrid from "../components/Dashbord/Analytics/OfficeGrid";
import { useEffect, useState } from "react";
import Spinner from "../components/UiComponents/Spinner";
import InstitutionCard from "../components/Dashbord/InstitutionCard";
import FullCalendar from "./timetable/FullCalendar";
import { useAuthUser } from "@/context/useAuthUser";
import api from "@/api/axios";

const UpdateDashboard = () => {
  const { peopleId, isLoading: isAuthLoading } = useAuthUser();
  const [userData, setUserData] = useState(null);
  const [hasError, setHasError] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [weekDays, setWeekDays] = useState(getWeekDays(selectedDate));
  const [showFullCalendar, setShowFullCalendar] = useState(false);

  useEffect(() => {
    const fetchDashboard = async () => {
      if (!peopleId) {
        return;
      }

      try {
        const res = await api.get(`/dashboard/${peopleId}`);
        if (res.data?.status === "success") {
          setUserData(res.data.data);
        } else {
          setHasError(true);
          console.error("Failed to fetch dashboard data");
        }
      } catch (err) {
        setHasError(true);
        console.error("Error fetching dashboard data:", err);
      }
    };

    fetchDashboard();
  }, [peopleId]);
  // const permissions = user?.permissions;

  if (hasError) {
    return <div className="p-8 text-red-500">Failed to load dashboard. Please refresh the page.</div>;
  }

  if (isAuthLoading || !peopleId || !userData) {
    return <Spinner />;
  }
  const dynamicStats = getStats(userData?.summary);
  const exactStats = dynamicStats.filter(
    (stat) => stat.title !== "Total Students" || userData?.summary?.student_count != '-',
  );

  const monthLabel = selectedDate.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  // Navigate weeks
  const prevWeek = () => {
    const prev = new Date(selectedDate);
    prev.setDate(prev.getDate() - 7);
    setSelectedDate(prev);
    setWeekDays(getWeekDays(prev));
  };

  const nextWeek = () => {
    const next = new Date(selectedDate);
    next.setDate(next.getDate() + 7);
    setSelectedDate(next);
    setWeekDays(getWeekDays(next));
  };

  const onSelectDay = (day) => {
    setSelectedDate(day);
  };

  return (
    <div className="p-4 sm:p-8">
  {/* on small screens stack vertically; on md+ show two columns side-by-side */}
  <div className="flex flex-col md:flex-row gap-6 w-full mb-12">
  
  {/* Column 1: Main Content (Wider) */}
  {/* flex-[2] makes this column take up 2/3 of the space */}
  <div className="w-full md:flex-[2] flex-[1] min-w-0">
    <Header userRoles={userData.roles} />
    <WelcomeCard user={userData} people={userData.people_id} />

    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
      {exactStats.map((stat, index) => (
        <StatCard key={index} {...stat} />
      ))}
    </div>
    
    {userData.institution && (
      <div className="mt-6">
        <InstitutionCard institution={userData.institution} />
      </div>
    )}
  </div>

  {/* Column 2: Calendar (Narrower) */}
  {/* flex-[1] makes this column take up 1/3 of the space */}
  <div className="w-full md:flex-[1] flex-[1] min-w-0 bg-gray-50 dark:bg-gray-800/40 p-4 md:p-6 rounded-2xl border dark:border-gray-700 md:sticky md:top-6">
    <WeeklySchedule
      monthLabel={monthLabel}
      weekDays={weekDays}
      selectedDate={selectedDate}
      todayEvents={todayEvents}
      onPrevWeek={prevWeek}
      onNextWeek={nextWeek}
      onSelectDay={onSelectDay}
      onViewFullCalendar={() => setShowFullCalendar(true)}
    />

    <FullCalendar
      show={showFullCalendar}
      events={todayEvents}
      onClose={() => setShowFullCalendar(false)}
    />
  </div>
</div>  

      {userData.office_breakdown && (
        <div>
          <AnalyticsHeader search={search} setSearch={setSearch} />
          <OfficeGrid
            workplaceLevel="OLID001"
            officeLists={userData.office_breakdown} // using API data here
            search={search}
          />
        </div>
      )}
    </div>
  );
};

export default UpdateDashboard;
