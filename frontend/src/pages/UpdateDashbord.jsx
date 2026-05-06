import Header from "../components/Dashbord/Header";
import WelcomeCard from "../components/Dashbord/WelcomeCard";
import WeeklySchedule from "../components/Dashbord/WeeklySchedule";
import { getStats, getWeekDays, todayEvents } from "../data/dateData";
import StatCard from "../components/Dashbord/StatCard";
import AnalyticsHeader from "../components/Dashbord/Analytics/AnalyticsHeader";
import OfficeGrid from "../components/Dashbord/Analytics/OfficeGrid";
import { useEffect, useState } from "react";
import { useAuthContext } from "@asgardeo/auth-react";
import Spinner from "../components/UiComponents/Spinner";
import InstitutionCard from "../components/Dashbord/InstitutionCard";
import FullCalendar from "./timetable/FullCalendar";
import { useAuthUser } from "@/context/useAuthUser";

const UpdateDashboard = () => {
  const { getAccessToken } = useAuthContext();
  const { peopleId, isLoading: isAuthLoading } = useAuthUser();
  const [userData, setUserData] = useState(null);
  const [search, setSearch] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [weekDays, setWeekDays] = useState(getWeekDays(selectedDate));
  const [showFullCalendar, setShowFullCalendar] = useState(false);

  useEffect(() => {
    const fetchDashboard = async () => {
      if (!peopleId) {
        return;
      }

      const token = await getAccessToken();
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/dashboard/${peopleId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          },
        );
        const data = await res.json();
        if (data.status === "success") {
          setUserData(data.data);
          console.log("Dashboard data:", data.data);
        } else {
          console.error("Failed to fetch dashboard data");
        }
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
      }
    };

    fetchDashboard();
  }, [getAccessToken, peopleId]);
  // const permissions = user?.permissions;

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
    <div className="p-8">
      <div className="flex flex-col lg:flex-row gap-8 mb-12">
        <div>
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
        <div className="p-8">
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
