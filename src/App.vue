<template>
  <v-app>
    <NavBar />
    <v-main class="ma-4">
      <router-view> 
        
      </router-view>
    </v-main>
    <FooTer />
  </v-app>
</template>

<script>
import FooTer from "@/components/FooTer";
import NavBar from "@/components/NavBar";
export default {
  name: "App",
  components: {
    NavBar,
    FooTer,
  },
};
</script>

<style></style>
