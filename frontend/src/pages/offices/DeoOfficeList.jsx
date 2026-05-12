import OfficeListTemplate from "./OfficeListTemplate";

export default function DeoOfficeList() {
  return (
    <OfficeListTemplate
      title="Divisional Education Office"
      subtitle="Manage Divisional Education Office profile and account"
      endpoint="/deo-list"
      // createLabel="Create Divisional Education Office"
    />
  );
}
