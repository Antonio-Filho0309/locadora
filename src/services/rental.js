import {http} from './config'

export default{

    list:(params) => {
        return http.get("rental/paged", {
          params : {
            Page: params.Page,
            PageSize: params.PageSize,
            OrderByProperty: params.OrderByProperty,
            Desc: params.Desc,
            Search: params.Search,
          }
        })
      },

      listDash:()=> {
        return http.get("rental/dash");
      },

    save:(rental)=>{
      return http.post("rental", rental)
    },

    update:(rental)=> {
      return http.put(`rental/${rental.id}`, rental)
    },
}