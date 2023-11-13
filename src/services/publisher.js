import { http } from "./config";

export default {
  list: (params) => {
    return http.get("publisher/paged", {
      params: {
        PageNumber: params.PageNumber,
        PageSize: params.PageSize,
        OrderByProperty: params.OrderByProperty,
        Desc: params.Desc,
        Search: params.Search,
      },
    });
  },

  listDash:()=> {
    return http.get("publisher/dash");
  },

  select: () => {
    return http.get("publisher/getSelect");
  },

  save: (publisher) => {
    return http.post("publisher", publisher);
  },

  update: (publisher) => {
    return http.put(`publisher/${publisher.id}`, publisher);
  },

  delete: (publisher) => {
    return http.delete(`publisher/${publisher.id}`, publisher);
  },
};
