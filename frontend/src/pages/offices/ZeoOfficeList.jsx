import OfficeListTemplate from "./OfficeListTemplate";

export default function ZeoOfficeList() {
    return (
        <OfficeListTemplate
            title="Zonal Education Office"
            subtitle="Manage Zonal Education Office profile and account"
            endpoint="/zeo-list"
            // createLabel="Create Zonal Education Office"
        />
    );
}
