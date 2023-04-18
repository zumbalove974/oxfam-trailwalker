<template>
    <input @click="display" type="radio" v-model="selectedCategory" :inputId="category.key" name="visualisation"
        :value="category.name" />
    <label :for="category.key" class="ml-2" style="margin-left: 1rem;">{{ category.name }}</label>
</template>

<script>

import { toRaw } from 'vue';
import { getLiveDataDevice } from "../client/bddConnexion";
import { asc, calculerPremierQuartile, calculerMedian, calculerTroisiemeQuartile } from "../client/mathUtils.js";

import * as THREE from "three";

import { tronquer } from "../client/mathUtils";

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
                '6': this.displayDifficultyInfo
            },
        }
    },
    mounted() {
        /*
        this.controller.then(res => {
            this.controller = res
        })*/
        this.toast = useToast();
    },
    methods: {
        display() {
            toRaw(this.functions[toRaw(this.category).key])();
            this.visu_function = this.functions[toRaw(this.category).key];
            this.$emit("data", [this.visu_meshes, this.visu_function]);
        },
        createPoints2D(data, z) {
            const points = [];

            for (let i = 0; i < data.length; i++) {
                points.push(this.controller.threeViewer.getWorldCoords([data[i].x, data[i].y])[0]);
                points.push(this.controller.threeViewer.getWorldCoords([data[i].x, data[i].y])[1]);
                points.push(z);
            }

            return points;
        },
        createColors2D(speeds) {
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

            /* Normalisation des vitesses pour les utiliser dans les couleurs */
            for (let i = 0; i < speeds.length; i++) {
                speeds[i] = (speeds[i] - min) / (max - min);
            }

            if (this.dimension == 2) {
                const points = this.createPoints2D(data, 0);
                const colors = this.createColors2D(speeds);

                let line3d = this.createLineColor(points, colors);
                line3d.computeLineDistances();

                //this.controller.threeViewer.scene.remove(line);

                this.visu_meshes.push(line3d);

                // add line to scene so it can be rendered
                this.controller.threeViewer.scene.add(line3d);
            } else {

                let geometry = new THREE.BufferGeometry();
                // create a simple square shape. We duplicate the top left and bottom right
                // vertices because each vertex needs to appear once per triangle.
                let vertices = [];
                let colors = [];
                const maxZ = 50;

                console.log("points", data)
                for (let i = 0; i < (data.length - 1); i++) {
                    //Face 1
                    vertices.push(this.controller.threeViewer.getWorldCoords([data[i].x, data[i].y])[0]);
                    vertices.push(this.controller.threeViewer.getWorldCoords([data[i].x, data[i].y])[1]);
                    vertices.push(data[i].speed / max * maxZ);

                    vertices.push(this.controller.threeViewer.getWorldCoords([data[i].x, data[i].y])[0]);
                    vertices.push(this.controller.threeViewer.getWorldCoords([data[i].x, data[i].y])[1]);
                    vertices.push(0);

                    vertices.push(this.controller.threeViewer.getWorldCoords([data[i + 1].x, data[i + 1].y])[0]);
                    vertices.push(this.controller.threeViewer.getWorldCoords([data[i + 1].x, data[i + 1].y])[1]);
                    vertices.push(0);

                    vertices.push(this.controller.threeViewer.getWorldCoords([data[i + 1].x, data[i + 1].y])[0]);
                    vertices.push(this.controller.threeViewer.getWorldCoords([data[i + 1].x, data[i + 1].y])[1]);
                    vertices.push(0);

                    vertices.push(this.controller.threeViewer.getWorldCoords([data[i + 1].x, data[i + 1].y])[0]);
                    vertices.push(this.controller.threeViewer.getWorldCoords([data[i + 1].x, data[i + 1].y])[1]);
                    vertices.push(data[i + 1].speed / max * maxZ);

                    vertices.push(this.controller.threeViewer.getWorldCoords([data[i].x, data[i].y])[0]);
                    vertices.push(this.controller.threeViewer.getWorldCoords([data[i].x, data[i].y])[1]);
                    vertices.push(data[i].speed / max * maxZ);

                    // Face 2
                    vertices.push(this.controller.threeViewer.getWorldCoords([data[i].x, data[i].y])[0]);
                    vertices.push(this.controller.threeViewer.getWorldCoords([data[i].x, data[i].y])[1]);
                    vertices.push(data[i].speed / max * maxZ);

                    vertices.push(this.controller.threeViewer.getWorldCoords([data[i + 1].x, data[i + 1].y])[0]);
                    vertices.push(this.controller.threeViewer.getWorldCoords([data[i + 1].x, data[i + 1].y])[1]);
                    vertices.push(0);

                    vertices.push(this.controller.threeViewer.getWorldCoords([data[i].x, data[i].y])[0]);
                    vertices.push(this.controller.threeViewer.getWorldCoords([data[i].x, data[i].y])[1]);
                    vertices.push(0);

                    vertices.push(this.controller.threeViewer.getWorldCoords([data[i + 1].x, data[i + 1].y])[0]);
                    vertices.push(this.controller.threeViewer.getWorldCoords([data[i + 1].x, data[i + 1].y])[1]);
                    vertices.push(0);

                    vertices.push(this.controller.threeViewer.getWorldCoords([data[i].x, data[i].y])[0]);
                    vertices.push(this.controller.threeViewer.getWorldCoords([data[i].x, data[i].y])[1]);
                    vertices.push(data[i].speed / max * maxZ);

                    vertices.push(this.controller.threeViewer.getWorldCoords([data[i + 1].x, data[i + 1].y])[0]);
                    vertices.push(this.controller.threeViewer.getWorldCoords([data[i + 1].x, data[i + 1].y])[1]);
                    vertices.push(data[i + 1].speed / max * maxZ);
                }

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
                    transparent: true,
                    opacity: 0.8
                });

                let mesh = new THREE.Mesh(geometry, material);

                this.visu_meshes.push(mesh);

                this.controller.threeViewer.scene.add(mesh);
            }

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
                        0));
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
        disposeThreeMesh(mesh) {
            mesh.geometry.dispose();
            mesh.material.dispose();
            this.controller.threeViewer.scene.remove(mesh);
        },
        async getVitesseMoyenne(device) {
            const data = await getLiveDataDevice(device);

            let somme = 0;

            data.forEach(point => {
                somme += point.speed;
            })

            return somme / data.length;
        },
        async addItineraireSpeedWall(deviceNumbers) {

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

                if (this.dimension == 2) {
                    points = this.createPoints2D(data, 0);
                    colors = this.createColors2D(speeds);

                    let line3d = this.createLineColor(points, colors);
                    line3d.computeLineDistances();

                    //this.controller.threeViewer.scene.remove(line);

                    this.visu_meshes.push(line3d);

                    // add line to scene so it can be rendered
                    this.controller.threeViewer.scene.add(this.line3d);
                } else {
                    /* On dessine les lignes qui vont séparer les différentes portion du mur */
                    pointsLine = this.createPoints2D(data, wallZtop);
                    colorsLine = this.createColors2D(speeds);

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

            this.isLegend = true;
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

                shape.push(
                    xA + d * Math.cos((xB - xA) / normAB) * Math.sin((yB - yA) / normAB),
                    yA - d * Math.sin((xB - xA) / normAB) * Math.cos((yB - yA) / normAB), 0)
                shape.push(
                    xB + d * Math.cos((xB - xA) / normAB) * Math.sin((yB - yA) / normAB),
                    yB - d * Math.sin((xB - xA) / normAB) * Math.cos((yB - yA) / normAB), 0)
                shape.push(
                    xB - d * Math.cos((xB - xA) / normAB) * Math.sin((yB - yA) / normAB),
                    yB + d * Math.sin((xB - xA) / normAB) * Math.cos((yB - yA) / normAB), 0)
                color.push(
                    1 - trace_night[i] / max_night, 1 - trace_night[i] / max_night, 1 - trace_night[i] / max_night)
                color.push(
                    1 - trace_night[i + 1] / max_night, 1 - trace_night[i + 1] / max_night, 1 - trace_night[i + 1] / max_night)
                color.push(
                    1 - trace_night[i + 1] / max_night, 1 - trace_night[i + 1] / max_night, 1 - trace_night[i + 1] / max_night)


                shape.push(
                    xA + d * Math.cos((xB - xA) / normAB) * Math.sin((yB - yA) / normAB),
                    yA - d * Math.sin((xB - xA) / normAB) * Math.cos((yB - yA) / normAB), 0)
                shape.push(
                    xB - d * Math.cos((xB - xA) / normAB) * Math.sin((yB - yA) / normAB),
                    yB + d * Math.sin((xB - xA) / normAB) * Math.cos((yB - yA) / normAB), 0)
                shape.push(
                    xA - d * Math.cos((xB - xA) / normAB) * Math.sin((yB - yA) / normAB),
                    yA + d * Math.sin((xB - xA) / normAB) * Math.cos((yB - yA) / normAB), 0)
                color.push(
                    1 - trace_night[i] / max_night, 1 - trace_night[i] / max_night, 1 - trace_night[i] / max_night)
                color.push(
                    1 - trace_night[i + 1] / max_night, 1 - trace_night[i + 1] / max_night, 1 - trace_night[i + 1] / max_night)
                color.push(
                    1 - trace_night[i] / max_night, 1 - trace_night[i] / max_night, 1 - trace_night[i] / max_night)


                if (normAB != 0 && normBC != 0 && d != 0) {
                    shape.push(xB, yB, 0);
                    shape.push(
                        xB - d * Math.cos((xC - xB) / normBC) * Math.sin((yC - yB) / normBC),
                        yB + d * Math.sin((xC - xB) / normBC) * Math.cos((yC - yB) / normBC), 0)
                    shape.push(
                        xB - d * Math.cos((xB - xA) / normAB) * Math.sin((yB - yA) / normAB),
                        yB + d * Math.sin((xB - xA) / normAB) * Math.cos((yB - yA) / normAB), 0)
                    color.push(
                        1 - trace_night[i + 1] / max_night, 1 - trace_night[i + 1] / max_night, 1 - trace_night[i + 1] / max_night)
                    color.push(
                        1 - trace_night[i + 1] / max_night, 1 - trace_night[i + 1] / max_night, 1 - trace_night[i + 1] / max_night)
                    color.push(
                        1 - trace_night[i + 1] / max_night, 1 - trace_night[i + 1] / max_night, 1 - trace_night[i + 1] / max_night)

                    shape.push(xB, yB, 0);
                    shape.push(
                        xB + d * Math.cos((xB - xA) / normAB) * Math.sin((yB - yA) / normAB),
                        yB - d * Math.sin((xB - xA) / normAB) * Math.cos((yB - yA) / normAB), 0)
                    shape.push(
                        xB + d * Math.cos((xC - xB) / normBC) * Math.sin((yC - yB) / normBC),
                        yB - d * Math.sin((xC - xB) / normBC) * Math.cos((yC - yB) / normBC), 0)
                    color.push(
                        1 - trace_night[i + 1] / max_night, 1 - trace_night[i + 1] / max_night, 1 - trace_night[i + 1] / max_night)
                    color.push(
                        1 - trace_night[i + 1] / max_night, 1 - trace_night[i + 1] / max_night, 1 - trace_night[i + 1] / max_night)
                    color.push(
                        1 - trace_night[i + 1] / max_night, 1 - trace_night[i + 1] / max_night, 1 - trace_night[i + 1] / max_night)
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

        async addDifficultyInfo(deviceNumbers) {

            this.devices = deviceNumbers;
            this.visu_function = this.addDifficultyInfo;

            const traj_data = await fetch(`http://localhost:5500/traj`, {
                method: 'GET'
            }).then(response => response.json())
            const cp_data = await fetch(`http://localhost:5500/cp`, {
                method: 'GET'
            }).then(response => response.json())

            // Detection CP
            const cp_points = [];
            for (let c = 0; c < cp_data.length - 1; c++) {
                let cp = [];
                for (let t = 0; t < traj_data.length; t++) {
                    if (t > cp_data[c][5] && t < cp_data[c + 1][4]) {
                        cp.push(t);
                    }
                }
                cp_points.push(cp)
            }
            for (let c = 0; c < cp_points.length; c++) {

                let shape = [];
                let color = [];

                for (let j = 0; j < cp_points[c].length - 2; j++) {
                    let i = cp_points[c][j];

                    let xA = this.controller.threeViewer.getWorldCoords([traj_data[i].x, traj_data[i].y])[0];
                    let yA = this.controller.threeViewer.getWorldCoords([traj_data[i].x, traj_data[i].y])[1];
                    let xB = this.controller.threeViewer.getWorldCoords([traj_data[i + 1].x, traj_data[i + 1].y])[0];
                    let yB = this.controller.threeViewer.getWorldCoords([traj_data[i + 1].x, traj_data[i + 1].y])[1];
                    let xC = this.controller.threeViewer.getWorldCoords([traj_data[i + 2].x, traj_data[i + 2].y])[0];
                    let yC = this.controller.threeViewer.getWorldCoords([traj_data[i + 2].x, traj_data[i + 2].y])[1];
                    let d = 5;
                    let normAB = Math.sqrt(Math.pow(xB - xA, 2) + Math.pow(yB - yA, 2))
                    let normBC = Math.sqrt(Math.pow(xB - xC, 2) + Math.pow(yB - yC, 2));

                    if (normAB === 0) { continue }

                    shape.push(
                        xA + d * Math.cos((xB - xA) / normAB) * Math.sin((yB - yA) / normAB),
                        yA - d * Math.sin((xB - xA) / normAB) * Math.cos((yB - yA) / normAB), 0)
                    shape.push(
                        xB + d * Math.cos((xB - xA) / normAB) * Math.sin((yB - yA) / normAB),
                        yB - d * Math.sin((xB - xA) / normAB) * Math.cos((yB - yA) / normAB), 0)
                    shape.push(
                        xB - d * Math.cos((xB - xA) / normAB) * Math.sin((yB - yA) / normAB),
                        yB + d * Math.sin((xB - xA) / normAB) * Math.cos((yB - yA) / normAB), 0)

                    for (let k = 0; k < 3; k++) {
                        color.push(
                            1,
                            1 - (cp_data[c][6] + 1) / 6,
                            1 - (cp_data[c][6] + 1) / 6
                        )
                    }

                    shape.push(
                        xA + d * Math.cos((xB - xA) / normAB) * Math.sin((yB - yA) / normAB),
                        yA - d * Math.sin((xB - xA) / normAB) * Math.cos((yB - yA) / normAB), 0)
                    shape.push(
                        xB - d * Math.cos((xB - xA) / normAB) * Math.sin((yB - yA) / normAB),
                        yB + d * Math.sin((xB - xA) / normAB) * Math.cos((yB - yA) / normAB), 0)
                    shape.push(
                        xA - d * Math.cos((xB - xA) / normAB) * Math.sin((yB - yA) / normAB),
                        yA + d * Math.sin((xB - xA) / normAB) * Math.cos((yB - yA) / normAB), 0)

                    for (let k = 0; k < 3; k++) {
                        color.push(
                            1,
                            1 - (cp_data[c][6] + 1) / 6,
                            1 - (cp_data[c][6] + 1) / 6
                        )
                    }

                    if (normAB != 0 && normBC != 0 && d != 0) {
                        shape.push(xB, yB, 0);
                        shape.push(
                            xB - d * Math.cos((xC - xB) / normBC) * Math.sin((yC - yB) / normBC),
                            yB + d * Math.sin((xC - xB) / normBC) * Math.cos((yC - yB) / normBC), 0)
                        shape.push(
                            xB - d * Math.cos((xB - xA) / normAB) * Math.sin((yB - yA) / normAB),
                            yB + d * Math.sin((xB - xA) / normAB) * Math.cos((yB - yA) / normAB), 0)
                        for (let k = 0; k < 3; k++) {
                            color.push(
                                1,
                                1 - (cp_data[c][6] + 1) / 6,
                                1 - (cp_data[c][6] + 1) / 6
                            )
                        }

                        shape.push(xB, yB, 0);
                        shape.push(
                            xB + d * Math.cos((xB - xA) / normAB) * Math.sin((yB - yA) / normAB),
                            yB - d * Math.sin((xB - xA) / normAB) * Math.cos((yB - yA) / normAB), 0)
                        shape.push(
                            xB + d * Math.cos((xC - xB) / normBC) * Math.sin((yC - yB) / normBC),
                            yB - d * Math.sin((xC - xB) / normBC) * Math.cos((yC - yB) / normBC), 0)
                        for (let k = 0; k < 3; k++) {
                            color.push(
                                1,
                                1 - (cp_data[c][6] + 1) / 6,
                                1 - (cp_data[c][6] + 1) / 6
                            )
                        }
                    }
                }

                let material = new THREE.MeshBasicMaterial({
                    vertexColors: true,
                });
                let geometry = new THREE.BufferGeometry();
                geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(shape), 3));
                geometry.setAttribute('color', new THREE.BufferAttribute(new Float32Array(color), 3));

                let visu_mesh = new THREE.Mesh(geometry, material);
                visu_mesh.cp = c;
                this.visu_meshes.push(visu_mesh)
                this.controller.threeViewer.scene.add(visu_mesh);
            }
        },
        displayDifficultyInfo() {
            this.toast.removeAllGroups();
            this.visuFunction = this.displayDifficultyInfo;

            if (this.devices.length === 0)
                this.toast.add({ severity: 'warn', summary: 'Warn', detail: "Vous devez choisir au moins un device pour afficher cette visualisation.", life: 3000 });
            else
                this.toast.add({ severity: 'info', summary: 'Info', detail: "Cette visualisation permet de voir les portions du parcours sur lesquelles les coureurs se deplacent la nuit.", life: 10000 });

            this.addDifficultyInfo(this.devices);
            this.isLegend = true;
        },
    }
};
</script>