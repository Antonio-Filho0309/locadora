<template>
  <v-flex>
    <div class="flexbox">
      <div class="chart_container">
        <div class="title text-center">Livros mais alugados</div>
        <canvas ref="myChart" id="myChart" height="250"></canvas>
      </div>
    </div>
  </v-flex>
</template>

<script>
import Chart from "chart.js";
import Book from "../services/book";

export default {
  data: () => ({
   books: [],
  }),
  mounted() {
    this.list();
  },
  methods: {
   async list() {
    try {
      const mostBooks = await Book.listDash();

      this.books = mostBooks.data.data.slice(0,4).map((item) => ({
        label:item.name,
        data: item.rented,
      }));
       this.books.sort((a, b) => b.data - a.data);
       console.log(this.books)
      this.upCharts();
    }catch (error) {
      console.error("Erro ao buscar os livros  mais alugados:" , error);
    }
   },

    upCharts() {
      if(!this.books) return;
      const labels = this.books.map((item)=> item.label);
      const data = this.books.map((item)=> item.data);
      const ctx = this.$refs.myChart.getContext("2d");
      new Chart(ctx, {
        type: "bar",
        data: {
          labels: labels,
          datasets: [
            {
              label: "Quantidade Alugada",
              data: data,
              fill: false ,
              backgroundColor: [
                "rgb(255, 99, 132)",
                "rgb(54, 162, 235)",
                "rgb(255, 206, 86)",
                "rgb(75, 192, 192)",
                "rgb(153, 102, 255)",
              ],
              borderColor: [
                "rgba(255, 99, 132, 1)",
                "rgba(54, 162, 235, 1)",
                "rgba(255, 206, 86, 1)",
                "rgba(75, 192, 192, 1)",
                "rgba(153, 102, 255, 1)",
                "rgba(255, 159, 64, 1)",
              ],
              borderWidth: 0,
            },
          ],
        },
       options: {
          scales: {
            yAxes: [
              {
                ticks: {
                  display: false,
                },
                gridLines: {
                  display: false,
                },
              },
            ],
            xAxes: [
              {
                gridLines: {
                  display: false,
                },
              },
            ],
          },
          legend: {
            display: false,
          },
          },
      });
    },
  },
  watch: {
    alugueis: {
      handler() {
        this.upCharts();
      },
      deep: true,
    },
  },
};
</script>

<style scoped>
.chart_container {
  width: 100%;
  padding: 10px;
  height: 435px;
}

.flexbox {
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
