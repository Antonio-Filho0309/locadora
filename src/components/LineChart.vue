<template>
  <v-flex>
    <div class="flexbox">
      <div class="chart_container">
        <div class="title text-center">Livros mais alugados</div>
        <canvas ref="myChart" id="myChart"></canvas>
      </div>
    </div>
  </v-flex>
</template>

<script>
import Chart from "chart.js";
import Aluguel from "../services/rental";

export default {
  data: () => ({
    alugueis: [],
    maisalugados: [],
  }),
  mounted() {
    this.list();
  },
  methods: {
    list() {
      Aluguel.list()
        .then((response) => {
          this.alugueis = response.data;
          this.CalcMaisAlug();
        })
        .catch((error) => {
          console.error("Erro na busca de aluguéis", error);
        });
    },
    CalcMaisAlug() {
      const AlugsCount = {};
      this.alugueis.forEach((alug) => {
        const livronome = alug.livro_id.nome;
        if (AlugsCount[livronome]) {
          AlugsCount[livronome]++;
        } else {
          AlugsCount[livronome] = 1;
        }
      });
      this.maisalugados = Object.keys(AlugsCount)
        .sort((a, b) => AlugsCount[b] - AlugsCount[a])
        .map((livronome) => ({ livronome, quantidade: AlugsCount[livronome] }));
    },
    upCharts() {
      
      const ctx = this.$refs.myChart.getContext("2d");
      new Chart(ctx, {
        type: "bar",
        data: {
          labels: this.maisalugados.slice(0, 4).map((livro) => livro.livronome),
          datasets: [
            {
              label: "Quantidade Alugada",
              data: this.maisalugados
                .slice(0, 4)
                .map((livro) => livro.quantidade),
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
          legend: {
            display: false,
          },

          scales: {
            x: {
              ticks: {
                callback: function (value) {
                  // Dividir o rótulo em várias linhas usando "\n"
                  return value.split("\n");
                },
                autoSkip: false,
              },
            },
            y: {
              beginAtZero: true,
            },
          },
          maintainAspectRatio: false,
          aspectRatio: 1,
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
