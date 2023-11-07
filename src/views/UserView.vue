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
      :items="users"
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
      <template v-slot:top>
        <v-toolbar flat>
          <v-toolbar-title>
            <h2>Usuários</h2>
          </v-toolbar-title>
          <v-spacer></v-spacer>
          <v-dialog v-model="dialog" max-width="500px">
            <template v-slot:activator="{ on, attrs }">
              <v-btn color="primary" dark class="mb-2" v-bind="attrs" v-on="on">
                Adicionar Usuário
              </v-btn>
            </template>
            <v-form ref="userForm" @submit.prevent="save">
              <v-card>
                <v-card-title>
                  <span class="text-h5">{{ formTitle }}</span>
                </v-card-title>
                <v-card-text>
                  <v-container>
                    <v-text-field
                      label="Nome"
                      :rules="rules"
                      hide-details="auto"
                      required
                      v-model="user.name"
                      prepend-icon="mdi-account"
                    ></v-text-field>
                    <v-text-field
                      label="Cidade"
                      :rules="rules"
                      hide-details="auto"
                      required
                      v-model="user.city"
                      prepend-icon="mdi-city"
                    ></v-text-field>
                    <v-text-field
                      label="Email"
                      :rules="emailRules"
                      hide-details="auto"
                      required
                      v-model="user.email"
                      prepend-icon="mdi mdi-at"
                    ></v-text-field>
                    <v-text-field
                      label="Endereço"
                      :rules="rules"
                      hide-details="auto"
                      required
                      v-model="user.address"
                      prepend-icon="mdi-home-city"
                    ></v-text-field>
                  </v-container>
                </v-card-text>
                <v-card-actions>
                  <v-spacer></v-spacer>
                  <v-btn text color="error" @click="close"> Fechar </v-btn>
                  <v-btn text color="primary" @click="addUser"> Feito </v-btn>
                </v-card-actions>
              </v-card>
            </v-form>
          </v-dialog>
        </v-toolbar>
      </template>
      <template slot="item.actions" slot-scope="{ item }">
        <v-btn small text @click="editItem(item)">
          <v-icon class="primary--text">mdi-account-edit</v-icon>
        </v-btn>
        <v-btn small text @click="deleteItem(item)">
          <v-icon class="error--text">mdi-delete</v-icon>
        </v-btn>
      </template>
       <template v-slot:no-data>
        <span>Sem dados</span>
      </template>
    </v-data-table>
  </v-card>
</template>

<script>
import Swal from "sweetalert2";
import User from "../services/user";
export default {
  data() {
    return {
      search: "",
      pagination: {
        rowsPerPage: 5,
      },
      formIsValid: false,
      loadingTable: true,
      emailRules: [
        (value) => !!value || "Campo Obrigatório",
        (value) => /.+@.+\..+/.test(value) || "O email deve ser válido",
      ],
      rules: [
        (value) => !!value || "Campo Obrigatório",
        (value) => (value && value.length >= 3) || "Mínimo 3 caracteres",
      ],
      dialog: false,
      headers: [
        { text: "ID", value: "id" },
        { text: "Nome", value: "name" },
        { text: "Cidade", value: "city" },
        { text: "Email", value: "email" },
        { text: "Endereço", value: "address" },
        { text: "Ações", value: "actions", sortable: false },
      ],
      user: {
        id: 0,
        name: "",
        city: "",
        email: "",
        address: "",
      },
      users: [],
      total: 0,
      page: 1,
      pageSize: 5,
      orderByProperty: "id",
      desc: false,
      errors: [],
      editedIndex: -1,
    };
  },

  mounted() {
    this.list();
  },

  computed: {
    formTitle() {
      return this.editedIndex === -1 ? "Adicionar Usuário" : "Editar Usuário";
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
      this.formIsValid = this.$refs.userForm.validate();
    },

    handleOptionsUpdate(options) {
      const sortByMapping = {
        id: "Id",
        name: "Name",
        city: "City",
        email: "Email",
        address: "Address",
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
        const response = await User.list({
          Page: this.page,
          PageSize: this.pageSize,
          OrderByProperty: this.orderByProperty,
          Desc: this.desc,
          Search: this.search,
        });
        this.users = response.data.data;
        this.total = response.data.totalRegisters;
      } catch (error) {
        console.error("Erro ao Listar :", error);
        if (error.response.status == 404) {
          this.users = [];
          console.log(error.response.data.message);
        }
      } finally {
        this.loadingTable = false;
      }
    },

    editItem(item) {
      this.user.id = item.id;
      this.user.name = item.name;
      this.user.city = item.city;
      this.user.email = item.email;
      this.user.address = item.address;
      this.editedIndex = this.users.indexOf(item);
      this.dialog = true;
      this.checkFormValidity();
    },

    deleteItem(user) {
      Swal.fire({
        icon: "warning",
        title: "Deseja excluir o usuário?",
        text: "Essa ação não pode ser desfeita!",
        showCancelButton: true,
        confirmButtonText: "Sim",
        cancelButtonText: "Não",
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
      }).then((result) => {
        if (result.isConfirmed) {
          User.delete(user)
            .then((response) => {
              Swal.fire({
                icon: "success",
                title: response.data.message,
                showConfirmButton: false,
                timer: 2000,
              });
              this.list();
            })
            .catch((error) => {
              console.log(error.response.data.message);
              Swal.fire({
                icon: "error",
                title: "Erro ao deletar usuário",
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
      this.user.id = "";
      this.user.name = "";
      this.user.city = "";
      this.user.email = "";
      this.user.address = "";
      this.editedIndex = -1;
      this.$refs.userForm.reset();
    },

    save() {
      if (!this.user.id) {
        User.save(this.user)
          .then((response) => {
            Swal.fire({
              icon: "success",
              title: response.data.message,
              showConfirmButton: false,
              timer: 2000,
            });
            this.close();
            this.list();
            this.$refs.userForm.reset();
          })
          .catch((error) => {
            console.log(error.response.data.message);
            Swal.fire({
              icon: "error",
              title: "Erro ao cadastrar usuário",
              text: error.response.data.message,
              showConfirmButton: false,
              timer: 3000,
            });
          });
      } else {
        User.update(this.user)
          .then((response) => {
            this.user = {};
            Swal.fire({
              icon: "success",
              title: response.data.message,
              showConfirmButton: false,
              timer: 2000,
            });
            this.list();
            this.close();
            this.$refs.userForm.reset();
          })
          .catch((error) => {
            console.log(error.response.data.message);
            Swal.fire({
              icon: "error",
              title: "Erro ao atualizar usuário",
              text: error.response.data.message,
              showConfirmButton: false,
              timer: 3000,
            });
          });
      }
    },

    addUser() {
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