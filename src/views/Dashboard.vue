<template>
  <v-app>
    <v-divider color="white" class="mt-1" dark></v-divider>
    <v-container class="father">
      <v-row>
        <v-col cols="12" sm="12">
          <v-toolbar flat color="rgba(0,0,0,0)" class="mt-n5">
            <v-toolbar-title>Dashboard</v-toolbar-title>
          </v-toolbar>
          <v-row class="px-5 mt-n6">
            <v-col
              cols="12"
              sm="3"
              class="centro"
              v-for="list in lists"
              :key="list.title"
            >
              <v-card
                align="center"
                color="#f9faf"
                class="rounded-circle border circulo"
                flat
              >
                <v-icon size="50" color="blue">{{ list.icon }}</v-icon>
                <v-card-text class="grey--text text-lg-h6">{{ list.title }}</v-card-text>
                <v-btn
                  absolute
                  color="blue darken-3"
                  class="white--text btn"
                  fab
                  left
                  top
                  @click="navigateToRoute(list.route)"
                >
                  {{ list.count }}
                </v-btn>
              </v-card>
            </v-col>
          </v-row>
          <v-row class="mt-n5">
            <v-card
              class="mt-7 card"
              style="width: 97%; margin-left: 1.4%"
              height="160"
            >
              <v-card-title class="centro">
                <v-icon>mdi-book</v-icon>
                Último livro alugado:
              </v-card-title>
              <v-card-content>
                <div class="centro mb-3">
                  <v-icon class="mr-2">mdi-book-open-variant</v-icon>
                  <span class="align-middle">
                    Livro: {{ ultimoLivroAlugado ? ultimoLivroAlugado.book.name : 'Nenhum livro disponível' }}
                  </span>
                </div>

                <div class="centro">
                  <v-icon class="mr-2">mdi-account</v-icon>
                  <span class="align-middle">
                    Usuário: {{ ultimoUsuarioAlugou ? ultimoUsuarioAlugou : 'Nenhum usuário disponível' }}
                  </span>
                </div>
              </v-card-content>
            </v-card>
            <v-col cols="12" sm="6">
              <div class="pt-5"><LineChart /></div>
            </v-col>
            <v-col cols="12" sm="6">
              <div class="mt-7"><Table /></div>
            </v-col>
          </v-row>
        </v-col>
      </v-row>
    </v-container>
  </v-app>
</template>

<script>
import Table from "../components/Table";
import LineChart from "../components/LineChart";
import Rental from "../services/rental";
import Book from "../services/book";
import User from "../services/user";
import Publisher from "../services/publisher";

export default {
  name: "DashBoard",
  data() {
    return {
      usuarioComMaisAlugueis: null,
      ultimoUsuarioAlugou: null,
      users: [],
      books: [],
      rentals: [],
      publishers: [],
      lists: [
        {
          icon: "mdi-account",
          title: "Usuários",
          count: 0,
          route: "userview",
        },
        {
          icon: "mdi-book-open-variant",
          title: "Livros",
          count: 0,
          route: "bookview",
        },
        {
          icon: "mdi-domain",
          title: "Editoras",
          count: 0,
          route: "pubview",
        },
        {
          icon: "mdi-file-document",
          title: "Alugueis",
          count: 0,
          route: "rentalview",
        },
      ],
    };
  },
  components: {
    LineChart,
    Table,
  },
  methods: {
    updateCounts() {
      this.RentalList();
      this.BookList();
      this.UserList();
      this.PubList();
    },

     async RentalList() {
     await Rental.listDash().then((response) => {
        this.rentals = response.data.data;
         this.rentals.sort((a, b) => b.id - a.id);
          if (this.rentals.length > 0) {
      this.ultimoLivroAlugado = this.rentals[0]; 
      this.ultimoUsuarioAlugou = this.ultimoLivroAlugado.user.name; 
    } else {
      this.ultimoLivroAlugado = null; // Define como nulo se não houver aluguel
      this.ultimoUsuarioAlugou = null; // Define como nulo se não houver aluguel
    }
        this.lists.find((item) => item.title === "Alugueis").count =
          this.rentals.length;
      });
    },
 
   async BookList() {
     await Book.listDash().then((response) => {
        this.books = response.data.data;
        this.lists.find((item) => item.title === "Livros").count =
          this.books.length;
      });
    },
   async UserList() {
     await User.listDash().then((response) => {
        this.users = response.data.data;
        this.lists.find((item) => item.title === "Usuários").count =
          this.users.length;
      });
    },
    async PubList() {
      await Publisher.listDash().then((response) => {
        this.publishers = response.data.data;
        this.lists.find((item) => item.title === "Editoras").count =
          this.publishers.length;
      });
    },
    navigateToRoute(routeName) {
      this.$router.push({ name: routeName });
    },
  },
  mounted() {
    this.updateCounts();
  },
};
</script>

<style scoped>
.border {
  border: 2px solid #2e8faf !important;
}

.v-card__text {
  padding-top: 4px;
}

.v-btn--fab.v-size--default.v-btn--absolute.v-btn--top {
  top: 40px !important;
}

.v-btn--absolute.v-btn--left,
.v-btn--fixed.v-btn--left {
  left: -30px !important;
}

.card {
  height: 120px;
  border: 1px solid #adadadee;
}

.centro {
  display: flex;
  text-align: center;
  justify-content: center;
}

.father {
  border: 1px solid #eeee;
  border-radius: 3px;
  box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.3);
  margin: 0 auto;
}

.btn {
  width: 50px;
  height: 50px;
}

.circulo {
  width: 140px;
  height: 140px;
  padding-top: 27px;
}

@media screen and (max-width: 804px) {
  .btn {
    width: 50px;
    height: 50px;
  }

  .v-btn--absolute.v-btn--left,
  .v-btn--fixed.v-btn--left {
    left: -16% !important;
  }
}

@media screen and (max-width: 712px) {
  .btn {
    width: 46px;
    height: 46px;
  }

  .v-btn--absolute.v-btn--left,
  .v-btn--fixed.v-btn--left {
    left: -18% !important;
  }

  .circulo {
    height: 100px;
    width: 100px;
    padding-top: 18px;
  }
}

@media screen and (max-width: 701px) {
  .circulo {
    height: 110px;
    width: 110px;
    padding-top: 14px;
  }

  .btn {
    width: 40px;
    height: 40px;
  }

  .v-btn--absolute.v-btn--left,
  .v-btn--fixed.v-btn--left {
    left: -18% !important;
  }
  .v-btn--fab.v-size--default.v-btn--absolute.v-btn--top {
    top: 34px !important;
  }
}
</style>

