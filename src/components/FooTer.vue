<template>
    <v-footer dark padless app inset>
        <v-card class="flex" flat title color="grey lighten-4" :elevation="10">
            <v-card-text class="py-2 black--text text-center">
                {{new Date().getFullYear()}} - <strong>WDA Livraria</strong>
            </v-card-text>
        </v-card>
    </v-footer>
</template>