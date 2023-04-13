<template>
    <div class="card relative z-2">
        <Menubar :model="items">
            <template #start>
                <img alt="logo" src="../assets/trailove.png" height="40" class="mr-2" />
            </template>
            <template #end>
                <InputText placeholder="Search" type="text" />
            </template>
        </Menubar>
    </div>
</template>

<script>

import Menubar from 'primevue/menubar';

export default {
    components: {
        Menubar
    },
    props: {
        pageName: String,
        pageURL: String
    },
    data() {
        return {
            items: [
                {
                    label: this.pageName,
                    icon: 'pi pi-fw pi-info',
                    url: this.pageURL
                },
                {
                    label: 'Dieppe',
                    icon: 'pi pi-fw pi-map-marker',
                    items: [
                        {
                            label: 'Site officielOxfam',
                            icon: 'pi pi-fw pi-link',
                            url: 'https://www.oxfamtrailwalker.fr/dieppe/accueil-dieppe/'
                        },
                        {
                            label: 'Base de données',
                            icon: 'pi pi-fw pi-database',
                            url: 'http://localhost:5500/inter/3643'
                        }
                    ]
                },
                {
                    label: 'Team',
                    icon: 'pi pi-fw pi-user'
                },
                {
                    label: 'Github',
                    icon: 'pi pi-fw pi-github',
                    url: 'https://github.com/zumbalove974/oxfam-trailwalker'
                }
            ]
        };
    }
};
</script>