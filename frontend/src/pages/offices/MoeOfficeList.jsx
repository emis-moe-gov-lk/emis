import OfficeListTemplate from "./OfficeListTemplate";

export default function MoeOfficeList() {
    return (
        <OfficeListTemplate
            title="Ministry of Education Office"
            subtitle="Manage Ministry of Education office profile and account"
            endpoint="/moe-list"
            createLabel="Create Ministry of Education Office"
        />
    );
}
