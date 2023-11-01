import {http} from './config'

export default{

    list:(params) => {
        return http.get("user/paged" , {
          params: {
            Page: params.Page,
            PageSize: params.PageSize,
            OrderByProperty: params.OrderByProperty,
            Desc: params.Desc,
            Search: params.Search,
          },
        })
      },

      select: () => {
        return http.get("user/getSelect");
      },

      listDash:()=> {
        return http.get("user/dash");
      },

    save:(user)=>{
      return http.post("user", user)
    },

    update:(user)=> {
      return http.put(`user/${user.id}`, user)
    },

    delete:(user) => {
      return http.delete (`user/${user.id}` , user)
    }

}