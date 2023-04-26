<template>
    <Carousel v-bind="settings" :autoplay="4000" :wrap-around="true" :itemsToShow="1.5">
        <Slide v-for="image in images" :key="image.id">
            <div class="carousel__item">

                <img class="image" :src=image.url />
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
                { id: 1, url: require('../assets/traj.png') },
                { id: 2, url: require('../assets/epaiss.png') },
                { id: 3, url: require('../assets/colline.png') },
                { id: 4, url: require('../assets/mur.png') },
                { id: 5, url: require('../assets/nuit.png') },
                { id: 6, url: require('../assets/mouftard.png') },
                { id: 7, url: require('../assets/diffi.png') },
            ],
            settings: {
                itemsToShow: 1,
                snapAlign: 'center',
            },
        }
    }
})
</script>


<style>
.carousel-component {
    padding: 10px;
}

.carousel__item {
    min-height: 200px;
    width: 100%;
    min-width: 100%;
    background-color: var(--vc-clr-primary);
    color: var(--vc-clr-white);
    font-size: 20px;
    border-radius: 8px;
    display: flex;
    justify-content: center;
    align-items: center;
}

.carousel__slide {
    padding-left: 10px;
    width: 100%;
}

.carousel__prev,
.carousel__next {
    box-sizing: content-box;
    border: 5px solid white;
}

.image {
    width: 100%;
    min-width: 100%;
}
</style>
