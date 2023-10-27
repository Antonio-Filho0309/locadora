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
import Aluguel from "../services/aluguel";

export default {
  name: "BooksRentedByUserTable",
  data() {
    return {
      userBookCounts: [],
      minBooksAlugados: 10, 
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
    fetchUserBookCounts() {
  try {
    Aluguel.list().then((response) => {
      const userBookCountMap = {};

      response.data.forEach((aluguel) => {
        const userId = aluguel.usuario_id.nome;
        if (userBookCountMap[userId]) {
          userBookCountMap[userId]++;
        } else {
          userBookCountMap[userId] = 1;
        }
      });

      // Transforma o objeto em um array de pares [usuário, total]
      this.userBookCounts = Object.entries(userBookCountMap);

      // Ordena o array pelo total de livros alugados (segundo elemento de cada par)
      this.userBookCounts.sort((a, b) => b[1] - a[1]);
    });
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

