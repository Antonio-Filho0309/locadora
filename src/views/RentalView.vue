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
      :items="rentals"
      :search="search"
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
            <td v-if="item.returnDate != null">
              {{ item.returnDate | formatDate }}
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

            <v-form ref="RentalForm" @submit.prevent="save">
              <v-card>
                <v-card-title>
                  <span class="text-h5">{{ formTitle }}</span>
                </v-card-title>
                <v-card-text>
                  <v-container>
                    <v-select
                      label="Nome do Livro"
                      :rules="rulesNumber"
                      hide-details="auto"
                      required
                      v-model="rental.book"
                      :items="booksList"
                      item-text="name"
                      item-value="id"
                      prepend-icon="mdi-book"
                    ></v-select>
                    <v-select
                      label="Usuário"
                      :rules="rulesNumber"
                      hide-details="auto"
                      required
                      v-model="rental.user"
                      :items="usersList"
                      item-value="id"
                      item-text="name"
                      prepend-icon="mdi-account-circle"
                    ></v-select>
                    <v-row class="my-3">
                      <v-col cols="6">
                        <v-text-field
                          disabled
                          label="Data do Aluguel"
                          hide-details="auto"
                          v-model="rentalDate"
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
                          v-model="previewDate"
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
                  <v-btn text color="primary" @click="save"> Feito </v-btn>
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
          @click="devolItem(item)"
        >
          <v-icon class="green--text">mdi-book</v-icon>
        </v-btn>
        <v-btn
          v-if="item.status == 'Pendente'"
          text
          small
          @click="deleteItem(item)"
        >
          <v-icon class="error--text">mdi-delete</v-icon>
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
        return date.toLocaleDateString("pt-BR"); // ou qualquer outro formato desejado
      }
      return "";
    },
  },

  data() {
    return {
      usersList: [],
      booksList: [],
      search: "",
      total: 0,
      page: 1,
      pageSize: 5,
      orderByProperty: "id",
      desc: false,
      rentalDate: null,
      previewDate: null,
      returnDate: null,
      loadingTable: true,
      formIsValid: false,
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
        rentalDate: null,
        previewDate: null,
        returnDate: null,
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
      return this.editedIndex === -1 ? "Adicionar Aluguel" : "Editar Aluguel";
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
    resetValidation() {
      this.$refs.AluguelForm.resetValidation();
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

    checkFormValidity() {
      this.formIsValid = this.$refs.AluguelForm.validate();
    },

    // Listar

    devolItem(item) {
      Swal.fire({
        title: "Devolver livro?!",
        text: "Tem certeza que deseja fazer isso ?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Confirmar",
        confirmButtonColor: "#1976d2",
        cancelButtonText: "Cancelar",
        cancelButtonColor: "#ff5252",
      }).then((result) => {
        if (result.isConfirmed) {
          this.devolver(item);
        }
      });
    },

    devolver(aluguel) {
      if (aluguel.data_devolucao == "Não devolvido") {
        this.selectedAlugId = aluguel.id;
        this.livro_id = aluguel.livro_id;
        this.usuario_id = aluguel.usuario_id;
        this.data_aluguel_temp = aluguel.data_aluguel;
        this.data_previsao = aluguel.data_previsao;
        this.confirmDevol();
      } else {
        Swal.fire("O livro já foi devolvido!", "", "error");
      }
    },

    confirmDevol() {
      const selectedLivro = this.livros.find(
        (livro) => livro.nome === this.livro_id
      );
      const selectedUsuario = this.usuarios.find(
        (usuario) => usuario.nome === this.usuario_id
      );

      const RentalDevo = {
        id: this.selectedAlugId,
        livro_id: selectedLivro ? { ...selectedLivro } : this.livro_id,
        usuario_id: selectedUsuario ? { ...selectedUsuario } : this.usuario_id,
        data_aluguel: this.parseDate(this.data_aluguel_temp),
        data_previsao: this.parseDate(this.data_previsao),
        data_devolucao: new Date().toISOString().substr(0, 10),
        status: "No Prazo",
      };
      Rental.update(RentalDevo).then(() => {
        this.alugueis = this.alugueis.map((aluguel) => {
          if (this.selectedALugId === RentalDevo.id) {
            return RentalDevo;
          } else {
            return aluguel;
          }
        });
        Swal.fire({
          icon: "success",
          title: "Devolução realizada com sucesso!",
          showConfirmButton: false,
          timer: 2000,
        });
        this.list();
        this.zerar();
        this.resetValidation();
      });
    },

    removerAluguel(aluguelId) {
      this.alugueis = this.alugueis.filter(
        (aluguel) => aluguel.id !== aluguelId
      );
    },

    deleteItem(aluguel) {
      Swal.fire({
        icon: "warning",
        title: "Deseja excluir o aluguel?",
        text: "Essa ação não pode ser desfeita!",
        showCancelButton: true,
        confirmButtonText: "Sim",
        cancelButtonText: "Não",
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
      }).then((result) => {
        if (result.isConfirmed) {
          const selectedBook = this.livros.find(
            (livro) => livro.nome === aluguel.livro_id
          );

          const selectedUser = this.usuarios.find(
            (usuario) => usuario.nome === aluguel.usuario_id
          );

          const deleteAlug = {
            id: aluguel.id,
            livro_id: selectedBook,
            usuario_id: selectedUser,
            data_aluguel: this.parseDate(aluguel.data_aluguel),
            data_previsao: this.parseDate(aluguel.data_previsao),
            data_devolucao:
              aluguel.data_devolucao !== "Não devolvido"
                ? aluguel.data_devolucao
                : null,
          };

          Rental.delete(deleteAlug)
            .then(() => {
              Swal.fire({
                icon: "success",
                title: "Aluguel excluído com sucesso!",
                showConfirmButton: false,
                timer: 2000,
              });
              this.removerAluguel(deleteAlug.id);
              this.close();
              this.list();
              this.zerar();
              this.resetValidation();
            })
            .catch((error) => {
              Swal.fire({
                icon: "error",
                title: "Erro ao excluir Aluguel",
                text: error.response.data.error,
                showConfirmButton: false,
                timer: 3000,
              });
            });
        }
      });
    },
    close() {
      this.dialog = false;
      this.zerar();
    },
    isLivroDisponivel(livro) {
      return livro.quantidade > 0;
    },

    save() {
      const selectedLivro = this.livros.find(
        (livro) => livro.nome === this.livro_id
      );
      const selectedUsuario = this.usuarios.find(
        (usuario) => usuario.nome === this.usuario_id
      );
      const newRental = {
        livro_id: selectedLivro,
        usuario_id: selectedUsuario,
        data_aluguel: this.data_aluguel,
        data_previsao: this.data_previsao,
        status: "Pendente",
      };

      Rental.save(newRental).then((response) => {
        this.alugueis.push({ id: response.data.id, ...newRental });
        Swal.fire({
          icon: "success",
          title: "Aluguel cadastrado com sucesso!",
          showConfirmButton: false,
          timer: 2000,
        });
        this.list();
        this.close();
        this.zerar();
        this.resetValidation();
      });
    },

    addAluguel() {
      this.checkFormValidity();
      if (this.formIsValid) {
        this.save();
      }
    },
    zerar() {
      this.livro_id = "";
      this.usuario_id = "";
      this.data_previsao = "";
      this.data_aluguel = new Date().toISOString().substr(0, 10);
    },
  },
};
</script>

<style scoped></style>
