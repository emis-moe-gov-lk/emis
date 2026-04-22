import api from "./axios";

export const getTeacherSettings = async () => {
    const response = await api.get("/teacher-settings");

    if (response.data?.status !== "success") {
        throw new Error("Failed to load teacher settings");
    }

    const {
        services = [],
        service_ranks = [],
        districts = [],
        teacher_categories = [],
        teacher_types = [],
    } = response.data;

    return {
        services,
        serviceRanks: service_ranks,
        districts,
        teacherCategories: teacher_categories,
        teacherTypes: teacher_types,
    };
};
