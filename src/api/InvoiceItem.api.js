import { http } from "./http";

export async function getInvoiceItemsByInvoiceId(invoiceId) {
    const { data } = await http.get(
        `/InvoiceItem/GetInvoiceItemsByInvoiceId/${invoiceId}`,
    );
    return data;
}
