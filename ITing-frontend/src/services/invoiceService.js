import axios from "../utils/axiosInstance";

const invoiceService = {
  list: () => axios.get('/me/invoices').then((r) => r.data),
  getDownloadUrl: (id) => axios.get(`/me/invoices/${id}/download`).then((r) => r.data),
  updateBillTo: (id, payload) =>
    axios.post(`/me/invoices/${id}/bill-to`, payload).then((r) => r.data),
};

export default invoiceService;
