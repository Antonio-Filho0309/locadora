<template>
  <v-card>
    <v-card-title>
      <v-text-field
        v-model="search"
        append-icon="mdi-magnify"
        label="Pesquisar"
        single-line
        hide-details
      ></v-text-field>
    </v-card-title>

    <v-data-table
      :headers="headers"
      :items="books"
      :search="search"
      :loading="loadingTable"
      loading-text="Carregando..."
      no-data-text="Não encontrado"
      :server-items-length="total"
      @update:options="handleOptionsUpdate"
      class="elevation-1"
      :items-per-page="pageSize"
      :header-props="headerProps"
      :pageNumber="pageNumber"
      :footer-props="{
        itemsPerPageOptions: [5, 10, 25, this.total],
        itemsPerPageText: 'Linhas por página',
        pageText: '{0}-{1} de {2}',
      }"
    >
      <template v-slot:top>
        <v-toolbar flat>
          <v-toolbar-title>
            <h2>Livros</h2>
          </v-toolbar-title>
          <v-spacer></v-spacer>
          <v-dialog v-model="dialog" max-width="500px">
            <template v-slot:activator="{ on, attrs }">
              <v-btn color="primary" dark class="mb-2" v-bind="attrs" v-on="on">
                Adicionar Livro
              </v-btn>
            </template>
            <v-form ref="bookForm" @submit.prevent="save">
              <v-card>
                <v-card-title>
                  <span class="text-h5">{{ formTitle }}</span>
                </v-card-title>
                <v-card-text>
                  <v-container>
                    <v-text-field
                      :key="resetAutocompleteKey"
                      label="Nome"
                      :rules="rules"
                      hide-details="auto"
                      required
                      v-model="book.name"
                      prepend-icon="mdi-book"
                    ></v-text-field>
                    <v-text-field
                      label="Autor"
                      :rules="rules"
                      hide-details="auto"
                      required
                      v-model="book.author"
                      prepend-icon="mdi-city"
                    ></v-text-field>
                    <v-text-field
                      v-model="book.release"
                      :rules="rulesYear"
                      label="Ano de lançamento"
                      prepend-icon="mdi-calendar"
                      type="number"
                      required
                      :max="2500"
                      :min="1000"
                      class="mt-4"
                    ></v-text-field>
                    <v-autocomplete
                      v-model="book.publisher"
                      :items="publishersList"
                      item-text="name"
                      item-value="id"
                      label="Editora do Livro"
                      prepend-icon="mdi-domain"
                      :rules="rulesNumber"
                      required
                      no-data-text="Não encontrado"
                    ></v-autocomplete>
                    <v-text-field
                      v-model="book.quantity"
                      label="Quantidade de livros"
                      prepend-icon="mdi mdi-book-plus-multiple-outline"
                      type="number"
                      :rules="rulesNumber"
                      required
                    ></v-text-field>
                  </v-container>
                </v-card-text>
                <v-card-actions>
                  <v-spacer></v-spacer>
                  <v-btn text color="error" @click="close"> Fechar </v-btn>
                  <v-btn text color="primary" @click="addBook"> Feito </v-btn>
                </v-card-actions>
              </v-card>
            </v-form>
          </v-dialog>
        </v-toolbar>
      </template>
      <template slot="item.actions" slot-scope="{ item }">
        <v-btn small text @click="editItem(item)">
          <v-icon class="primary--text">mdi-pencil</v-icon>
        </v-btn>
        <v-btn text small @click="deleteItem(item)">
          <v-icon class="error--text">mdi-delete</v-icon>
        </v-btn>
      </template>
    </v-data-table>
  </v-card>
</template>
<script>
import Swal from "sweetalert2";
import Book from "../services/book";
import Publisher from "../services/publisher";

