<template>
  <v-flex>
    <div class="title text-center">Usuários com mais alugueis</div>
    <div class="table_container">
      <v-simple-table>
        <template v-slot:default>
          <thead>
            <tr>
              <th class="text-left">Usuário</th>
              <th class="text-center">Total de Livros Alugados</th>
            </tr>
          </thead>
          <tbody>

            <template v-if="limitedUserBookCounts.length === 0">
              <tr>
                <td colspan="2" class="text-center">Nenhum usuário com pelo menos 2 livros alugados </td>
              </tr>
            </template>
    
            <tr v-for="(userCount, index) in limitedUserBookCounts" :key="index">
              <td>{{ userCount[0] }}</td>
              <td class="text-center">{{ userCount[1] }}</td>
            </tr>
          </tbody>
        </template>
      </v-simple-table>
    </div>
  </v-flex>
</template>

<script>
import Rental from "../services/rental";

export default {
  name: "BooksRentedByUserTable",
  data() {
    return {
      userBookCounts: [],
      minBooksAlugados: 2, 
      maxDisplayedUsers: 7,
    };
  },
  mounted() {
    this.fetchUserBookCounts();
  },
  computed: {
    filteredUserBookCounts() {
      return this.userBookCounts.filter(userCount => userCount[1] >= this.minBooksAlugados);
    },
    limitedUserBookCounts() {
      return this.filteredUserBookCounts.slice(0, this.maxDisplayedUsers);
      
    },
  },
 methods: {
  async fetchUserBookCounts() {
  try {
    const response = await Rental.listDash();

    if (Array.isArray(response.data.data)) {
      const userBookCountMap = {};

      response.data.data.forEach((rental) => {
        const userName = rental.user.name;

        if (userBookCountMap[userName]) {
          userBookCountMap[userName]++;
        } else {
          userBookCountMap[userName] = 1;
        }
      });

      
      this.userBookCounts = Object.entries(userBookCountMap);

      
      this.userBookCounts.sort((a, b) => b[1] - a[1]);

      
    } else {
      console.error("Os dados da resposta não são um array:", response.data.data);
    }
  } catch (error) {
    console.error("Erro ao buscar dados:", error);
  }
},

},
};
</script>

<style scoped>
.table_container {
  
  margin-top: 22px;
  border: 1px solid #e2e2e2; 
  border-radius: 3px;
}

.title {
  font-size: 18px;
  margin-bottom: 16px;
  text-align: center;
}
</style>

