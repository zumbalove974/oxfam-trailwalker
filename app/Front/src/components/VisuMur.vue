<template>
    <input @click="display" type="radio" v-model="selectedCategory" :inputId="category.key" name="visualisation"
        :value="category.name" />
    <label :for="category.key" class="ml-2" style="margin-left: 1rem;">{{ category.name }}</label>
</template>

<script>

// la fonction toRaw permet d'extraire le contenu d'un Proxy
import { toRaw } from 'vue';
// fonction permettant d'accéder aux données de la bdd
import { getLiveDataDevice } from "../client/bddConnexion";
import { asc, calculerPremierQuartile, calculerMedian, calculerTroisiemeQuartile, tronquer } from "../client/mathUtils.js";

import * as THREE from "three";

// les toasts sont des onglets comportant un texte qui s'affiche durant un temps limité
import Toast from 'primevue/toast';
import { useToast } from "primevue/usetoast";


export default {
    components: {
    },
    props: {
        controllerProps: Promise,
        devicesProps: Array,
        visu_functionProps: Function,
        dimensionProps: Number,
        categoryProps: Object,
        visu_meshesProps: Array,
        toastProps: Toast,
        createDimensionEnvironmentProps: Function
    },
    emits: {
        data: Array,
    },
    data() {
        return {
            devices: this.devicesProps,
            visu_function: this.visu_functionProps,
            dimension: this.dimensionProps,
            controller: this.controllerProps,
            visu_meshes: this.visu_meshesProps,
            createDimensionEnvironment: this.createDimensionEnvironmentProps,
            selectedCategory: 'Production',
            category: this.categoryProps,
            toast: this.toastProps,
            functions: {
                '1': this.displayVisuSimple,
                '2': this.displayVisuEpaisseur,
                '3': this.displayVisuMontagne,
                '4': this.displayVisuMur,
                '5': this.displayVisuNuit,
                '6': this.displayVisuMoustache
            },
            isLegend: false // définit si la légende doit être affichée pour la visualisation en cours
        }
    },
    mounted() {
        this.toast = useToast();
    },
    methods: {
        // fonction appelée lorsque l'utilisateur clique sur une checkbox
        display() {
            toRaw(this.functions[toRaw(this.category).key])();
            this.visu_function = this.functions[toRaw(this.category).key];
            // on envoit à la vue parente la focntion concernée et la nouvelle liste des vicualisations présentes dans la scène
            this.$emit("data", [this.visu_meshes, this.visu_function]);
        },
        createPoints(data, z) {
            const points = [];

            for (let i = 0; i < data.length; i++) {
                points.push(this.controller.threeViewer.getWorldCoords([data[i].x, data[i].y])[0]);
                points.push(this.controller.threeViewer.getWorldCoords([data[i].x, data[i].y])[1]);
                points.push(z);
            }

            return points;
        },
        createColors(speeds) {
            const colors = [];

            for (let i = 0; i < speeds.length; i++) {
                colors.push(speeds[i]);
                colors.push(1.0 - speeds[i]);
                colors.push(0.2);
            }

            return colors;
        },
        createLineColor(points, colors) {
            const geometry = new THREE.BufferGeometry();

            geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(points), 3));
            geometry.setAttribute('color', new THREE.BufferAttribute(new Float32Array(colors), 3));

            // create material
            const material = new THREE.MeshBasicMaterial({
                vertexColors: true,
            });

            return new THREE.Line(geometry, material);
        },
        addOneVertice(vertices, x, y, z) {
            vertices.push(this.controller.threeViewer.getWorldCoords([x, y])[0]);
            vertices.push(this.controller.threeViewer.getWorldCoords([x, y])[1]);
            vertices.push(z);

            return vertices;
        },
        // Visualisation qui fait varier la couleur et la hauteur (en z) en fonction de la vitesse
        async addItineraireSpeed3D(deviceNumbers) {

            this.devices = deviceNumbers;
            const device = this.devices[0];
            this.visu_function = this.addItineraireSpeed3D;

            const data = await getLiveDataDevice(device);

            let speeds = [];

            for (let i = 0; i < data.length; i++) {
                speeds.push(data[i].speed);
            }

            let min = Math.min(...speeds);
            let max = Math.max(...speeds);

            // Normalisation des vitesses pour les utiliser dans les couleurs 
            for (let i = 0; i < speeds.length; i++) {
                speeds[i] = (speeds[i] - min) / (max - min);
            }

            // Si l'utilisateur passe en 2D, on affiche la trajectoire sous forme de ligne dont la couleur varie avec la vitesse
            if (this.dimension == 2) {
                const points = this.createPoints(data, 0);
                const colors = this.createColors(speeds);

                let line3d = this.createLineColor(points, colors);
                line3d.computeLineDistances();

                //this.controller.threeViewer.scene.remove(line);

                this.visu_meshes.push(line3d);

                // add line to scene so it can be rendered
                this.controller.threeViewer.scene.add(line3d);
            } else {

                let geometry = new THREE.BufferGeometry();
                let vertices = [];
                let colors = [];
                const maxZ = 50;

                let x0;
                let y0;
                let z0;
                let x1;
                let y1;
                let z1;

                // on défini les coordonnées des vertices
                // les coordonnées planimétriques sont les mêmes que ceux des points de la trajectoire et la coordonnée z varie en fonction de la vitesse normalisée
                for (let i = 0; i < (data.length - 1); i++) {

                    x0 = data[i].x;
                    y0 = data[i].y;
                    z0 = data[i].speed / max * maxZ;
                    x1 = data[i + 1].x;
                    y1 = data[i + 1].y;
                    z1 = data[i + 1].speed / max * maxZ;

                    //Face 1
                    vertices = this.addOneVertice(x0, y0, z0);
                    vertices = this.addOneVertice(x0, y0, 0);
                    vertices = this.addOneVertice(x1, y1, 0);
                    vertices = this.addOneVertice(x1, y1, 0);
                    vertices = this.addOneVertice(x1, y1, z1);
                    vertices = this.addOneVertice(x0, y0, z0);

                    // Face 2
                    vertices = this.addOneVertice(x0, y0, z0);
                    vertices = this.addOneVertice(x1, y1, 0);
                    vertices = this.addOneVertice(x0, y0, 0);
                    vertices = this.addOneVertice(x1, y1, 0);
                    vertices = this.addOneVertice(x0, y0, z0);
                    vertices = this.addOneVertice(x1, y1, z1);
                }

                // on définit les couleurs de chaque vertice
                // plus le coureur va vite plus la couleur est verte et plus il va lentement plus elle est rouge
                for (let i = 0; i < (data.length - 1); i++) {
                    // Face 1
                    colors.push(1 - speeds[i]);
                    colors.push(speeds[i]);
                    colors.push(0.2);

                    colors.push(1.0);
                    colors.push(0.2);
                    colors.push(0.2);

                    colors.push(1.0);
                    colors.push(0.2);
                    colors.push(0.2);

                    colors.push(1.0);
                    colors.push(0.2);
                    colors.push(0.2);

                    colors.push(1 - speeds[i + 1]);
                    colors.push(speeds[i + 1]);
                    colors.push(0.2);

                    colors.push(1 - speeds[i]);
                    colors.push(speeds[i]);
                    colors.push(0.2);

                    //Face 2
                    colors.push(1 - speeds[i]);
                    colors.push(speeds[i]);
                    colors.push(0.2);

                    colors.push(1.0);
                    colors.push(0.2);
                    colors.push(0.2);

                    colors.push(1.0);
                    colors.push(0.2);
                    colors.push(0.2);

                    colors.push(1.0);
                    colors.push(0.2);
                    colors.push(0.2);

                    colors.push(1 - speeds[i]);
                    colors.push(speeds[i]);
                    colors.push(0.2);

                    colors.push(1 - speeds[i + 1]);
                    colors.push(speeds[i + 1]);
                    colors.push(0.2);
                }

                // itemSize = 3 because there are 3 values (components) per vertex
                geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(vertices), 3));
                geometry.setAttribute('color', new THREE.BufferAttribute(new Float32Array(colors), 3));

                // create material
                const material = new THREE.MeshBasicMaterial({
                    vertexColors: true,
                    // on applique la transparence afin de pouvoir voir la carte au travers de la visualisation
                    transparent: true,
                    opacity: 0.8
                });

                let mesh = new THREE.Mesh(geometry, material);

                this.visu_meshes.push(mesh);

                this.controller.threeViewer.scene.add(mesh);
            }

            // on retourne ces valeurs car on en a besoin pour la légende
            return [min, max];
        },
        displayVisuMontagne() {
            this.toast.removeAllGroups();
            this.visuFunction = this.displayVisuMontagne;

            if (this.devices.length > 1)
                this.toast.add({ severity: 'warn', summary: 'Warn', detail: "Vous devez choisir une seule devices pour afficher cette visualisation.", life: 3000 });
            else
                this.toast.add({ severity: 'info', summary: 'Info', detail: "Cette visualisation en 2D+1 permet de visualiser les vitesses des coureurs sur l'axe verticale ainsi que grâce au code couleur. Si vous ajoutez plusieurs équipes, leur vitesse est définit uniquement par le code couleur et l'axe verticale permet de comparer vitesses des différentes équipe sur chaque portion du terrain.", life: 10000 });

            this.addItineraireSpeed3D(this.devices, this.dimension).then(res => {
                this.minLegend = tronquer(res[0], 2);
                this.maxLegend = tronquer(res[1], 2);
            });


            this.dimension = 3;
            this.createDimensionEnvironment(3);

            this.isLegend = true;
        },
        addItineraire(deviceNumbers) {

            this.devices = deviceNumbers;
            //device = devices[0]; //////temporaire
            this.devices.forEach(async device => {
                this.visu_function = this.addItineraire;

                const coords = await getLiveDataDevice(device);

                const material = new THREE.LineBasicMaterial({
                    color: 0xff0000
                });

                const points = [];

                for (let i = 0; i < coords.length; i++) {
                    points.push(new THREE.Vector3(
                        this.controller.threeViewer.getWorldCoords([coords[i].x_GPS, coords[i].y_GPS])[0],
                        this.controller.threeViewer.getWorldCoords([coords[i].x_GPS, coords[i].y_GPS])[1],
                        0)
                    );
                }

                const geometry = new THREE.BufferGeometry().setFromPoints(points);

                let visu_mesh = new THREE.Line(geometry, material);
                this.visu_meshes.push(visu_mesh);

                this.controller.threeViewer.scene.add(visu_mesh);
            });
        },
        async addItineraireEpaisseur(deviceNumbers) {

            this.devices = deviceNumbers;
            const device = this.devices[0];

            const trace = await getLiveDataDevice(device);

            const maxSpeed = Math.max(...trace.map(t => t.speed));

            let shape = [];
            let color = [];

            for (let i = 0; i < trace.length - 2; i++) {
                let xA = this.controller.threeViewer.getWorldCoords([trace[i].x, trace[i].y])[0];
                let yA = this.controller.threeViewer.getWorldCoords([trace[i].x, trace[i].y])[1];
                let xB = this.controller.threeViewer.getWorldCoords([trace[i + 1].x, trace[i + 1].y])[0];
                let yB = this.controller.threeViewer.getWorldCoords([trace[i + 1].x, trace[i + 1].y])[1];
                let xC = this.controller.threeViewer.getWorldCoords([trace[i + 2].x, trace[i + 2].y])[0];
                let yC = this.controller.threeViewer.getWorldCoords([trace[i + 2].x, trace[i + 2].y])[1];
                let dA = (trace[i].speed ** 2) * 1.5;
                let dB = (trace[i + 1].speed ** 2) * 1.5;
                let normAB = Math.sqrt(Math.pow(xB - xA, 2) + Math.pow(yB - yA, 2))
                let normBC = Math.sqrt(Math.pow(xB - xC, 2) + Math.pow(yB - yC, 2));

                if (normAB === 0) { continue }

                if (dB != 0) {
                    shape.push(
                        xA + dA * Math.cos((xB - xA) / normAB) * Math.sin((yB - yA) / normAB),
                        yA - dA * Math.sin((xB - xA) / normAB) * Math.cos((yB - yA) / normAB), 0)
                    shape.push(
                        xB + dB * Math.cos((xB - xA) / normAB) * Math.sin((yB - yA) / normAB),
                        yB - dB * Math.sin((xB - xA) / normAB) * Math.cos((yB - yA) / normAB), 0)
                    shape.push(
                        xB - dB * Math.cos((xB - xA) / normAB) * Math.sin((yB - yA) / normAB),
                        yB + dB * Math.sin((xB - xA) / normAB) * Math.cos((yB - yA) / normAB), 0)
                    color.push(
                        1 - trace[i].speed / maxSpeed, trace[i].speed / maxSpeed, 0.2)
                    color.push(
                        1 - trace[i + 1].speed / maxSpeed, trace[i + 1].speed / maxSpeed, 0.2)
                    color.push(
                        1 - trace[i + 1].speed / maxSpeed, trace[i + 1].speed / maxSpeed, 0.2)
                }

                if (dA != 0) {
                    shape.push(
                        xA + dA * Math.cos((xB - xA) / normAB) * Math.sin((yB - yA) / normAB),
                        yA - dA * Math.sin((xB - xA) / normAB) * Math.cos((yB - yA) / normAB), 0)
                    shape.push(
                        xB - dB * Math.cos((xB - xA) / normAB) * Math.sin((yB - yA) / normAB),
                        yB + dB * Math.sin((xB - xA) / normAB) * Math.cos((yB - yA) / normAB), 0)
                    shape.push(
                        xA - dA * Math.cos((xB - xA) / normAB) * Math.sin((yB - yA) / normAB),
                        yA + dA * Math.sin((xB - xA) / normAB) * Math.cos((yB - yA) / normAB), 0)
                    color.push(
                        1 - trace[i].speed / maxSpeed, trace[i].speed / maxSpeed, 0.2)
                    color.push(
                        1 - trace[i + 1].speed / maxSpeed, trace[i + 1].speed / maxSpeed, 0.2)
                    color.push(
                        1 - trace[i].speed / maxSpeed, trace[i].speed / maxSpeed, 0.2)
                }

                if (normAB != 0 && normBC != 0 && dB != 0) {
                    shape.push(xB, yB, 0);
                    shape.push(
                        xB - dB * Math.cos((xC - xB) / normBC) * Math.sin((yC - yB) / normBC),
                        yB + dB * Math.sin((xC - xB) / normBC) * Math.cos((yC - yB) / normBC), 0)
                    shape.push(
                        xB - dB * Math.cos((xB - xA) / normAB) * Math.sin((yB - yA) / normAB),
                        yB + dB * Math.sin((xB - xA) / normAB) * Math.cos((yB - yA) / normAB), 0)
                    color.push(
                        1 - trace[i + 1].speed / maxSpeed, trace[i + 1].speed / maxSpeed, 0.2)
                    color.push(
                        1 - trace[i + 1].speed / maxSpeed, trace[i + 1].speed / maxSpeed, 0.2)
                    color.push(
                        1 - trace[i + 1].speed / maxSpeed, trace[i + 1].speed / maxSpeed, 0.2)

                    shape.push(xB, yB, 0);
                    shape.push(
                        xB + dB * Math.cos((xB - xA) / normAB) * Math.sin((yB - yA) / normAB),
                        yB - dB * Math.sin((xB - xA) / normAB) * Math.cos((yB - yA) / normAB), 0)
                    shape.push(
                        xB + dB * Math.cos((xC - xB) / normBC) * Math.sin((yC - yB) / normBC),
                        yB - dB * Math.sin((xC - xB) / normBC) * Math.cos((yC - yB) / normBC), 0)
                    color.push(
                        1 - trace[i + 1].speed / maxSpeed, trace[i + 1].speed / maxSpeed, 0.2)
                    color.push(
                        1 - trace[i + 1].speed / maxSpeed, trace[i + 1].speed / maxSpeed, 0.2)
                    color.push(
                        1 - trace[i + 1].speed / maxSpeed, trace[i + 1].speed / maxSpeed, 0.2)
                }

            }
            const material = new THREE.MeshBasicMaterial({
                vertexColors: true,
            });
            const geometry = new THREE.BufferGeometry();
            geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(shape), 3));
            geometry.setAttribute('color', new THREE.BufferAttribute(new Float32Array(color), 3));

            let visu_mesh = new THREE.Mesh(geometry, material);
            this.visu_meshes.push(visu_mesh)
            this.controller.threeViewer.scene.add(visu_mesh);

            this.visu_function = this.addItineraireEpaisseur;
        },
        // calcul les vitesse moyennesde tous les trajets sélectionnés
        async getMoyenneDevice(devices) {
            let moyennes = [];
            let moyennesDict = {};

            for (let i = 0; i < devices.length; i++) {
                let moyenne = await this.getVitesseMoyenne(devices[i]);

                moyennes.push(moyenne);
                moyennesDict[moyenne] = devices[i];
            }

            return [moyennes, moyennesDict];
        },
        // supprime un mesh threesjs présents dans la scène
        disposeThreeMesh(mesh) {
            mesh.geometry.dispose();
            mesh.material.dispose();
            this.controller.threeViewer.scene.remove(mesh);
        },
        // calcul la vitesse moyenne d'une trajectoire
        async getVitesseMoyenne(device) {
            const data = await getLiveDataDevice(device);

            let somme = 0;

            data.forEach(point => {
                somme += point.speed;
            })

            return somme / data.length;
        },
        async addItineraireMoustache(deviceNumbers) {

            this.visu_function = this.addItineraireMoustache;

            this.devices = deviceNumbers;

            let devicesData = [];

            for (let i = 0; i < this.devices.length; i++) {
                const data = await getLiveDataDevice(this.devices[i]);

                devicesData.push(data);
            }

            const longueursData = devicesData[0].length;

            //this.controller.threeViewer.scene.remove(line);

            /* On dessine le mur */
            let geometry1 = new THREE.BufferGeometry();
            let geometry2 = new THREE.BufferGeometry();
            let geometry3 = new THREE.BufferGeometry();
            let geometry4 = new THREE.BufferGeometry();

            let geometryLine1 = new THREE.BufferGeometry();
            let geometryLine2 = new THREE.BufferGeometry();
            let geometryLine3 = new THREE.BufferGeometry();
            let geometryLine4 = new THREE.BufferGeometry();

            let vertices1 = [];
            let vertices2 = [];
            let vertices3 = [];
            let vertices4 = [];

            let colors1 = [];
            let colors2 = [];
            let colors3 = [];
            let colors4 = [];

            let line1 = [];
            let line2 = [];
            let line3 = [];
            let line4 = [];

            for (let i = 0; i < (longueursData - 1); i++) {
                let liste = [];
                let listeplus1 = [];

                devicesData.forEach(data => {
                    liste.push(data[i].speed);
                    listeplus1.push(data[i + 1].speed);
                });

                const min = Math.min(...liste);
                const q1 = calculerPremierQuartile(liste);
                const q2 = calculerMedian(liste);
                const q3 = calculerTroisiemeQuartile(liste);
                const max = Math.max(...liste);

                const minplus1 = Math.min(...listeplus1);
                const q1plus1 = calculerPremierQuartile(listeplus1);
                const q2plus1 = calculerMedian(listeplus1);
                const q3plus1 = calculerTroisiemeQuartile(listeplus1);
                const maxplus1 = Math.max(...listeplus1);

                let wallZtop = max + q3 + q2 + q1 + min;
                let wallZbottom = q3 + q2 + q1 + min;
                let wallZtoplus1 = maxplus1 + q3plus1 + q2plus1 + q1plus1 + minplus1;
                let wallZbottomplus1 = q3plus1 + q2plus1 + q1plus1 + minplus1;

                let data = devicesData[0];
                //Face 1
                vertices1.push(this.controller.threeViewer.getWorldCoords([data[i].x, data[i].y])[0]);
                vertices1.push(this.controller.threeViewer.getWorldCoords([data[i].x, data[i].y])[1]);
                vertices1.push(wallZtop);

                vertices1.push(this.controller.threeViewer.getWorldCoords([data[i].x, data[i].y])[0]);
                vertices1.push(this.controller.threeViewer.getWorldCoords([data[i].x, data[i].y])[1]);
                vertices1.push(wallZbottom);

                vertices1.push(this.controller.threeViewer.getWorldCoords([data[i + 1].x, data[i + 1].y])[0]);
                vertices1.push(this.controller.threeViewer.getWorldCoords([data[i + 1].x, data[i + 1].y])[1]);
                vertices1.push(wallZbottomplus1);

                vertices1.push(this.controller.threeViewer.getWorldCoords([data[i + 1].x, data[i + 1].y])[0]);
                vertices1.push(this.controller.threeViewer.getWorldCoords([data[i + 1].x, data[i + 1].y])[1]);
                vertices1.push(wallZbottomplus1);

                vertices1.push(this.controller.threeViewer.getWorldCoords([data[i + 1].x, data[i + 1].y])[0]);
                vertices1.push(this.controller.threeViewer.getWorldCoords([data[i + 1].x, data[i + 1].y])[1]);
                vertices1.push(wallZtoplus1);

                vertices1.push(this.controller.threeViewer.getWorldCoords([data[i].x, data[i].y])[0]);
                vertices1.push(this.controller.threeViewer.getWorldCoords([data[i].x, data[i].y])[1]);
                vertices1.push(wallZtop);

                // Face 2
                vertices1.push(this.controller.threeViewer.getWorldCoords([data[i].x, data[i].y])[0]);
                vertices1.push(this.controller.threeViewer.getWorldCoords([data[i].x, data[i].y])[1]);
                vertices1.push(wallZtop);

                vertices1.push(this.controller.threeViewer.getWorldCoords([data[i + 1].x, data[i + 1].y])[0]);
                vertices1.push(this.controller.threeViewer.getWorldCoords([data[i + 1].x, data[i + 1].y])[1]);
                vertices1.push(wallZbottomplus1);

                vertices1.push(this.controller.threeViewer.getWorldCoords([data[i].x, data[i].y])[0]);
                vertices1.push(this.controller.threeViewer.getWorldCoords([data[i].x, data[i].y])[1]);
                vertices1.push(wallZbottom);

                vertices1.push(this.controller.threeViewer.getWorldCoords([data[i + 1].x, data[i + 1].y])[0]);
                vertices1.push(this.controller.threeViewer.getWorldCoords([data[i + 1].x, data[i + 1].y])[1]);
                vertices1.push(wallZbottomplus1);

                vertices1.push(this.controller.threeViewer.getWorldCoords([data[i].x, data[i].y])[0]);
                vertices1.push(this.controller.threeViewer.getWorldCoords([data[i].x, data[i].y])[1]);
                vertices1.push(wallZtop);

                vertices1.push(this.controller.threeViewer.getWorldCoords([data[i + 1].x, data[i + 1].y])[0]);
                vertices1.push(this.controller.threeViewer.getWorldCoords([data[i + 1].x, data[i + 1].y])[1]);
                vertices1.push(wallZtoplus1);

                // Ligne du troisième quartile
                line1.push(new THREE.Vector3(
                    this.controller.threeViewer.getWorldCoords([data[i].x, data[i].y])[0],
                    this.controller.threeViewer.getWorldCoords([data[i].x, data[i].y])[1],
                    wallZbottom)
                );
            }
            for (let i = 0; i < (longueursData - 1); i++) {
                let liste = [];
                let listeplus1 = [];

                devicesData.forEach(data => {
                    liste.push(data[i].speed);
                    listeplus1.push(data[i + 1].speed);
                });

                const min = Math.min(...liste);
                const q1 = calculerPremierQuartile(liste);
                const q2 = calculerMedian(liste);
                const q3 = calculerTroisiemeQuartile(liste);

                const minplus1 = Math.min(...listeplus1);
                const q1plus1 = calculerPremierQuartile(listeplus1);
                const q2plus1 = calculerMedian(listeplus1);
                const q3plus1 = calculerTroisiemeQuartile(listeplus1);

                let wallZtop = q3 + q2 + q1 + min;
                let wallZbottom = q2 + q1 + min;
                let wallZtoplus1 = q3plus1 + q2plus1 + q1plus1 + minplus1;
                let wallZbottomplus1 = q2plus1 + q1plus1 + minplus1;

                let data = devicesData[0];

                // Face 1
                vertices2.push(this.controller.threeViewer.getWorldCoords([data[i].x, data[i].y])[0]);
                vertices2.push(this.controller.threeViewer.getWorldCoords([data[i].x, data[i].y])[1]);
                vertices2.push(wallZtop);

                vertices2.push(this.controller.threeViewer.getWorldCoords([data[i].x, data[i].y])[0]);
                vertices2.push(this.controller.threeViewer.getWorldCoords([data[i].x, data[i].y])[1]);
                vertices2.push(wallZbottom);

                vertices2.push(this.controller.threeViewer.getWorldCoords([data[i + 1].x, data[i + 1].y])[0]);
                vertices2.push(this.controller.threeViewer.getWorldCoords([data[i + 1].x, data[i + 1].y])[1]);
                vertices2.push(wallZbottomplus1);

                vertices2.push(this.controller.threeViewer.getWorldCoords([data[i + 1].x, data[i + 1].y])[0]);
                vertices2.push(this.controller.threeViewer.getWorldCoords([data[i + 1].x, data[i + 1].y])[1]);
                vertices2.push(wallZbottomplus1);

                vertices2.push(this.controller.threeViewer.getWorldCoords([data[i + 1].x, data[i + 1].y])[0]);
                vertices2.push(this.controller.threeViewer.getWorldCoords([data[i + 1].x, data[i + 1].y])[1]);
                vertices2.push(wallZtoplus1);

                vertices2.push(this.controller.threeViewer.getWorldCoords([data[i].x, data[i].y])[0]);
                vertices2.push(this.controller.threeViewer.getWorldCoords([data[i].x, data[i].y])[1]);
                vertices2.push(wallZtop);

                // Face 2
                vertices2.push(this.controller.threeViewer.getWorldCoords([data[i].x, data[i].y])[0]);
                vertices2.push(this.controller.threeViewer.getWorldCoords([data[i].x, data[i].y])[1]);
                vertices2.push(wallZtop);

                vertices2.push(this.controller.threeViewer.getWorldCoords([data[i + 1].x, data[i + 1].y])[0]);
                vertices2.push(this.controller.threeViewer.getWorldCoords([data[i + 1].x, data[i + 1].y])[1]);
                vertices2.push(wallZbottomplus1);

                vertices2.push(this.controller.threeViewer.getWorldCoords([data[i].x, data[i].y])[0]);
                vertices2.push(this.controller.threeViewer.getWorldCoords([data[i].x, data[i].y])[1]);
                vertices2.push(wallZbottom);

                vertices2.push(this.controller.threeViewer.getWorldCoords([data[i + 1].x, data[i + 1].y])[0]);
                vertices2.push(this.controller.threeViewer.getWorldCoords([data[i + 1].x, data[i + 1].y])[1]);
                vertices2.push(wallZbottomplus1);

                vertices2.push(this.controller.threeViewer.getWorldCoords([data[i].x, data[i].y])[0]);
                vertices2.push(this.controller.threeViewer.getWorldCoords([data[i].x, data[i].y])[1]);
                vertices2.push(wallZtop);

                vertices2.push(this.controller.threeViewer.getWorldCoords([data[i + 1].x, data[i + 1].y])[0]);
                vertices2.push(this.controller.threeViewer.getWorldCoords([data[i + 1].x, data[i + 1].y])[1]);
                vertices2.push(wallZtoplus1);

                // Ligne de la médiane
                line2.push(new THREE.Vector3(
                    this.controller.threeViewer.getWorldCoords([data[i].x, data[i].y])[0],
                    this.controller.threeViewer.getWorldCoords([data[i].x, data[i].y])[1],
                    wallZbottom)
                );
            }
            for (let i = 0; i < (longueursData - 1); i++) {
                let liste = [];
                let listeplus1 = [];

                devicesData.forEach(data => {
                    liste.push(data[i].speed);
                    listeplus1.push(data[i + 1].speed);
                });

                const min = Math.min(...liste);
                const q1 = calculerPremierQuartile(liste);
                const q2 = calculerMedian(liste);
                //const q3 = calculerTroisiemeQuartile(liste);

                const minplus1 = Math.min(...listeplus1);
                const q1plus1 = calculerPremierQuartile(listeplus1);
                const q2plus1 = calculerMedian(listeplus1);
                //const q3plus1 = calculerTroisiemeQuartile(listeplus1);

                let wallZtop = q2 + q1 + min;
                let wallZbottom = q1 + min;
                let wallZtoplus1 = q2plus1 + q1plus1 + minplus1;
                let wallZbottomplus1 = q1plus1 + minplus1;

                let data = devicesData[0];

                //Face 1
                vertices3.push(this.controller.threeViewer.getWorldCoords([data[i].x, data[i].y])[0]);
                vertices3.push(this.controller.threeViewer.getWorldCoords([data[i].x, data[i].y])[1]);
                vertices3.push(wallZtop);

                vertices3.push(this.controller.threeViewer.getWorldCoords([data[i].x, data[i].y])[0]);
                vertices3.push(this.controller.threeViewer.getWorldCoords([data[i].x, data[i].y])[1]);
                vertices3.push(wallZbottom);

                vertices3.push(this.controller.threeViewer.getWorldCoords([data[i + 1].x, data[i + 1].y])[0]);
                vertices3.push(this.controller.threeViewer.getWorldCoords([data[i + 1].x, data[i + 1].y])[1]);
                vertices3.push(wallZbottomplus1);

                vertices3.push(this.controller.threeViewer.getWorldCoords([data[i + 1].x, data[i + 1].y])[0]);
                vertices3.push(this.controller.threeViewer.getWorldCoords([data[i + 1].x, data[i + 1].y])[1]);
                vertices3.push(wallZbottomplus1);

                vertices3.push(this.controller.threeViewer.getWorldCoords([data[i + 1].x, data[i + 1].y])[0]);
                vertices3.push(this.controller.threeViewer.getWorldCoords([data[i + 1].x, data[i + 1].y])[1]);
                vertices3.push(wallZtoplus1);

                vertices3.push(this.controller.threeViewer.getWorldCoords([data[i].x, data[i].y])[0]);
                vertices3.push(this.controller.threeViewer.getWorldCoords([data[i].x, data[i].y])[1]);
                vertices3.push(wallZtop);

                // Face 2
                vertices3.push(this.controller.threeViewer.getWorldCoords([data[i].x, data[i].y])[0]);
                vertices3.push(this.controller.threeViewer.getWorldCoords([data[i].x, data[i].y])[1]);
                vertices3.push(wallZtop);

                vertices3.push(this.controller.threeViewer.getWorldCoords([data[i + 1].x, data[i + 1].y])[0]);
                vertices3.push(this.controller.threeViewer.getWorldCoords([data[i + 1].x, data[i + 1].y])[1]);
                vertices3.push(wallZbottomplus1);

                vertices3.push(this.controller.threeViewer.getWorldCoords([data[i].x, data[i].y])[0]);
                vertices3.push(this.controller.threeViewer.getWorldCoords([data[i].x, data[i].y])[1]);
                vertices3.push(wallZbottom);

                vertices3.push(this.controller.threeViewer.getWorldCoords([data[i + 1].x, data[i + 1].y])[0]);
                vertices3.push(this.controller.threeViewer.getWorldCoords([data[i + 1].x, data[i + 1].y])[1]);
                vertices3.push(wallZbottomplus1);

                vertices3.push(this.controller.threeViewer.getWorldCoords([data[i].x, data[i].y])[0]);
                vertices3.push(this.controller.threeViewer.getWorldCoords([data[i].x, data[i].y])[1]);
                vertices3.push(wallZtop);

                vertices3.push(this.controller.threeViewer.getWorldCoords([data[i + 1].x, data[i + 1].y])[0]);
                vertices3.push(this.controller.threeViewer.getWorldCoords([data[i + 1].x, data[i + 1].y])[1]);
                vertices3.push(wallZtoplus1);

                // Ligne du premier quartile
                line3.push(new THREE.Vector3(
                    this.controller.threeViewer.getWorldCoords([data[i].x, data[i].y])[0],
                    this.controller.threeViewer.getWorldCoords([data[i].x, data[i].y])[1],
                    wallZbottom)
                );
            }
            for (let i = 0; i < (longueursData - 1); i++) {
                let liste = [];
                let listeplus1 = [];

                devicesData.forEach(data => {
                    liste.push(data[i].speed);
                    listeplus1.push(data[i + 1].speed);
                });

                const min = Math.min(...liste);
                const q1 = calculerPremierQuartile(liste);
                //const q2 = calculerMedian(liste);
                //const q3 = calculerTroisiemeQuartile(liste);

                const minplus1 = Math.min(...listeplus1);
                const q1plus1 = calculerPremierQuartile(listeplus1);
                //const q2plus1 = calculerMedian(listeplus1);
                //const q3plus1 = calculerTroisiemeQuartile(listeplus1);

                let wallZtop = q1 + min;
                let wallZbottom = min;
                let wallZtoplus1 = q1plus1 + minplus1;
                let wallZbottomplus1 = minplus1;

                let data = devicesData[0];

                //Face 1
                vertices4.push(this.controller.threeViewer.getWorldCoords([data[i].x, data[i].y])[0]);
                vertices4.push(this.controller.threeViewer.getWorldCoords([data[i].x, data[i].y])[1]);
                vertices4.push(wallZtop);

                vertices4.push(this.controller.threeViewer.getWorldCoords([data[i].x, data[i].y])[0]);
                vertices4.push(this.controller.threeViewer.getWorldCoords([data[i].x, data[i].y])[1]);
                vertices4.push(wallZbottom);

                vertices4.push(this.controller.threeViewer.getWorldCoords([data[i + 1].x, data[i + 1].y])[0]);
                vertices4.push(this.controller.threeViewer.getWorldCoords([data[i + 1].x, data[i + 1].y])[1]);
                vertices4.push(wallZbottomplus1);

                vertices4.push(this.controller.threeViewer.getWorldCoords([data[i + 1].x, data[i + 1].y])[0]);
                vertices4.push(this.controller.threeViewer.getWorldCoords([data[i + 1].x, data[i + 1].y])[1]);
                vertices4.push(wallZbottomplus1);

                vertices4.push(this.controller.threeViewer.getWorldCoords([data[i + 1].x, data[i + 1].y])[0]);
                vertices4.push(this.controller.threeViewer.getWorldCoords([data[i + 1].x, data[i + 1].y])[1]);
                vertices4.push(wallZtoplus1);

                vertices4.push(this.controller.threeViewer.getWorldCoords([data[i].x, data[i].y])[0]);
                vertices4.push(this.controller.threeViewer.getWorldCoords([data[i].x, data[i].y])[1]);
                vertices4.push(wallZtop);

                // Face 2
                vertices4.push(this.controller.threeViewer.getWorldCoords([data[i].x, data[i].y])[0]);
                vertices4.push(this.controller.threeViewer.getWorldCoords([data[i].x, data[i].y])[1]);
                vertices4.push(wallZtop);

                vertices4.push(this.controller.threeViewer.getWorldCoords([data[i + 1].x, data[i + 1].y])[0]);
                vertices4.push(this.controller.threeViewer.getWorldCoords([data[i + 1].x, data[i + 1].y])[1]);
                vertices4.push(wallZbottomplus1);

                vertices4.push(this.controller.threeViewer.getWorldCoords([data[i].x, data[i].y])[0]);
                vertices4.push(this.controller.threeViewer.getWorldCoords([data[i].x, data[i].y])[1]);
                vertices4.push(wallZbottom);

                vertices4.push(this.controller.threeViewer.getWorldCoords([data[i + 1].x, data[i + 1].y])[0]);
                vertices4.push(this.controller.threeViewer.getWorldCoords([data[i + 1].x, data[i + 1].y])[1]);
                vertices4.push(wallZbottomplus1);

                vertices4.push(this.controller.threeViewer.getWorldCoords([data[i].x, data[i].y])[0]);
                vertices4.push(this.controller.threeViewer.getWorldCoords([data[i].x, data[i].y])[1]);
                vertices4.push(wallZtop);

                vertices4.push(this.controller.threeViewer.getWorldCoords([data[i + 1].x, data[i + 1].y])[0]);
                vertices4.push(this.controller.threeViewer.getWorldCoords([data[i + 1].x, data[i + 1].y])[1]);
                vertices4.push(wallZtoplus1);

                // Ligne du min
                line4.push(new THREE.Vector3(
                    this.controller.threeViewer.getWorldCoords([data[i].x, data[i].y])[0],
                    this.controller.threeViewer.getWorldCoords([data[i].x, data[i].y])[1],
                    wallZbottom)
                );
            }

            for (let i = 0; i < (longueursData - 1); i++) {
                // Face 1
                colors1.push(0.0);
                colors1.push(1.0);
                colors1.push(0.0);

                colors1.push(0.2);
                colors1.push(0.8);
                colors1.push(0.0);

                colors1.push(0.2);
                colors1.push(0.8);
                colors1.push(0.0);

                colors1.push(0.2);
                colors1.push(0.8);
                colors1.push(0.0);

                colors1.push(0.0);
                colors1.push(1.0);
                colors1.push(0.0);

                colors1.push(0.0);
                colors1.push(1.0);
                colors1.push(0.0);

                //Face 2
                colors1.push(0.0);
                colors1.push(1.0);
                colors1.push(0.0);

                colors1.push(0.2);
                colors1.push(0.8);
                colors1.push(0.0);

                colors1.push(0.2);
                colors1.push(0.8);
                colors1.push(0.0);

                colors1.push(0.2);
                colors1.push(0.8);
                colors1.push(0.0);

                colors1.push(0.0);
                colors1.push(1.0);
                colors1.push(0.0);

                colors1.push(0.0);
                colors1.push(1.0);
                colors1.push(0.0);

                // Face 1
                colors2.push(0.2);
                colors2.push(0.8);
                colors2.push(0.0);

                colors2.push(0.4);
                colors2.push(0.6);
                colors2.push(0.0);

                colors2.push(0.4);
                colors2.push(0.6);
                colors2.push(0.0);

                colors2.push(0.4);
                colors2.push(0.6);
                colors2.push(0.0);

                colors2.push(0.2);
                colors2.push(0.8);
                colors2.push(0.0);

                colors2.push(0.2);
                colors2.push(0.8);
                colors2.push(0.0);

                //Face 2
                colors2.push(0.2);
                colors2.push(0.8);
                colors2.push(0.0);

                colors2.push(0.4);
                colors2.push(0.6);
                colors2.push(0.0);

                colors2.push(0.4);
                colors2.push(0.6);
                colors2.push(0.0);

                colors2.push(0.4);
                colors2.push(0.6);
                colors2.push(0.0);

                colors2.push(0.2);
                colors2.push(0.8);
                colors2.push(0.0);

                colors2.push(0.2);
                colors2.push(0.8);
                colors2.push(0.0);

                // Face 1
                colors3.push(0.4);
                colors3.push(0.6);
                colors3.push(0.0);

                colors3.push(0.6);
                colors3.push(0.4);
                colors3.push(0.0);

                colors3.push(0.6);
                colors3.push(0.4);
                colors3.push(0.0);

                colors3.push(0.6);
                colors3.push(0.4);
                colors3.push(0.0);

                colors3.push(0.4);
                colors3.push(0.6);
                colors3.push(0.0);

                colors3.push(0.4);
                colors3.push(0.6);
                colors3.push(0.0);

                //Face 2
                colors3.push(0.4);
                colors3.push(0.6);
                colors3.push(0.0);

                colors3.push(0.6);
                colors3.push(0.4);
                colors3.push(0.0);

                colors3.push(0.6);
                colors3.push(0.4);
                colors3.push(0.0);

                colors3.push(0.6);
                colors3.push(0.4);
                colors3.push(0.0);

                colors3.push(0.4);
                colors3.push(0.6);
                colors3.push(0.0);

                colors3.push(0.4);
                colors3.push(0.6);
                colors3.push(0.0);

                // Face 1
                colors4.push(0.6);
                colors4.push(0.4);
                colors4.push(0.0);

                colors4.push(0.8);
                colors4.push(0.2);
                colors4.push(0.0);

                colors4.push(0.8);
                colors4.push(0.2);
                colors4.push(0.0);

                colors4.push(0.8);
                colors4.push(0.2);
                colors4.push(0.0);

                colors4.push(0.6);
                colors4.push(0.4);
                colors4.push(0.0);

                colors4.push(0.6);
                colors4.push(0.4);
                colors4.push(0.0);

                //Face 2
                colors4.push(0.6);
                colors4.push(0.4);
                colors4.push(0.0);

                colors4.push(0.8);
                colors4.push(0.2);
                colors4.push(0.0);

                colors4.push(0.8);
                colors4.push(0.2);
                colors4.push(0.0);

                colors4.push(0.8);
                colors4.push(0.2);
                colors4.push(0.0);

                colors4.push(0.6);
                colors4.push(0.4);
                colors4.push(0.0);

                colors4.push(0.6);
                colors4.push(0.4);
                colors4.push(0.0);
            }

            // itemSize = 3 because there are 3 values (components) per vertex
            geometry1.setAttribute('position', new THREE.BufferAttribute(new Float32Array(vertices1), 3));
            geometry1.setAttribute('color', new THREE.BufferAttribute(new Float32Array(colors1), 3));

            geometry2.setAttribute('position', new THREE.BufferAttribute(new Float32Array(vertices2), 3));
            geometry2.setAttribute('color', new THREE.BufferAttribute(new Float32Array(colors2), 3));

            geometry3.setAttribute('position', new THREE.BufferAttribute(new Float32Array(vertices3), 3));
            geometry3.setAttribute('color', new THREE.BufferAttribute(new Float32Array(colors3), 3));

            geometry4.setAttribute('position', new THREE.BufferAttribute(new Float32Array(vertices4), 3));
            geometry4.setAttribute('color', new THREE.BufferAttribute(new Float32Array(colors4), 3));

            geometryLine1.setFromPoints(line1);
            geometryLine2.setFromPoints(line2);
            geometryLine3.setFromPoints(line3);
            geometryLine4.setFromPoints(line4);

            // create material
            const material = new THREE.MeshBasicMaterial({
                vertexColors: true,
                transparent: true,
                opacity: 0.8
            });

            let moustache1 = new THREE.Mesh(geometry1, material);
            let moustache2 = new THREE.Mesh(geometry2, material);
            let moustache3 = new THREE.Mesh(geometry3, material);
            let moustache4 = new THREE.Mesh(geometry4, material);

            let lineQ3 = new THREE.Line(geometryLine1, material);
            let lineQ2 = new THREE.Line(geometryLine2, material);
            let lineQ1 = new THREE.Line(geometryLine3, material);
            let lineQ0 = new THREE.Line(geometryLine4, material);

            this.visu_meshes.push(moustache1);
            this.visu_meshes.push(moustache2);
            this.visu_meshes.push(moustache3);
            this.visu_meshes.push(moustache4);

            this.visu_meshes.push(lineQ3);
            this.visu_meshes.push(lineQ2);
            this.visu_meshes.push(lineQ1);
            this.visu_meshes.push(lineQ0);

            this.controller.threeViewer.scene.add(moustache1);
            this.controller.threeViewer.scene.add(moustache2);
            this.controller.threeViewer.scene.add(moustache3);
            this.controller.threeViewer.scene.add(moustache4);

            this.controller.threeViewer.scene.add(lineQ3);
            this.controller.threeViewer.scene.add(lineQ2);
            this.controller.threeViewer.scene.add(lineQ1);
            this.controller.threeViewer.scene.add(lineQ0);
        },
        async addItineraireSpeedWall(deviceNumbers) {

            // supprime les objets de la visualisation s'il y en a (parfois des objets sont en cache)
            this.controller.threeViewer.shperes.forEach(sphere => {
                this.disposeThreeMesh(sphere.mesh);
                this.disposeThreeMesh(sphere.wall);
                this.disposeThreeMesh(sphere.line);
            })

            let indexVisu = 0;

            this.visu_function = this.addItineraireSpeedWall;

            this.devices = deviceNumbers;
            let moyennes
            let moyennesDict;

            let res = await this.getMoyenneDevice(this.devices);

            moyennes = res[0];
            moyennesDict = res[1];

            const medianMoyennes = asc(moyennes)[Math.round(moyennes.length / 2)];
            const deviceMedian = moyennesDict[medianMoyennes];

            const dataMedian = await getLiveDataDevice(deviceMedian);

            let speedsDataSorted = [];

            for (let i = 0; i < dataMedian.length; i++) {
                speedsDataSorted.push(dataMedian[i].speed);
            }

            // calcul des différents quartiles de la trajectoire qui a la vitesse moyenne médiane parmis les différentes trajectoires
            // on fait cela afin de réduire les disparités entre le rouge et le vert
            const min = Math.min(...speedsDataSorted);
            const q1 = calculerPremierQuartile(speedsDataSorted);
            const q2 = calculerMedian(speedsDataSorted);
            const q3 = calculerTroisiemeQuartile(speedsDataSorted);
            const max = Math.max(...speedsDataSorted);

            this.devices.forEach(async device => {

                const data = await getLiveDataDevice(device);

                let points = [];
                let pointsLine = [];
                let colors = [];
                let colorsLine = [];
                let speedsData = [];

                for (let i = 0; i < data.length; i++) {
                    speedsData.push(data[i].speed);
                }

                let speeds = [];

                // on normalise les vitesses par quartile afin de réduire les dispartités de couleurs
                for (let i = 0; i < speedsData.length; i++) {
                    if (speedsData[i] < q1) {
                        speeds.push((speedsData[i] - min) / (4 * (q1 - min)));
                    } else if (speedsData[i] < q2) {
                        speeds.push((speedsData[i] - q1) / (4 * (q2 - q1)) + 0.25);
                    } else if (speedsData[i] < q3) {
                        speeds.push((speedsData[i] - q2) / (4 * (q3 - q2)) + 0.5);
                    } else {
                        speeds.push((speedsData[i] - q3) / (4 * (max - q3)) + 0.75);
                    }
                }

                const wallZtop = 20 * (indexVisu + 1);
                const wallZbottom = 20 * indexVisu;

                // si l'utilisateur passe à la 2D on ajoute une ligne dont la couleur change en fonction de la vitesse
                if (this.dimension == 2) {
                    points = this.createPoints(data, 0);
                    colors = this.createColors(speeds);

                    let line3d = this.createLineColor(points, colors);
                    line3d.computeLineDistances();

                    //this.controller.threeViewer.scene.remove(line);

                    this.visu_meshes.push(line3d);

                    // add line to scene so it can be rendered
                    this.controller.threeViewer.scene.add(this.line3d);
                } else {
                    /* On dessine les lignes qui vont séparer les différentes portion du mur */
                    pointsLine = this.createPoints(data, wallZtop);
                    colorsLine = this.createColors(speeds);

                    let line3d = this.createLineColor(pointsLine, colorsLine);
                    line3d.computeLineDistances();

                    //this.controller.threeViewer.scene.remove(line);

                    this.visu_meshes.push(line3d);

                    // add line to scene so it can be rendered
                    this.controller.threeViewer.scene.add(line3d);

                    /* On dessine le mur */
                    let geometry = new THREE.BufferGeometry();

                    let vertices = [];
                    let colors = [];

                    for (let i = 0; i < (data.length - 1); i++) {
                        //Face 1
                        vertices.push(this.controller.threeViewer.getWorldCoords([data[i].x, data[i].y])[0]);
                        vertices.push(this.controller.threeViewer.getWorldCoords([data[i].x, data[i].y])[1]);
                        vertices.push(wallZtop);

                        vertices.push(this.controller.threeViewer.getWorldCoords([data[i].x, data[i].y])[0]);
                        vertices.push(this.controller.threeViewer.getWorldCoords([data[i].x, data[i].y])[1]);
                        vertices.push(wallZbottom);

                        vertices.push(this.controller.threeViewer.getWorldCoords([data[i + 1].x, data[i + 1].y])[0]);
                        vertices.push(this.controller.threeViewer.getWorldCoords([data[i + 1].x, data[i + 1].y])[1]);
                        vertices.push(wallZbottom);

                        vertices.push(this.controller.threeViewer.getWorldCoords([data[i + 1].x, data[i + 1].y])[0]);
                        vertices.push(this.controller.threeViewer.getWorldCoords([data[i + 1].x, data[i + 1].y])[1]);
                        vertices.push(wallZbottom);

                        vertices.push(this.controller.threeViewer.getWorldCoords([data[i + 1].x, data[i + 1].y])[0]);
                        vertices.push(this.controller.threeViewer.getWorldCoords([data[i + 1].x, data[i + 1].y])[1]);
                        vertices.push(wallZtop);

                        vertices.push(this.controller.threeViewer.getWorldCoords([data[i].x, data[i].y])[0]);
                        vertices.push(this.controller.threeViewer.getWorldCoords([data[i].x, data[i].y])[1]);
                        vertices.push(wallZtop);

                        // Face 2
                        vertices.push(this.controller.threeViewer.getWorldCoords([data[i].x, data[i].y])[0]);
                        vertices.push(this.controller.threeViewer.getWorldCoords([data[i].x, data[i].y])[1]);
                        vertices.push(wallZtop);

                        vertices.push(this.controller.threeViewer.getWorldCoords([data[i + 1].x, data[i + 1].y])[0]);
                        vertices.push(this.controller.threeViewer.getWorldCoords([data[i + 1].x, data[i + 1].y])[1]);
                        vertices.push(wallZbottom);

                        vertices.push(this.controller.threeViewer.getWorldCoords([data[i].x, data[i].y])[0]);
                        vertices.push(this.controller.threeViewer.getWorldCoords([data[i].x, data[i].y])[1]);
                        vertices.push(wallZbottom);

                        vertices.push(this.controller.threeViewer.getWorldCoords([data[i + 1].x, data[i + 1].y])[0]);
                        vertices.push(this.controller.threeViewer.getWorldCoords([data[i + 1].x, data[i + 1].y])[1]);
                        vertices.push(wallZbottom);

                        vertices.push(this.controller.threeViewer.getWorldCoords([data[i].x, data[i].y])[0]);
                        vertices.push(this.controller.threeViewer.getWorldCoords([data[i].x, data[i].y])[1]);
                        vertices.push(wallZtop);

                        vertices.push(this.controller.threeViewer.getWorldCoords([data[i + 1].x, data[i + 1].y])[0]);
                        vertices.push(this.controller.threeViewer.getWorldCoords([data[i + 1].x, data[i + 1].y])[1]);
                        vertices.push(wallZtop);
                    }

                    for (let i = 0; i < (data.length - 1); i++) {
                        // Face 1
                        colors.push(1.0 - speeds[i]);
                        colors.push(speeds[i]);
                        colors.push(0.0);

                        colors.push(1.0 - speeds[i]);
                        colors.push(speeds[i]);
                        colors.push(0.0);

                        colors.push(1.0 - speeds[i + 1]);
                        colors.push(speeds[i + 1]);
                        colors.push(0.0);

                        colors.push(1.0 - speeds[i + 1]);
                        colors.push(speeds[i + 1]);
                        colors.push(0.0);

                        colors.push(1.0 - speeds[i + 1]);
                        colors.push(speeds[i + 1]);
                        colors.push(0.0);

                        colors.push(1.0 - speeds[i]);
                        colors.push(speeds[i]);
                        colors.push(0.0);

                        //Face 2
                        colors.push(1.0 - speeds[i]);
                        colors.push(speeds[i]);
                        colors.push(0.0);

                        colors.push(1.0 - speeds[i + 1]);
                        colors.push(speeds[i + 1]);
                        colors.push(0.0);

                        colors.push(1.0 - speeds[i + 1]);
                        colors.push(speeds[i + 1]);
                        colors.push(0.0);

                        colors.push(1.0 - speeds[i + 1]);
                        colors.push(speeds[i + 1]);
                        colors.push(0.0);

                        colors.push(1.0 - speeds[i]);
                        colors.push(speeds[i]);
                        colors.push(0.0);

                        colors.push(1.0 - speeds[i + 1]);
                        colors.push(speeds[i + 1]);
                        colors.push(0.0);
                    }

                    // itemSize = 3 because there are 3 values (components) per vertex
                    geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(vertices), 3));
                    geometry.setAttribute('color', new THREE.BufferAttribute(new Float32Array(colors), 3));

                    // create material
                    const material = new THREE.MeshBasicMaterial({
                        vertexColors: true,
                        transparent: true,
                        opacity: 0.8
                    });

                    let wall = new THREE.Mesh(geometry, material);

                    this.visu_meshes.push(wall);

                    this.controller.threeViewer.scene.add(wall);

                    /* Création des sphères pour la simulation */
                    const geometrySphere = new THREE.SphereGeometry(7, 32, 16);
                    const materialSphere = new THREE.MeshBasicMaterial({ color: 0x0000ff });
                    const sphere = new THREE.Mesh(geometrySphere, materialSphere);

                    sphere.position.x = this.controller.threeViewer.getWorldCoords([data[0].x, data[0].y])[0];
                    sphere.position.y = this.controller.threeViewer.getWorldCoords([data[0].x, data[0].y])[1];
                    sphere.position.z = (wallZbottom + wallZtop) / 2;

                    this.controller.threeViewer.scene.add(sphere);

                    this.controller.threeViewer.shperes.push({ mesh: sphere, data: data, temps: 0, indexTraj: 0, indexPoint: 1, tempsBetweenPoints: 0, wall: this.wall, line: this.line3d, running: true });
                    this.controller.threeViewer.animeTrailer = true;
                    this.controller.threeViewer.state.clock.start();
                }

                indexVisu++;
            })

            return [min, max];
        },
        async addNightCoverage(deviceNumbers) {

            this.devices = deviceNumbers;
            this.visu_function = this.addNightCoverage;

            const date_nuit = "2021-03-07T21:57:00.000Z";
            const date_matin = "2021-04-07T05:53:00.000Z"

            const devices_data = await Promise.all(deviceNumbers.map(d => getLiveDataDevice(d)));

            const device_night = devices_data.map(t => {
                let i_debut = 0;
                for (let i = 0; i < t.length; i++) {
                    if (t[i].timestamp > date_nuit) {
                        i_debut = i;
                        break;
                    }
                }
                let i_fin = i_debut;
                for (let i = i_debut; i < t.length; i++) {
                    if (t[i].timestamp > date_matin) {
                        i_fin = i;
                        break;
                    }
                }
                return { i_debut: i_debut, i_fin: i_fin }
            })

            const trace_night = []

            for (let i = 0; i < devices_data[0].length; i++) {
                let cpt = 0;
                for (let j = 0; j < device_night.length; j++) {
                    if (i > device_night[j].i_debut && i < device_night[j].i_fin) {
                        cpt++;
                    }
                }
                trace_night.push(cpt);
            }

            const max_night = Math.max(...trace_night)

            let trace = devices_data[0];

            let shape = [];
            let color = [];

            for (let i = 0; i < trace.length - 2; i++) {

                let xA = this.controller.threeViewer.getWorldCoords([trace[i].x, trace[i].y])[0];
                let yA = this.controller.threeViewer.getWorldCoords([trace[i].x, trace[i].y])[1];
                let xB = this.controller.threeViewer.getWorldCoords([trace[i + 1].x, trace[i + 1].y])[0];
                let yB = this.controller.threeViewer.getWorldCoords([trace[i + 1].x, trace[i + 1].y])[1];
                let xC = this.controller.threeViewer.getWorldCoords([trace[i + 2].x, trace[i + 2].y])[0];
                let yC = this.controller.threeViewer.getWorldCoords([trace[i + 2].x, trace[i + 2].y])[1];
                let d = 5;
                let normAB = Math.sqrt(Math.pow(xB - xA, 2) + Math.pow(yB - yA, 2))
                let normBC = Math.sqrt(Math.pow(xB - xC, 2) + Math.pow(yB - yC, 2));

                if (normAB === 0) { continue }

                let ri = 0.0;
                let gi = 0.0;
                let bi = 0.0;

                let ri2 = 0.0;
                let gi2 = 0.0;
                let bi2 = 0.0;

                let indiceNuit = trace_night[i] / max_night;
                let indiceNuitPlus1 = trace_night[i + 1] / max_night;

                if (indiceNuit < 0.4) {
                    ri = indiceNuit / 0.4;
                    bi = 1.0 - indiceNuit / 0.4;
                    gi = 1.0 - indiceNuit / 0.6 / 1.5;
                } else {
                    ri = 1.0 - (indiceNuit - 0.4) / 0.6;
                }

                if (0.4 < indiceNuit < 0.6) {
                    gi = 1.0 - indiceNuit / 0.6;
                }

                if (indiceNuitPlus1 < 0.4) {
                    ri2 = indiceNuitPlus1 / 0.4;
                    bi2 = 1.0 - indiceNuitPlus1 / 0.4;
                    gi = 1.0 - indiceNuitPlus1 / 0.6 / 1.5;
                } else {
                    ri = 1.0 - (indiceNuitPlus1 - 0.4) / 0.6;
                }

                if (0.4 < indiceNuitPlus1 < 0.6) {
                    gi2 = 1.0 - indiceNuitPlus1 / 0.6;
                }

                shape.push(
                    xA + d * Math.cos((xB - xA) / normAB) * Math.sin((yB - yA) / normAB),
                    yA - d * Math.sin((xB - xA) / normAB) * Math.cos((yB - yA) / normAB), 0)
                shape.push(
                    xB + d * Math.cos((xB - xA) / normAB) * Math.sin((yB - yA) / normAB),
                    yB - d * Math.sin((xB - xA) / normAB) * Math.cos((yB - yA) / normAB), 0)
                shape.push(
                    xB - d * Math.cos((xB - xA) / normAB) * Math.sin((yB - yA) / normAB),
                    yB + d * Math.sin((xB - xA) / normAB) * Math.cos((yB - yA) / normAB), 0)
                color.push(ri, gi, bi)
                color.push(ri2, gi2, bi2)
                color.push(ri2, gi2, bi2)


                shape.push(
                    xA + d * Math.cos((xB - xA) / normAB) * Math.sin((yB - yA) / normAB),
                    yA - d * Math.sin((xB - xA) / normAB) * Math.cos((yB - yA) / normAB), 0)
                shape.push(
                    xB - d * Math.cos((xB - xA) / normAB) * Math.sin((yB - yA) / normAB),
                    yB + d * Math.sin((xB - xA) / normAB) * Math.cos((yB - yA) / normAB), 0)
                shape.push(
                    xA - d * Math.cos((xB - xA) / normAB) * Math.sin((yB - yA) / normAB),
                    yA + d * Math.sin((xB - xA) / normAB) * Math.cos((yB - yA) / normAB), 0)
                color.push(ri, gi, bi)
                color.push(ri2, gi2, bi2)
                color.push(ri, gi, bi)


                if (normAB != 0 && normBC != 0 && d != 0) {
                    shape.push(xB, yB, 0);
                    shape.push(
                        xB - d * Math.cos((xC - xB) / normBC) * Math.sin((yC - yB) / normBC),
                        yB + d * Math.sin((xC - xB) / normBC) * Math.cos((yC - yB) / normBC), 0)
                    shape.push(
                        xB - d * Math.cos((xB - xA) / normAB) * Math.sin((yB - yA) / normAB),
                        yB + d * Math.sin((xB - xA) / normAB) * Math.cos((yB - yA) / normAB), 0)
                    color.push(ri2, gi2, bi2)
                    color.push(ri2, gi2, bi2)
                    color.push(ri2, gi2, bi2)

                    shape.push(xB, yB, 0);
                    shape.push(
                        xB + d * Math.cos((xB - xA) / normAB) * Math.sin((yB - yA) / normAB),
                        yB - d * Math.sin((xB - xA) / normAB) * Math.cos((yB - yA) / normAB), 0)
                    shape.push(
                        xB + d * Math.cos((xC - xB) / normBC) * Math.sin((yC - yB) / normBC),
                        yB - d * Math.sin((xC - xB) / normBC) * Math.cos((yC - yB) / normBC), 0)
                    color.push(ri2, gi2, bi2)
                    color.push(ri2, gi2, bi2)
                    color.push(ri2, gi2, bi2)
                }
            }

            const material = new THREE.MeshBasicMaterial({
                vertexColors: true,
            });
            const geometry = new THREE.BufferGeometry();
            geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(shape), 3));
            geometry.setAttribute('color', new THREE.BufferAttribute(new Float32Array(color), 3));

            let visu_mesh = new THREE.Mesh(geometry, material);
            this.visu_meshes.push(visu_mesh)
            this.controller.threeViewer.scene.add(visu_mesh);
        },
        displayVisuSimple() {
            this.toast.removeAllGroups();
            this.visuFunction = this.displayVisuSimple;
            this.toast.add({ severity: 'info', summary: 'Info', detail: "La trajectoire mesurée par le GPS est affichée.", life: 10000 });
            this.addItineraire(this.devices);
        },
        displayVisuEpaisseur() {
            this.toast.removeAllGroups();
            this.visuFunction = this.displayVisuEpaisseur;

            if (this.devices.length > 1)
                this.toast.add({ severity: 'warn', summary: 'Warn', detail: "Vous devez choisir une seule devices pour afficher cette visualisation.", life: 3000 });
            else
                this.toast.add({ severity: 'info', summary: 'Info', detail: "Cette visualisation permet de voir la vitesse des coureurs sur le parcours, plus la ligne est épaisse plus le coureur est rapide.", life: 10000 });

            this.addItineraireEpaisseur(this.devices);

            this.isLegend = true;
        },
        displayVisuMur() {
            this.toast.removeAllGroups();
            this.visuFunction = this.displayVisuMur;

            this.toast.add({ severity: 'info', summary: 'Info', detail: "Visualisation 2D+1 qui permet de comparer les vitesses des différentes équipes.", life: 10000 });
            this.addItineraireSpeedWall(this.devices);

            this.addItineraireSpeedWall(this.devices).then(res => {
                this.minLegend = tronquer(res[0], 2);
                this.maxLegend = tronquer(res[1], 2);
            });

            this.dimension = 3;
            this.createDimensionEnvironment(3);

            if (this.dimension == 3)
                this.isLegend = true;
        },
        displayVisuMoustache() {
            this.toast.removeAllGroups();
            this.visuFunction = this.displayVisuMoustache;

            this.toast.add({ severity: 'info', summary: 'Info', detail: "Visualisation 2D+1 de boîtes à moustache", life: 10000 });
            this.addItineraireMoustache(this.devices);

            this.addItineraireMoustache(this.devices);

            this.dimension = 3;
            this.createDimensionEnvironment(3);

            if (this.dimension == 3)
                this.isLegend = true;
        },
        displayVisuNuit() {
            this.toast.removeAllGroups();
            this.visuFunction = this.displayVisuNuit;

            if (this.devices.length === 0)
                this.toast.add({ severity: 'warn', summary: 'Warn', detail: "Vous devez choisir au moins un device pour afficher cette visualisation.", life: 3000 });
            else
                this.toast.add({ severity: 'info', summary: 'Info', detail: "Cette visualisation permet de voir les portions du parcours sur lesquelles les coureurs se deplacent la nuit.", life: 10000 });

            this.addNightCoverage(this.devices);

            this.isLegend = true;
        },
    }
};
</script>