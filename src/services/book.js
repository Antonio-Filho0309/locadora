import {http} from './config'

export default{

    list:(params) => {
        return http.get("book/paged",{
          params: {
            Page: params.Page,
            PageSize: params.PageSize,
            OrderByProperty: params.OrderByProperty,
            Desc: params.Desc,
            Search: params.Search,
          },
        })
      },

      listDash:()=> {
        return http.get("book/dash");
      },

      select: () => {
        return http.get("book/getSelect");
      },

    save:(book)=>{
      return http.post("book", book)
    },

    update:(book)=> {
      return http.put(`book/${book.id}`, book)
    },

    delete:(book) => {
      return http.delete (`book/${book.id}`, book)
    }

}