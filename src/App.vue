<template>
  <v-app>
    <NavBar />
    <v-content class="ma-4">
      <router-view> 
        
      </router-view>
    </v-content>
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
