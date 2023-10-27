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
      :items="filteredRentals"
      :search="search"
      class="elevation-1"
      :items-per-page="page"
      :footer-props="{
        itemsPerPageOptions: [5, 10, 25, this.alugueis.length],
        itemsPerPageText: 'Linhas por página',
      }"
    >
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
            <v-form ref="AluguelForm" @submit.prevent="save">
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
                      v-model="livro_id"
                      :items="livros"
                      item-text="nome"
                      prepend-icon="mdi-book"
                    ></v-select>
                    <v-select
                      label="Usuário"
                      :rules="rulesNumber"
                      hide-details="auto"
                      required
                      v-model="usuario_id"
                      :items="usuarios"
                      item-text="nome"
                      prepend-icon="mdi-account-circle"
                    ></v-select>
                    <v-row class="my-3">
                      <v-col cols="6">
                        <v-text-field
                          disabled
                          label="Data do Aluguel"
                          hide-details="auto"
                          v-model="data_aluguel"
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
                          v-model="data_previsao"
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
                  <v-btn text color="primary" @click="addAluguel">
                    Feito
                  </v-btn>
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
import Aluguel from "../services/aluguel";
export default {
  data() {
    return {
      search: "",
      pagination: {
        rowsPerPage: 5,
      },
      formIsValid: false,

      rulesNumber: [(value) => !!value || "Campo Obrigatório"],
      dialog: false,
      headers: [
        { text: "ID", value: "id" },
        { text: "Livro", value: "livro_id" },
        { text: "Usuário", value: "usuario_id" },
        { text: "Data do Aluguel", value: "data_aluguel" },
        { text: "Previsão de Devolução", value: "data_previsao" },
        { text: "Data de Devolução", value: "data_devolucao" },
        { text: "Status", value: "status", align: "center", sortable: false },
        { text: "Ações", value: "actions", sortable: false },
      ],

      alugueis: [],
      livros: [],
      usuarios: [],
      livro_id: "",
      usuario_id: "",
      data_aluguel: new Date().toISOString().substr(0, 10),
      data_previsao: "",
      data_devolucao: "",
      status: "",
      selectedAlugId: null,
      errors: [],
      editedIndex: -1,
    };
  },

  mounted() {
    this.list();
  },

  computed: {
    formTitle() {
      return this.editedIndex === -1 ? "Adicionar Aluguel" : "Editar Aluguel";
    },

    filteredRentals() {
      const searchValue = this.search.toLowerCase();
      return this.alugueis.filter((aluguel) => {
        for (const prop in aluguel) {
          const propValue = aluguel[prop].toString().toLowerCase();
          if (propValue.includes(searchValue)) {
            return true;
          }
        }
        return false;
      });
    },
  },

  watch: {
    dialog(val) {
      if (!val) this.close();
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
      } else if (item.status == "No Prazo") {
        return "green";
      } else {
        return "yellow";
      }
    },

    /*fomatar as datas para o padrão */
    formatDate(dateString) {
      const utcDate = new Date(dateString);
      const localDate = new Date(
        utcDate.getTime() + utcDate.getTimezoneOffset() * 60000
      );
      return localDate.toLocaleDateString("pt-BR");
    },

    parseDate(date) {
      if (!date) return null;

      const [day, month, year] = date.split("/");
      return `${year}-${month}-${day}`;
    },

    checkFormValidity() {
      this.formIsValid = this.$refs.AluguelForm.validate();
    },

    // Listar
    async list() {
      try {
        const [booksResponse, rentalsResponse, usersResponse] =
          await Promise.all([Book.list(), Aluguel.list(), User.list()]);

        this.livros = booksResponse.data.map((livro) => ({
          id: livro.id,
          nome: livro.nome,
        }));

        this.usuarios = usersResponse.data.map((usuario) => ({
          id: usuario.id,
          nome: usuario.nome,
        }));

        this.alugueis = rentalsResponse.data.map((aluguel) => {
          const devolucaoDate = aluguel.data_devolucao;
          const previsaoDate = aluguel.data_previsao;
          let statusInfo;
          if (devolucaoDate !== null) {
            if (devolucaoDate > previsaoDate) {
              statusInfo = "Atrasado";
            } else {
              statusInfo = "No Prazo";
            }
          } else {
            statusInfo = "Pendente";
          }
          return {
            id: aluguel.id,
            livro_id: aluguel.livro_id.nome,
            usuario_id: aluguel.usuario_id.nome,
            data_aluguel: this.formatDate(aluguel.data_aluguel),
            data_previsao: this.formatDate(aluguel.data_previsao),
            data_devolucao: aluguel.data_devolucao
              ? this.formatDate(aluguel.data_devolucao)
              : "Não devolvido",
            status: statusInfo,
          };
        });
        // Pendentes primeiro
        this.alugueis.sort((a, b) => {
          if (a.status === "Pendente" && b.status !== "Pendente") {
            return -1;
          } else if (a.status !== "Pendente" && b.status === "Pendente") {
            return 1;
          } else {
            return 0;
          }
        });
      } catch (error) {
        console.error("Erro ao buscar informações:", error);
      }
    },

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
      Aluguel.update(RentalDevo).then(() => {
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

          Aluguel.delete(deleteAlug)
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

      Aluguel.save(newRental).then((response) => {
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