export default {
  data() {
    return {
      headerProps: {
        sortByText: "Ordenar por",
      },
      publishersList: [],
      resetAutocompleteKey: "",
      search: "",
      loadingTable: true,
      formIsValid: false,
      dialog: false,

      rules: [
        (value) => !!value || "Campo Obrigatório",
        (value) => (value && value.length >= 3) || "Mínimo 3 caracteres",
      ],
      rulesNumber: [(value) => !!value || "Campo Obrigatório"],
      currentYear: new Date().getFullYear(),
      rulesYear: [
        (v) => !!v || "Campo obrigatório",
        (v) =>
          (v && v <= this.currentYear) ||
          "Ano não pode ser maior que o ano atual",
      ],

      headers: [
        { text: "ID", value: "id" },
        { text: "Nome", value: "name" },
        { text: "Autor", value: "author" },
        { text: "Lançamento", value: "release" },
        { text: "Editora", value: "publisher.name" },
        { text: "Quantidade", value: "quantity" },
        { text: "Total Alugado", value: "rented" },
        { text: "Ações", value: "actions", sortable: false },
      ],

      book: {
        id: 0,
        name: "",
        author: "",
        release: null,
        publisher: 0,
        quantity: null,
        rented: null,
      },
      books: [],
      errors: [],
      editedIndex: -1,

      total: 0,
      pageNumber: 1,
      pageSize: 5,
      orderByProperty: "id",
      desc: false,
    };
  },

  mounted() {
    this.list();
    this.listPublishers();
  },

  computed: {
    formTitle() {
      return this.editedIndex === -1 ? "Adicionar Livro" : "Editar Livro";
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
    async listPublishers() {
      try {
        const response = await Publisher.select();
        this.publishersList = response.data.data;
      } catch (error) {
        console.error("Erro ao buscar editoras", error);
      }
    },
    checkFormValidity() {
      this.formIsValid = this.$refs.bookForm.validate();
    },

    handleOptionsUpdate(options) {
      const sortByMapping = {
        id: "Id",
        name: "Name",
        author: "Author",
        release: "release",
        publisher: "publisher",
        quantity: "quantity",
        rented: "rented",
      };
      if (options.sortBy[0] || options.sortDesc[0]) {
        this.orderByProperty = sortByMapping[options.sortBy[0]];
        this.desc = options.sortDesc[0];
      } else {
        this.orderByProperty = "Id";
        this.desc = false;
      }
      this.pageSize = options.itemsPerPage;
      this.pageNumber = options.page;
      this.total = options.itemsPerPage;
      this.itemsPerPage = options.itemsPerPage;
      this.list();
    },

    async list() {
      try {
        const response = await Book.list({
          PageNumber: this.pageNumber,
          PageSize: this.pageSize,
          OrderByProperty: this.orderByProperty,
          Desc: this.desc,
          Search: this.search,
        });
        this.books = response.data.data;
        this.total = response.data.totalRegisters;
      } catch (error) {
        console.error("Erro ao Listar: ", error);
        if (error.response.status == 404) {
          this.books = [];
          console.log(error.response.data.message);
        }
      } finally {
        this.loadingTable = false;
      }
    },

    editItem(item) {
      this.book.id = item.id;
      this.book.name = item.name;
      this.book.author = item.author;
      this.book.publisher = item.publisherId;
      this.book.release = item.release;
      this.book.quantity = item.quantity;
      this.editedIndex = this.books.indexOf(item);
      this.dialog = true;
      this.checkFormValidity();
    },

    deleteItem(book) {
      Swal.fire({
        icon: "warning",
        title: "Deseja excluir o livro?",
        text: "Essa ação não pode ser desfeita!",
        showCancelButton: true,
        confirmButtonText: "Sim",
        cancelButtonText: "Não",
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
      }).then((result) => {
        if (result.isConfirmed) {
          Book.delete(book)
            .then((response) => {
              Swal.fire({
                icon: "sucess",
                title: response.data.message,
                showConfirmButton: false,
                timer: 3000,
              });
              this.list();
            })
            .catch((error) => {
              console.error(error);
              Swal.fire({
                icon: "error",
                title: "Erro ao excluir livro",
                text: error.response.data.message,
                showConfirmButton: false,
                timer: 3000,
              });
            });
        }
      });
    },

    close() {
      this.dialog = false;
      this.book = {
        id: "",
        name: "",
        author: "",
        publisher: 0,
        release: null,
        quantity: null,
        rented: null,
      };
      this.editedIndex = -1;
      this.resetAutocompleteKey++;
      this.checkFormValidity();
      this.$refs.bookForm.reset();
    },

    save() {
      if (!this.book.id) {
        const createBook = {
          name: this.book.name,
          author: this.book.author,
          publisherId: this.book.publisher,
          release: this.book.release,
          quantity: this.book.quantity,
          rented: null,
        };
        Book.save(createBook)
          .then((response) => {
            Swal.fire({
              icon: "success",
              title: response.data.message,
              showConfirmButton: false,
              timer: 2000,
            });
            this.close();
            this.list();
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
      } else {
        const editBook = {
          id: this.book.id,
          name: this.book.name,
          author: this.book.author,
          publisherId: this.book.publisher,
          release: this.book.release,
          quantity: this.book.quantity.toString(),
        };
        Book.update(editBook)
          .then((response) => {
            Swal.fire({
              icon: "success",
              title: response.data.message,
              showConfirmButton: false,
              timer: 2000,
            });
            this.list();
            this.close();
            this.$refs.bookForm.reset();
          })
          .catch((error) => {
            console.log(error.response.data.message);
            Swal.fire({
              icon: "error",
              title: "Erro ao atualizar livro",
              text: error.response.data.message,
              showConfirmButton: false,
              timer: 3000,
            });
          });
      }
    },

    addBook() {
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
  font-family: "Arial", sans-serif;
}

.swal2-title {
  font-size: 31px;
}
</style>
