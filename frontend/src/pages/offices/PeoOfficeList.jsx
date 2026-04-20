import OfficeListTemplate from "./OfficeListTemplate";

export default function PeoOfficeList() {
    return (
        <OfficeListTemplate
            title="Provincial Department of Education"
            subtitle="Manage Provincial Department of Education office profile and account"
            endpoint="/peo-list"
            createLabel="Create Provincial Department of Education"
        />
    );
}
