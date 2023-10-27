import {http} from './config'

export default{

    list:() => {
        return http.get("alugueis")
      },

    save:(aluguel)=>{
      return http.post("aluguel", aluguel)
    },

    update:(aluguel)=> {
      return http.put("aluguel", aluguel)
    },

    delete:(aluguel) => {
      return http.delete ("aluguel", {data: aluguel})
    }

}