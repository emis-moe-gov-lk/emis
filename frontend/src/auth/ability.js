import { AbilityBuilder, createMongoAbility } from "@casl/ability";

export function defineAbilityFor(user) {
  const { can, build } = new AbilityBuilder(createMongoAbility);
  const roles = Array.isArray(user?.roles) ? user.roles : [];
  const permissions = Array.isArray(user?.permissions) ? user.permissions : [];

  if (!roles.length && !permissions.length) {
    can("read", "public");
    return build();
  }

  if (roles.includes("admin") || permissions.includes("user.create")) {
    can("manage", "all");
  }

  if (roles.includes("teacher") || permissions.includes("teacher.create")) {
    can("create", "teacher.manage");
    can("read", "student.manage");
  }

  if (roles.includes("hr") || permissions.includes("user.update")) {
    can("create", "employee.manage");
    can("read", "employee.manage");
    can("update", "employee.manage");
  }

  return build();
}
