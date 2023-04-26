<template>
    <Carousel :autoplay="2000" :wrap-around="true">
        <Slide v-for="image in images" :key="image.id">
            {{ image.url }}
            <div class='carousel-img'>
                <img :src=image.url />
            </div>
        </Slide>

        <template #addons>
            <Pagination />
        </template>
    </Carousel>
</template>
  
<script>
import { defineComponent } from 'vue'
import { Carousel, Pagination, Slide } from 'vue3-carousel'

import 'vue3-carousel/dist/carousel.css'

export default defineComponent({
    name: 'AutoPlay',
    components: {
        Carousel,
        Slide,
        Pagination,
    },
    data() {
        return {
            images: [
                { id: 1, url: require('../assets/mur.png') },
                { id: 2, url: require('../assets/nuit.png') },
                { id: 3, url: require('../assets/difficu.png') },
                { id: 4, url: require('../assets/epaisseur.png') },
                { id: 5, url: require('../assets/mousta.png') },

            ]
        }
    },
    methods: {
        getImage(imagePath) {
            return imagePath;
        }
    }
})
</script>


<style>
.carousel- {
    border-radius: 50%;
    width: 200px;
    height: 200px;
    margin-bottom: 10px;
    object-fit: contain;
}
</style>
