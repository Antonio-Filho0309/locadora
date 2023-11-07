<template>
  <v-card>
    <v-card-title>
      <v-text-field
        v-model="searchBar"
        @input="updateSearch"
        append-icon="mdi-magnify"
        label="Pesquisar"
        single-line
        hide-details
      ></v-text-field>
    </v-card-title>

    <v-data-table
      :headers="headers"
      :items="rentals"
      :search="searchBar"
      :loading="loadingTable"
      loading-text="Carregando..."
      :server-items-length="total"
      @update:options="handleOptionsUpdate"
      class="elevation-1"
      :items-per-page="pageSize"
      :page="page"
      :footer-props="{
        itemsPerPageOptions: [5, 10, 25, this.total],
        itemsPerPageText: 'Linhas por página',
      }"
    >
      <template v-slot:[`item.rentalDate`]="{ item }">
        <td>{{ item.rentalDate | formatDate }}</td>
      </template>
      <template v-slot:[`item.previewDate`]="{ item }">
        <td>{{ item.previewDate | formatDate }}</td>
      </template>
      <template v-slot:[`item.returnDate`]="{ item }">
        <td>
          {{ item.returnDate | formatDate }}
        </td>
        <td
          v-if="item.returnDate == null"
          style="font-style: italic; color: #a2a2a2"
        >
          Aguardando...
        </td>
      </template>
      <template v-slot:top>
        <v-toolbar flat>
          <v-toolbar-title>
            <h2>Alugueis</h2>
          </v-toolbar-title>
          <v-spacer></v-spacer>
          <v-dialog v-model="dialog" max-width="500px">
            <template v-slot:activator="{ on, attrs }">
              <v-btn color="primary" dark class="mb-2" v-bind="attrs" v-on="on">
                Adicionar Aluguel
              </v-btn>
            </template>

            <v-form ref="rentalForm" @submit.prevent="save">
              <v-card>
                <v-card-title>
                  <span class="text-h5">{{ formTitle }}</span>
                </v-card-title>
                <v-card-text>
                  <v-container>
                    <v-autocomplete
                      :key="resetAutocompleteKey"
                      label="Nome do Livro"
                      :rules="rulesNumber"
                      hide-details="auto"
                      required
                      v-model="rental.book"
                      :items="booksList"
                      item-text="name"
                      item-value="id"
                      prepend-icon="mdi-book"
                    ></v-autocomplete>
                    <v-autocomplete
                      label="Usuário"
                      :rules="rulesNumber"
                      hide-details="auto"
                      required
                      v-model="rental.user"
                      :items="usersList"
                      item-value="id"
                      item-text="name"
                      prepend-icon="mdi-account-circle"
                    ></v-autocomplete>
                    <v-row class="my-3">
                      <v-col cols="6">
                        <v-text-field
                          disabled
                          label="Data do Aluguel"
                          hide-details="auto"
                          v-model="rental.rentalDate"
                          type="date"
                        >
                        </v-text-field>
                      </v-col>
                      <v-col cols="6">
                        <v-text-field
                          label="Previsão de Devolução"
                          :rules="rulesNumber"
                          hide-details="auto"
                          required
                          v-model="rental.previewDate"
                          type="date"
                        >
                        </v-text-field>
                      </v-col>
                    </v-row>
                  </v-container>
                </v-card-text>
                <v-card-actions>
                  <v-spacer></v-spacer>
                  <v-btn text color="error" @click="close"> Fechar </v-btn>
                  <v-btn text color="primary" @click="addRental"> Feito </v-btn>
                </v-card-actions>
              </v-card>
            </v-form>
          </v-dialog>
        </v-toolbar>
      </template>

      <template v-slot:[`item.status`]="{ item }">
        <td>
          <v-chip :class="statusClass(item)" class="white--text">{{
            item.status
          }}</v-chip>
        </td>
      </template>

      <template slot="item.actions" slot-scope="{ item }">
        <v-btn
          v-if="item.status == 'Pendente'"
          text
          small
          @click="BookReturn(item)"
        >
          <v-icon class="green--text">mdi-book</v-icon>
        </v-btn>
      </template>
    </v-data-table>
  </v-card>
