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
    data() {
        return {
            items: [
                {
                    label: 'About',
                    icon: 'pi pi-fw pi-info',
                },
                {
                    label: 'Dieppe',
                    icon: 'pi pi-fw pi-map-marker',
                    items: [
                        {
                            label: 'Oxfam Official Website',
                            icon: 'pi pi-fw pi-link'
                        },
                        {
                            label: 'Database',
                            icon: 'pi pi-fw pi-database'
                        }
                    ]
                },
                {
                    label: 'Team',
                    icon: 'pi pi-fw pi-user'
                },
                {
                    label: 'Github',
                    icon: 'pi pi-fw pi-github'
                }
            ]
        };
    }
};
</script>