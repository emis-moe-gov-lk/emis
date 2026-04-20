export const mapByKey = (list, keyField, valueField) => {
    return list.reduce((acc, item) => {
        acc[item[keyField]] = item[valueField];
        return acc;
    }, {});
};