</template>
<script>
import Swal from "sweetalert2";
import User from "../services/user";
import Book from "../services/book";
import Rental from "../services/rental";
export default {
  filters: {
    formatDate: function (value) {
      if (value) {
        const date = new Date(value);
        return date.toLocaleDateString("pt-BR");
      }
      return "";
    },
  },

  data() {
    return {
      usersList: [],
      booksList: [],
      search: "",
      searchBar: "",
      total: 0,
      page: 1,
      pageSize: 5,
      orderByProperty: "id",
      desc: false,
      returnDate: null,
      resetAutocompleteKey: 0,
      loadingTable: true,
      formIsValid: false,
      formattedSearch: "",
      rulesNumber: [(value) => !!value || "Campo Obrigatório"],
      dialog: false,
      headers: [
        { text: "ID", value: "id" },
        { text: "Livro", value: "book.name" },
        { text: "Usuário", value: "user.name" },
        { text: "Data do Aluguel", value: "rentalDate" },
        { text: "Previsão de Devolução", value: "previewDate" },
        { text: "Data de Devolução", value: "returnDate" },
        { text: "Status", value: "status", align: "center", sortable: false },
        { text: "Ações", value: "actions", sortable: false },
      ],
      rentals: [],

      rental: {
        id: 0,
        book: 0,
        user: 0,
        rentalDate: new Date().toISOString().substr(0, 10),
        previewDate: "",
        returnDate: "",
        status: "",
      },
      
      errors: [],
      editedIndex: -1,
    };
  },

  mounted() {
    this.list();
    this.listUsers();
    this.listBooks();
  },

  computed: {
    formTitle() {
      return "Adicionar Aluguel";
    },
  },

  watch: {
    dialog(val) {
      if (!val) this.close();
    },

    search: function () {
      this.list();
    },
  },

  methods: {
    checkFormValidity() {
      this.formIsValid = this.$refs.rentalForm.validate();
    },

     updateSearch(newSearchValue) {
      const dateRegex = /^(\d{1,2})\/?(\d{1,2})?\/?(\d{0,4})?$/;
      this.page = 1;

      if (dateRegex.test(newSearchValue)) {
        this.search = this.parseDate(newSearchValue);
      } else if (newSearchValue.match(/^\d{1,2}\/$/)) {
        this.search = this.parseDate(newSearchValue);
      } else {
        this.search = newSearchValue;
      }
      this.list();
    },

    parseDate(date) {
      const dateParts = date.split("/");
      let formattedDate = "";

      if (dateParts.length >= 1) {
        const day = dateParts[0];
        formattedDate = `${day}`;
      }

      if (dateParts.length >= 2) {
        const month = dateParts[1];
        if (month.length === 2) {
          formattedDate = `${month}-${formattedDate}`;
        }
      }

      if (dateParts.length >= 3) {
        const year = dateParts[2];
        if (year.length === 4) {
          formattedDate = `${year}-${formattedDate}`;
        }
      }
      return formattedDate;
    },
    /*para dizer a cor do status*/
    statusClass(item) {
      if (item.status == "Atrasado") {
        return "red";
      } else if (item.status == "No prazo") {
        return "green";
      } else {
        return "yellow";
      }
    },

    handleOptionsUpdate(options) {
      const sortByMapping = {
        id: "Id",
        book: "Book",
        user: "User",
        rentalDate: "RentalDate",
        previewDate: "PreviewDate",
        returnDate: "ReturnDate",
        status: "Status",
      };
      if (options.sortBy[0] || options.sortDesc[0]) {
        this.orderByProperty = sortByMapping[options.sortBy[0]];
        this.desc = options.sortDesc[0];
      } else {
        this.orderByProperty = "Id";
        this.desc = false;
      }
      this.pageSize = options.itemsPerPage;
      this.page = options.page;
      this.total = options.itemsPerPage;
      this.itemsPerPage = options.itemsPerPage;
      this.list();
    },

    async list() {
      try {
        const response = await Rental.list({
          Page: this.page,
          PageSize: this.pageSize,
          OrderByProperty: this.orderByProperty,
          Desc: this.desc,
          Search: this.search,
        });
        this.rentals = response.data.data;
        this.total = response.data.totalRegisters;
      } catch (error) {
        console.log("Erro ao Listar: ", error);
        if (error.response.status == 404) {
          this.rentals = [];
          console.log(error.response.data.message);
        }
      } finally {
        this.loadingTable = false;
      }
    },

    async listUsers() {
      try {
        const response = await User.select();
        this.usersList = response.data.data;
      } catch (error) {
        console.error("Erro ao buscar usuários", error);
      }
    },

    async listBooks() {
      try {
        const response = await Book.select();
        this.booksList = response.data.data;
      } catch (error) {
        console.error("Erro ao buscar usuários", error);
      }
    },

    // Listar

    BookReturn(item) {
      Swal.fire({
        icon: "warning",
        title: "Deseja Devolver o livro?",
        text: "Essa ação não pode ser desfeita!",
        showCancelButton: true,
        confirmButtonText: "Sim",
        cancelButtonText: "Não",
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
      }).then((result) => {
        if (result.isConfirmed) {
          const RentalDevo = {
            id: item.id,
            returnDate: new Date().toISOString().substr(0, 10),
          };
          console.log(RentalDevo);
          Rental.update(RentalDevo).then((response) => {
            Swal.fire({
              icon: "success",
              title: response.data.message,
              showConfirmButton: false,
              timer: 2000,
            });

            this.list();
            this.$refs.rentalForm.resetValidation();
          });
        }
      });
    },

    close() {
      this.dialog = false;
      this.rental = {
        id: 0,
        book: 0,
        user: 0,
        rentalDate: new Date().toISOString().substr(0, 10),
        previewDate: "",
        returnDate: "",
        status: "",
      };
      this.resetAutocompleteKey++;
       this.$refs.rentalForm.resetValidation();
    },

    save() {

      const newRental = {
        bookId: this.rental.book,
        userId: this.rental.user,
        rentalDate: this.rental.rentalDate,
        previewDate: this.rental.previewDate,
      };

      Rental.save(newRental)
        .then((response) => {
          Swal.fire({
            icon: "success",
            title: response.data.message,
            showConfirmButton: false,
            timer: 2000,
          });
          this.list();
          this.listBooks();
          this.close();
        })
        .catch((error) => {
          console.log(error.response.data.message);
          Swal.fire({
            icon: "error",
            title: "Erro ao cadastrar livro",
            text: error.response.data.message,
            showConfirmButton: false,
            timer: 3000,
          });
        });
    },

    addRental() {
      this.checkFormValidity();
      if (this.formIsValid) {
        this.save();
      }
    },
  },
};
</script>

<style>
.swal2-popup {
  font-family: 'Arial', sans-serif;
}

.swal2-title {
  font-size: 31px;
}
</style>
