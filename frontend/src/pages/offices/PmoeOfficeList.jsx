import OfficeListTemplate from "./OfficeListTemplate";

export default function PmoeOfficeList() {
    return (
        <OfficeListTemplate
            title="Provincial Ministry of Education"
            subtitle="Manage Provincial Ministry of Education office profile and account"
            endpoint="/pmoe-list"
            // createLabel="Create Provincial Ministry of Education"
        />
    );
}
