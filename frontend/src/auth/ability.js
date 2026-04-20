import { AbilityBuilder, createMongoAbility } from "@casl/ability";

export function defineAbilityFor(user) {
  const { can, build } = new AbilityBuilder(createMongoAbility);

  if (!user || !user.roles?.length) {
    can("read", "public");
    return build();
  }

  if (user.roles.includes("admin")) {
    can("manage", "all");
  }

  if (user.roles.includes("teacher")) {
    can("create", "teacher.manage");
    can("read", "student.manage");
  }

  if (user.roles.includes("hr")) {
    can("create", "employee.manage");
    can("read", "employee.manage");
    can("update", "employee.manage");
  }

  return build();
}
