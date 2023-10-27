<template>
    <nav>
        <v-app-bar color="grey lighten-4" dark app  class="custom-color">
                <v-app-bar-nav-icon @click.stop="drawer = !drawer" color="black"></v-app-bar-nav-icon>
                <v-toolbar-title class="text-uppercase">
                    <v-icon color="black" class="mx-2 mb-1">mdi-book-open-page-variant</v-icon> 
                    
                    <span class="font-weight-light">WDA</span>
                    <span >Livraria</span>   
                </v-toolbar-title>
                <v-spacer></v-spacer>
        </v-app-bar>
        <v-navigation-drawer v-model="drawer" dark app class="grey darken-4">
            <v-layout column align-center>
                <v-flex class="mt-5">
                    
                        <v-img src="/altis_logo.png" width="200" class="mt-4"></v-img>
                   
                </v-flex>
            </v-layout>
            <v-list flat>
                    <v-list-item v-for="link in links" :key="link.text" router :to="link.route" active-class="border">
                        <v-list-item-action>
                            <v-icon>{{link.icon}}</v-icon>
                        </v-list-item-action>
                        <v-list-item-content>
                            <v-list-item-title>{{link.text}}</v-list-item-title>
                        </v-list-item-content>
                    </v-list-item>
            </v-list>
        </v-navigation-drawer>
    </nav>
</template>
<script>
export default{
    data: () => ({
        drawer:true,
        links:[
            {icon: 'dashboard', text:'Dashboard',route:'/'},
            {icon: 'person', text:'Usuários',route:'/Usuarios'},
            {icon: 'book', text:'Livros',route:'/Livros'},
            {icon: 'domain', text:'Editoras',route:'/Editoras'},
            {icon: 'edit', text:'Alugueis',route:'/Alugueis'}
        ]
    })
}
</script>

<style scoped>
.border{
    border-left: 4px solid;
    color: white;
}


.border2.v-list-item--active .v-list-item__title,
.border2.v-list-item--active .v-list-item__icon {
     color: white !important;
}


.border2.v-list-item--active .v-icon {
    color: white !important;
}

.custom-color{
    color: black;
}


</style>