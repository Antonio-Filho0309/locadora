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
      :items="publishers"
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
          <v-toolbar-title><h2>Editoras</h2></v-toolbar-title>
          <v-spacer></v-spacer>
          <v-dialog v-model="dialog" max-width="500px">
            <template v-slot:activator="{ on, attrs }">
              <v-btn color="primary" dark class="mb-2" v-bind="attrs" v-on="on">
                Adicionar Editora
              </v-btn>
            </template>
            <v-form ref="publisherForm" @submit.prevent="save">
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
                      v-model="publisher.name"
                      prepend-icon="mdi-domain"
                    ></v-text-field>
                    <v-text-field
                      label="Cidade"
                      :rules="rules"
                      hide-details="auto"
                      required
                      v-model="publisher.city"
                      prepend-icon="mdi-city"
                    ></v-text-field>
                  </v-container>
                </v-card-text>
                <v-card-actions>
                  <v-spacer></v-spacer>
                  <v-btn text color="error" @click="close"> Fechar </v-btn>
                  <v-btn text color="primary" @click="addPublisher">
                    Feito
                  </v-btn>
                </v-card-actions>
              </v-card>
            </v-form>
          </v-dialog>
        </v-toolbar>
      </template>
      <template slot="item.actions" slot-scope="{ item }">
        <v-btn text small @click="editItem(item)">
          <v-icon class="primary--text">mdi-pencil</v-icon>
        </v-btn>
        <v-btn text small @click="deleteItem(item)">
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
import Publisher from "../services/publisher";

export default {
  data: () => ({
    search: "",
    formIsValid: false,
    loadingTable: true,
    dialog: false,

    rules: [
      (value) => !!value || "Campo Obrigatório",
      (value) => (value && value.length >= 3) || "Minimo 3 caracteres",
    ],
    headers: [
      { text: "ID", value: "id" },
      { text: "Nome", value: "name" },
      { text: "Cidade", value: "city" },
      { text: "Ações", value: "actions", sortable: false },
    ],

    publisher: {
      id: 0,
      name: "",
      city: "",
    },
    publishers: [],
    total: 0,
    page: 1,
    pageSize: 5,
    orderByProperty: "id",
    desc: false,
    errors: [],
    editedIndex: -1,
  }),

  mounted() {
    this.list();
  },

  computed: {
    formTitle() {
      return this.editedIndex === -1 ? "Adicionar Editora" : "Editar Editora";
    },
  },

  watch: {
    dialog(val) {
      val || this.close();
    },
    search: function () {
      this.list();
    },
  },

  methods: {
    checkFormValidity() {
      this.formIsValid = this.$refs.publisherForm.validate();
    },

    handleOptionsUpdate(options) {
      const sortByMapping = {
        id: "Id",
        name: "Name",
        city: "City",
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
        const response = await Publisher.list({
          Page: this.page,
          PageSize: this.pageSize,
          OrderByProperty: this.orderByProperty,
          Desc: this.desc,
          Search: this.search,
        });
        this.publishers = response.data.data;
        this.total = response.data.totalRegisters;
      } catch (error) {
        console.error("Erro ao Listar :", error);
        if (error.response.status == 404) {
          this.publishers = [];
          console.log(error.response.data.message);
        }
      } finally {
        this.loadingTable = false;
      }
    },

    editItem(item) {
      this.publisher.id = item.id;
      this.publisher.name = item.name;
      this.publisher.city = item.city;
      this.editedIndex = this.publishers.indexOf(item);
      this.dialog = true;
      this.checkFormValidity();
    },

    deleteItem(publisher) {
      Swal.fire({
        icon: "warning",
        title: "Deseja excluir a editora?",
        text: "Essa ação não pode ser Desfeita!",
        showCancelButton: true,
        confirmButtonText: "Sim",
        cancelButtonText: "Não",
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
      }).then((result) => {
        if (result.isConfirmed) {
          Publisher.delete(publisher)
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
                title: "Erro ao excluir editora",
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
      this.publisher.id = "";
      this.publisher.name = "";
      this.publisher.city = "";
      this.editedIndex = -1;
      this.$refs.publisherForm.reset();
    },

    save() {
      if (!this.publisher.id) {
        Publisher.save(this.publisher)
          .then((response) => {
            Swal.fire({
              icon: "success",
              title: response.data.message,
              showConfirmButton: false,
              timer: 2000,
            });
            this.close();
            this.list();
            this.$refs.publisherForm.reset();
          })
          .catch((error) => {
            Swal.fire({
              icon: "error",
              title: "Erro ao cadastrar editora",
              text: error.response.data.message,
              showConfirmButton: false,
              timer: 3000,
            });
          });
      } else {
        Publisher.update(this.publisher)
          .then((response) => {
            this.publisher = {};
            Swal.fire({
              icon: "success",
              title: response.data.message,
              showConfirmButton: false,
              timer: 2000,
            });
            this.list();
            this.close();
            this.$refs.publisherForm.reset();
          })

          .catch((error) => {
            console.log(error.response.data.message);
            Swal.fire({
              icon: "error",
              title: "Erro ao atualizar editora",
              text: error.response.data.message,
              showConfirmButton: false,
              timer: 3000,
            });
          });
      }
    },
    addPublisher() {
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
